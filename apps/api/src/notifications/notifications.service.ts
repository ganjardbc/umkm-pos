import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    merchantId: string,
    outletId: string | undefined,
    query: ListNotificationsDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      user_id: userId,
      merchant_id: merchantId,
      ...(outletId ? { outlet_id: outletId } : {}),
      ...(query.unread ? { is_read: false } : {}),
    };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notifications.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notifications.count({ where }),
      this.prisma.notifications.count({
        where: {
          user_id: userId,
          merchant_id: merchantId,
          ...(outletId ? { outlet_id: outletId } : {}),
          is_read: false,
        },
      }),
    ]);

    return { data, meta: { total, page, limit, unreadCount } };
  }

  async findOne(
    id: string,
    userId: string,
    merchantId: string,
    outletId: string | undefined,
  ) {
    const notification = await this.prisma.notifications.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (
      notification.user_id !== userId ||
      notification.merchant_id !== merchantId ||
      (outletId && notification.outlet_id !== outletId)
    ) {
      throw new ForbiddenException(
        'You are not allowed to access this notification',
      );
    }
    return notification;
  }

  async markAsRead(
    id: string,
    userId: string,
    merchantId: string,
    outletId: string | undefined,
  ) {
    await this.findOne(id, userId, merchantId, outletId);
    return this.prisma.notifications.update({
      where: { id },
      data: { is_read: true, updated_at: new Date() },
    });
  }

  async markAllAsRead(
    userId: string,
    merchantId: string,
    outletId: string | undefined,
  ) {
    const result = await this.prisma.notifications.updateMany({
      where: {
        user_id: userId,
        merchant_id: merchantId,
        ...(outletId ? { outlet_id: outletId } : {}),
        is_read: false,
      },
      data: { is_read: true, updated_at: new Date() },
    });

    return { updated: result.count };
  }

  private async assertOutletBelongsToMerchant(
    outletId: string,
    merchantId: string,
  ) {
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId, merchant_id: merchantId },
    });
    if (!outlet) {
      throw new UnauthorizedException(
        `Outlet with ID ${outletId} does not belong to your merchant`,
      );
    }
    return outlet;
  }

  async notifyOutletUsers(
    outletId: string,
    merchantId: string,
    payload: { title: string; message: string; type?: string },
    requiredPermission?: string,
  ) {
    await this.assertOutletBelongsToMerchant(outletId, merchantId);

    const userRoles = await this.prisma.user_roles.findMany({
      where: {
        outlet_id: outletId,
        ...(requiredPermission
          ? {
              roles: {
                role_permissions: {
                  some: { permissions: { code: requiredPermission } },
                },
              },
            }
          : {}),
      },
      select: { user_id: true },
      distinct: ['user_id'],
    });

    if (userRoles.length === 0) return;

    await this.prisma.notifications.createMany({
      data: userRoles.map((role) => ({
        user_id: role.user_id,
        outlet_id: outletId,
        merchant_id: merchantId,
        title: payload.title,
        message: payload.message,
        type: payload.type ?? 'general',
      })),
    });
  }
}
