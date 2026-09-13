import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notifications: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      createMany: jest.Mock;
    };
    outlets: { findFirst: jest.Mock };
    user_roles: { findMany: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      notifications: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        createMany: jest.fn(),
      },
      outlets: { findFirst: jest.fn() },
      user_roles: { findMany: jest.fn() },
    };

    service = new NotificationsService(prisma as any);
  });

  describe('findAll', () => {
    beforeEach(() => {
      prisma.notifications.findMany.mockResolvedValue([]);
      prisma.notifications.count.mockResolvedValue(0);
    });

    it('scopes the list query and the separate unreadCount query by merchant_id, with no outlet filter when outletId is absent', async () => {
      await service.findAll('user-1', 'merchant-1', undefined, {});

      expect(prisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user-1', merchant_id: 'merchant-1' },
        }),
      );
      expect(prisma.notifications.count).toHaveBeenNthCalledWith(1, {
        where: { user_id: 'user-1', merchant_id: 'merchant-1' },
      });
      expect(prisma.notifications.count).toHaveBeenNthCalledWith(2, {
        where: {
          user_id: 'user-1',
          merchant_id: 'merchant-1',
          is_read: false,
        },
      });
    });

    it('applies the outlet filter to both the list query and the unreadCount query when outletId is present', async () => {
      await service.findAll('user-1', 'merchant-1', 'outlet-1', {});

      expect(prisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user_id: 'user-1',
            merchant_id: 'merchant-1',
            outlet_id: 'outlet-1',
          },
        }),
      );
      expect(prisma.notifications.count).toHaveBeenNthCalledWith(2, {
        where: {
          user_id: 'user-1',
          merchant_id: 'merchant-1',
          outlet_id: 'outlet-1',
          is_read: false,
        },
      });
    });
  });

  describe('findOne', () => {
    it('same merchant, same user → returns the notification', async () => {
      prisma.notifications.findUnique.mockResolvedValue({
        id: 'notif-1',
        user_id: 'user-1',
        merchant_id: 'merchant-1',
        outlet_id: null,
      });

      const result = await service.findOne(
        'notif-1',
        'user-1',
        'merchant-1',
        undefined,
      );

      expect(result.id).toBe('notif-1');
    });

    it('cross-merchant access (same user_id, different merchant_id) → throws ForbiddenException', async () => {
      prisma.notifications.findUnique.mockResolvedValue({
        id: 'notif-1',
        user_id: 'user-1',
        merchant_id: 'merchant-2',
        outlet_id: null,
      });

      await expect(
        service.findOne('notif-1', 'user-1', 'merchant-1', undefined),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('notifyOutletUsers', () => {
    it('outlet belongs to a different merchant → throws and writes nothing', async () => {
      prisma.outlets.findFirst.mockResolvedValue(null);

      await expect(
        service.notifyOutletUsers('outlet-1', 'merchant-1', {
          title: 't',
          message: 'm',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.user_roles.findMany).not.toHaveBeenCalled();
      expect(prisma.notifications.createMany).not.toHaveBeenCalled();
    });

    it('with requiredPermission → filters recipients by permission code', async () => {
      prisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: 'merchant-1',
      });
      prisma.user_roles.findMany.mockResolvedValue([{ user_id: 'user-1' }]);

      await service.notifyOutletUsers(
        'outlet-1',
        'merchant-1',
        { title: 't', message: 'm' },
        'transaction.read',
      );

      expect(prisma.user_roles.findMany).toHaveBeenCalledWith({
        where: {
          outlet_id: 'outlet-1',
          roles: {
            role_permissions: {
              some: { permissions: { code: 'transaction.read' } },
            },
          },
        },
        select: { user_id: true },
        distinct: ['user_id'],
      });
      expect(prisma.notifications.createMany).toHaveBeenCalledWith({
        data: [
          {
            user_id: 'user-1',
            outlet_id: 'outlet-1',
            merchant_id: 'merchant-1',
            title: 't',
            message: 'm',
            type: 'general',
          },
        ],
      });
    });

    it('omitted requiredPermission → preserves old "all users at outlet" behaviour', async () => {
      prisma.outlets.findFirst.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: 'merchant-1',
      });
      prisma.user_roles.findMany.mockResolvedValue([{ user_id: 'user-1' }]);

      await service.notifyOutletUsers('outlet-1', 'merchant-1', {
        title: 't',
        message: 'm',
      });

      expect(prisma.user_roles.findMany).toHaveBeenCalledWith({
        where: { outlet_id: 'outlet-1' },
        select: { user_id: true },
        distinct: ['user_id'],
      });
    });
  });

  describe('markAllAsRead', () => {
    it('scopes the updateMany by merchant_id (and omits outlet_id when absent)', async () => {
      prisma.notifications.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead(
        'user-1',
        'merchant-1',
        undefined,
      );

      expect(prisma.notifications.updateMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          merchant_id: 'merchant-1',
          is_read: false,
        },
        data: { is_read: true, updated_at: expect.any(Date) },
      });
      expect(result).toEqual({ updated: 3 });
    });

    it('applies the outlet filter to the updateMany when outletId is present', async () => {
      prisma.notifications.updateMany.mockResolvedValue({ count: 1 });

      await service.markAllAsRead('user-1', 'merchant-1', 'outlet-1');

      expect(prisma.notifications.updateMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          merchant_id: 'merchant-1',
          outlet_id: 'outlet-1',
          is_read: false,
        },
        data: { is_read: true, updated_at: expect.any(Date) },
      });
    });
  });
});
