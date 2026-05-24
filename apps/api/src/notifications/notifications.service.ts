import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { FindNotificationsDto } from './dto/find-notifications.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveScopedOutletIds(userId: string, merchantId: string) {
    const userOutletRoles = await this.prisma.user_roles.findMany({
      where: { user_id: userId },
      include: { outlets: true },
    });

    return userOutletRoles
      .filter((role) => role.outlets.merchant_id === merchantId)
      .map((role) => role.outlet_id);
  }

  async findAll(userId: string, merchantId: string, dto: FindNotificationsDto) {
    const outletIds = await this.resolveScopedOutletIds(userId, merchantId);

    const where = {
      OR: [{ user_id: userId }, { outlet_id: { in: outletIds } }],
      ...(dto.unread === true ? { is_read: false } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.notifications.findMany({
        where,
        skip: dto.skip,
        take: dto.limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notifications.count({ where }),
    ]);

    return {
      data,
      meta: PaginationDto.calculateMeta(total, dto.page ?? 1, dto.limit ?? 10),
    };
  }

  async findOne(id: string, userId: string, merchantId: string) {
    const notification = await this.prisma.notifications.findUnique({ where: { id } });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    const outletIds = await this.resolveScopedOutletIds(userId, merchantId);
    const canAccess = notification.user_id === userId || (notification.outlet_id && outletIds.includes(notification.outlet_id));

    if (!canAccess) {
      throw new ForbiddenException('You do not have access to this notification');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string, merchantId: string) {
    await this.findOne(id, userId, merchantId);

    return this.prisma.notifications.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async markAllAsRead(userId: string, merchantId: string) {
    const outletIds = await this.resolveScopedOutletIds(userId, merchantId);

    const result = await this.prisma.notifications.updateMany({
      where: {
        OR: [{ user_id: userId }, { outlet_id: { in: outletIds } }],
        is_read: false,
      },
      data: { is_read: true },
    });

    return { updated: result.count };
  }
}
