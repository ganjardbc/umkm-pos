import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { PrismaService } from '../database/prisma.service';
import { AssignRoleDto } from './dto/assign-role.dto';

describe('RbacService', () => {
  let service: RbacService;

  const mockPrisma = {
    outlets: {
      findUnique: jest.fn(),
    },
    roles: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user_roles: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
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
    it('throws NotFoundException when role does not exist', async () => {
      mockPrisma.roles.findFirst.mockResolvedValue(null);

      await expect(
        service.assignRoleToUser(dtoForOutlet(outletId), assignedBy),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.user_roles.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException when role already assigned', async () => {
      mockPrisma.roles.findFirst.mockResolvedValue({ id: roleId, name: 'cashier' });
      mockPrisma.user_roles.findFirst.mockResolvedValue({
        user_id: userId,
        role_id: roleId,
        outlet_id: outletId,
      });

      await expect(
        service.assignRoleToUser(dtoForOutlet(outletId), assignedBy),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.user_roles.create).not.toHaveBeenCalled();
    });

    it('assigns role successfully', async () => {
      mockPrisma.roles.findFirst.mockResolvedValue({ id: roleId, name: 'cashier' });
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);
      mockPrisma.user_roles.create.mockResolvedValue({
        user_id: userId,
        role_id: roleId,
        outlet_id: outletId,
      });

      const result = await service.assignRoleToUser(
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
    it('throws NotFoundException when role assignment not found', async () => {
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);

      await expect(
        service.revokeRoleFromUser(dtoForOutlet(outletId)),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.user_roles.delete).not.toHaveBeenCalled();
    });

    it('revokes role successfully', async () => {
      mockPrisma.user_roles.findFirst.mockResolvedValue({
        user_id: userId,
        role_id: roleId,
        outlet_id: outletId,
      });
      mockPrisma.user_roles.delete.mockResolvedValue({});

      const result = await service.revokeRoleFromUser(dtoForOutlet(outletId));

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
});
