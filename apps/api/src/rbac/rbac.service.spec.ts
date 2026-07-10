import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
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

  const merchantA = 'merchant-a';
  const merchantB = 'merchant-b';
  const outletInMerchantA = 'outlet-a1';
  const outletInMerchantB = 'outlet-b1';
  const roleId = 'role-1';
  const userId = 'user-1';
  const assignedBy = 'admin-1';

  const dtoForOutlet = (outletId: string): AssignRoleDto => ({
    user_id: userId,
    role_id: roleId,
    outlet_id: outletId,
  });

  describe('assignRoleToUser', () => {
    it('throws ForbiddenException when outlet belongs to a different merchant', async () => {
      mockPrisma.outlets.findUnique.mockResolvedValue({
        id: outletInMerchantB,
        merchant_id: merchantB,
      });

      await expect(
        service.assignRoleToUser(
          dtoForOutlet(outletInMerchantB),
          assignedBy,
          merchantA,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.user_roles.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when outlet does not exist', async () => {
      mockPrisma.outlets.findUnique.mockResolvedValue(null);

      await expect(
        service.assignRoleToUser(
          dtoForOutlet('nonexistent-outlet'),
          assignedBy,
          merchantA,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.user_roles.create).not.toHaveBeenCalled();
    });

    it('assigns role successfully when outlet belongs to the caller merchant', async () => {
      mockPrisma.outlets.findUnique.mockResolvedValue({
        id: outletInMerchantA,
        merchant_id: merchantA,
      });
      mockPrisma.roles.findFirst.mockResolvedValue({
        id: roleId,
        name: 'cashier',
      });
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);
      mockPrisma.user_roles.create.mockResolvedValue({
        user_id: userId,
        role_id: roleId,
        outlet_id: outletInMerchantA,
      });

      const result = await service.assignRoleToUser(
        dtoForOutlet(outletInMerchantA),
        assignedBy,
        merchantA,
      );

      expect(result).toEqual({
        user_id: userId,
        role_id: roleId,
        outlet_id: outletInMerchantA,
      });
      expect(mockPrisma.user_roles.create).toHaveBeenCalledWith({
        data: {
          user_id: userId,
          role_id: roleId,
          outlet_id: outletInMerchantA,
          created_by: assignedBy,
          updated_by: assignedBy,
        },
      });
    });
  });

  describe('revokeRoleFromUser', () => {
    it('throws ForbiddenException when outlet belongs to a different merchant', async () => {
      mockPrisma.outlets.findUnique.mockResolvedValue({
        id: outletInMerchantB,
        merchant_id: merchantB,
      });

      await expect(
        service.revokeRoleFromUser(dtoForOutlet(outletInMerchantB), merchantA),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.user_roles.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when outlet does not exist', async () => {
      mockPrisma.outlets.findUnique.mockResolvedValue(null);

      await expect(
        service.revokeRoleFromUser(
          dtoForOutlet('nonexistent-outlet'),
          merchantA,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.user_roles.delete).not.toHaveBeenCalled();
    });

    it('revokes role successfully when outlet belongs to the caller merchant', async () => {
      mockPrisma.outlets.findUnique.mockResolvedValue({
        id: outletInMerchantA,
        merchant_id: merchantA,
      });
      mockPrisma.user_roles.findFirst.mockResolvedValue({
        user_id: userId,
        role_id: roleId,
        outlet_id: outletInMerchantA,
      });
      mockPrisma.user_roles.delete.mockResolvedValue({});

      const result = await service.revokeRoleFromUser(
        dtoForOutlet(outletInMerchantA),
        merchantA,
      );

      expect(result).toEqual({
        message: 'Role revoked from user successfully',
      });
      expect(mockPrisma.user_roles.delete).toHaveBeenCalledWith({
        where: {
          user_id_role_id_outlet_id: {
            user_id: userId,
            role_id: roleId,
            outlet_id: outletInMerchantA,
          },
        },
      });
    });
  });
});
