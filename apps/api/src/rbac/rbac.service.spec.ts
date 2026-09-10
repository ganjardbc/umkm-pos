import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { PrismaService } from '../database/prisma.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RolesQueryDto } from './dto/roles-query.dto';

describe('RbacService', () => {
  let service: RbacService;

  const mockPrisma = {
    users: {
      findFirst: jest.fn(),
    },
    outlets: {
      findUnique: jest.fn(),
    },
    roles: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user_roles: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);

    jest.clearAllMocks();
  });

  const merchantId = 'merchant-1';
  const roleId = 'role-1';
  const userId = 'user-1';
  const outletId = 'outlet-a1';
  const assignedBy = 'admin-1';

  const dtoForOutlet = (oId: string): AssignRoleDto => ({
    user_id: userId,
    role_id: roleId,
    outlet_id: oId,
  });

  describe('assignRoleToUser', () => {
    it('throws NotFoundException when user does not exist or does not belong to merchant', async () => {
      mockPrisma.users.findFirst.mockResolvedValue(null);

      await expect(
        service.assignRoleToUser(
          merchantId,
          dtoForOutlet(outletId),
          assignedBy,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.users.findFirst).toHaveBeenCalledWith({
        where: {
          id: userId,
          merchant_id: merchantId,
        },
      });
      expect(mockPrisma.roles.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.user_roles.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when role does not exist', async () => {
      mockPrisma.users.findFirst.mockResolvedValue({
        id: userId,
        merchant_id: merchantId,
      });
      mockPrisma.roles.findFirst.mockResolvedValue(null);

      await expect(
        service.assignRoleToUser(
          merchantId,
          dtoForOutlet(outletId),
          assignedBy,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.user_roles.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException when role already assigned', async () => {
      mockPrisma.users.findFirst.mockResolvedValue({
        id: userId,
        merchant_id: merchantId,
      });
      mockPrisma.roles.findFirst.mockResolvedValue({
        id: roleId,
        name: 'cashier',
      });
      mockPrisma.user_roles.findFirst.mockResolvedValue({
        user_id: userId,
        role_id: roleId,
        outlet_id: outletId,
      });

      await expect(
        service.assignRoleToUser(
          merchantId,
          dtoForOutlet(outletId),
          assignedBy,
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.user_roles.create).not.toHaveBeenCalled();
    });

    it('assigns role successfully', async () => {
      mockPrisma.users.findFirst.mockResolvedValue({
        id: userId,
        merchant_id: merchantId,
      });
      mockPrisma.roles.findFirst.mockResolvedValue({
        id: roleId,
        name: 'cashier',
      });
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);
      mockPrisma.user_roles.create.mockResolvedValue({
        user_id: userId,
        role_id: roleId,
        outlet_id: outletId,
      });

      const result = await service.assignRoleToUser(
        merchantId,
        dtoForOutlet(outletId),
        assignedBy,
      );

      expect(result).toEqual({
        user_id: userId,
        role_id: roleId,
        outlet_id: outletId,
      });
      expect(mockPrisma.user_roles.create).toHaveBeenCalledWith({
        data: {
          user_id: userId,
          role_id: roleId,
          outlet_id: outletId,
          created_by: assignedBy,
          updated_by: assignedBy,
        },
      });
      // Outlet cross-tenant check is now handled by ScopeByOutletGuard, not service
      expect(mockPrisma.outlets.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('revokeRoleFromUser', () => {
    it('throws NotFoundException when user does not exist or does not belong to merchant', async () => {
      mockPrisma.users.findFirst.mockResolvedValue(null);

      await expect(
        service.revokeRoleFromUser(merchantId, dtoForOutlet(outletId)),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.users.findFirst).toHaveBeenCalledWith({
        where: {
          id: userId,
          merchant_id: merchantId,
        },
      });
      expect(mockPrisma.user_roles.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.user_roles.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when role assignment not found', async () => {
      mockPrisma.users.findFirst.mockResolvedValue({
        id: userId,
        merchant_id: merchantId,
      });
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);

      await expect(
        service.revokeRoleFromUser(merchantId, dtoForOutlet(outletId)),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.user_roles.delete).not.toHaveBeenCalled();
    });

    it('revokes role successfully', async () => {
      mockPrisma.users.findFirst.mockResolvedValue({
        id: userId,
        merchant_id: merchantId,
      });
      mockPrisma.user_roles.findFirst.mockResolvedValue({
        user_id: userId,
        role_id: roleId,
        outlet_id: outletId,
      });
      mockPrisma.user_roles.delete.mockResolvedValue({});

      const result = await service.revokeRoleFromUser(
        merchantId,
        dtoForOutlet(outletId),
      );

      expect(result).toEqual({
        message: 'Role revoked from user successfully',
      });
      expect(mockPrisma.user_roles.delete).toHaveBeenCalledWith({
        where: {
          user_id_role_id_outlet_id: {
            user_id: userId,
            role_id: roleId,
            outlet_id: outletId,
          },
        },
      });
      // Outlet cross-tenant check is now handled by ScopeByOutletGuard, not service
      expect(mockPrisma.outlets.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('findAllRoles', () => {
    it('returns paginated roles when no search term is provided', async () => {
      const mockRoles = [
        {
          id: 'role-1',
          name: 'admin',
          description: 'Administrator role',
          role_permissions: [],
        },
        {
          id: 'role-2',
          name: 'cashier',
          description: 'Cashier role',
          role_permissions: [],
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockRoles, 2]);

      const result = await service.findAllRoles();

      expect(mockPrisma.roles.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { name: 'asc' },
        include: {
          role_permissions: {
            include: { permissions: true },
          },
        },
        skip: 0,
        take: 10,
      });
      expect(mockPrisma.roles.count).toHaveBeenCalledWith({
        where: undefined,
      });
      expect(result).toEqual({
        data: mockRoles,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('passes search filter on name and description to findMany and count when search query is provided', async () => {
      const query = Object.assign(new RolesQueryDto(), {
        page: 1,
        limit: 10,
        search: 'cash',
      });

      const mockRoles = [
        {
          id: 'role-2',
          name: 'cashier',
          description: 'Cashier role',
          role_permissions: [],
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockRoles, 1]);

      const result = await service.findAllRoles(query);

      const expectedWhere = {
        OR: [
          { name: { contains: 'cash' } },
          { description: { contains: 'cash' } },
        ],
      };

      expect(mockPrisma.roles.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { name: 'asc' },
        include: {
          role_permissions: {
            include: { permissions: true },
          },
        },
        skip: 0,
        take: 10,
      });
      expect(mockPrisma.roles.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(result).toEqual({
        data: mockRoles,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('handles custom pagination parameters correctly', async () => {
      const query = Object.assign(new RolesQueryDto(), {
        page: 2,
        limit: 5,
        search: 'manager',
      });

      mockPrisma.$transaction.mockResolvedValue([[], 12]);

      const result = await service.findAllRoles(query);

      expect(mockPrisma.roles.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
      expect(result.meta).toEqual({
        total: 12,
        page: 2,
        limit: 5,
        totalPages: 3,
      });
    });
  });
});
