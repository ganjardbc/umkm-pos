import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateUserOutletAccess(userId: string, outletId: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    const outlet = await this.prisma.outlets.findUnique({ where: { id: outletId } });
    if (!user || !outlet || user.merchant_id !== outlet.merchant_id) {
      throw new ForbiddenException('You do not have access to this outlet');
    }
  }

  async findAll(userId: string, outletId: string | undefined, query: ListNotificationsDto) {
    if (outletId) {
      await this.validateUserOutletAccess(userId, outletId);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(query.unread ? { is_read: false } : {}),
    };

    if (outletId) {
      where.OR = [
        { user_id: userId },
        { outlet_id: outletId, user_id: null },
      ];
    } else {
      where.user_id = userId;
    }

    const unreadWhere: any = {
      is_read: false,
    };
    if (outletId) {
      unreadWhere.OR = [
        { user_id: userId },
        { outlet_id: outletId, user_id: null },
      ];
    } else {
      unreadWhere.user_id = userId;
    }

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notifications.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: limit }),
      this.prisma.notifications.count({ where }),
      this.prisma.notifications.count({ where: unreadWhere }),
    ]);

    return { data, meta: { total, page, limit, unreadCount } };
  }

  async findOne(id: string, userId: string, outletId: string | undefined) {
    if (outletId) {
      await this.validateUserOutletAccess(userId, outletId);
    }

    const notification = await this.prisma.notifications.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    
    const isUserMatch = notification.user_id === userId;
    const isOutletMatch = outletId && notification.outlet_id === outletId && notification.user_id === null;

    if (!isUserMatch && !isOutletMatch) {
      throw new ForbiddenException('You are not allowed to access this notification');
    }
    return notification;
  }

  async markAsRead(id: string, userId: string, outletId: string | undefined) {
    await this.findOne(id, userId, outletId);
    return this.prisma.notifications.update({ where: { id }, data: { is_read: true, updated_at: new Date() } });
  }

  async markAllAsRead(userId: string, outletId: string | undefined) {
    if (outletId) {
      await this.validateUserOutletAccess(userId, outletId);
    }

    const where: any = {
      is_read: false,
    };
    if (outletId) {
      where.OR = [
        { user_id: userId },
        { outlet_id: outletId, user_id: null },
      ];
    } else {
      where.user_id = userId;
    }

    const result = await this.prisma.notifications.updateMany({
      where,
      data: { is_read: true, updated_at: new Date() },
    });

    return { updated: result.count };
  }

  async create(data: any) {
    return this.prisma.notifications.create({
      data,
    });
  }
}
