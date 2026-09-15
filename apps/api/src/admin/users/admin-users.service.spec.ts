import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { PrismaService } from '../../database/prisma.service';
import { UploadsService } from '../../uploads/uploads.service';
import { AdminCreateUserDto } from './dto/admin-users.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
}));

describe('AdminUsersService', () => {
  let service: AdminUsersService;

  const mockPrisma = {
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    merchants: { findUnique: jest.fn() },
    outlets: { findUnique: jest.fn() },
    roles: { findUnique: jest.fn() },
    user_roles: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    uploads: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockUploadsService = { generateSignedUrl: jest.fn() };

  const user = {
    id: 'user-1',
    merchant_id: 'merchant-1',
    email: 'a@example.com',
    password_hash: 'secret',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UploadsService, useValue: mockUploadsService },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
  });

  describe('findAll', () => {
    it('filters by merchant_id when provided and strips password_hash', async () => {
      mockPrisma.$transaction.mockResolvedValue([[user], 1]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        skip: 0,
        merchant_id: 'merchant-1',
      } as any);

      expect(mockPrisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { merchant_id: 'merchant-1' } }),
      );
      expect(result.data[0]).not.toHaveProperty('password_hash');
      expect(result.meta.total).toBe(1);
    });

    it('does not scope by merchant when merchant_id is absent', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, skip: 0 } as any);

      expect(mockPrisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('create', () => {
    const dto = {
      merchant_id: 'merchant-1',
      email: 'new@example.com',
      username: 'new_user',
      name: 'New User',
      password: 'secret123',
    } as AdminCreateUserDto;

    it('throws BadRequest when merchant does not exist', async () => {
      mockPrisma.merchants.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects an email already used by any merchant', async () => {
      mockPrisma.merchants.findUnique.mockResolvedValue({ id: 'merchant-1' });
      mockPrisma.users.findFirst.mockResolvedValueOnce({
        id: 'other',
        merchant_id: 'merchant-2',
      });

      await expect(service.create(dto, 'admin-1')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.users.findFirst).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });

    it('creates the user under the given merchant without password_hash', async () => {
      mockPrisma.merchants.findUnique.mockResolvedValue({ id: 'merchant-1' });
      mockPrisma.users.findFirst.mockResolvedValue(null);
      mockPrisma.users.create.mockResolvedValue({ ...user, id: 'user-2' });

      const result = await service.create(dto, 'admin-1');

      expect(mockPrisma.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          merchant_id: 'merchant-1',
          password_hash: 'hashed',
          created_by: 'admin-1',
        }),
      });
      expect(result).not.toHaveProperty('password_hash');
    });
  });

  describe('remove', () => {
    it('refuses to deactivate own account', async () => {
      await expect(service.remove('admin-1', 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.users.update).not.toHaveBeenCalled();
    });

    it('soft-deletes another user', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(user);
      mockPrisma.users.update.mockResolvedValue({ ...user, is_active: false });

      await service.remove('user-1', 'admin-1');

      expect(mockPrisma.users.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({ is_active: false }),
      });
    });
  });

  describe('assignRole', () => {
    const dto = { role_id: 'role-1', outlet_id: 'outlet-1' };

    it('rejects an outlet from another merchant', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(user);
      mockPrisma.outlets.findUnique.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: 'merchant-2',
      });

      await expect(
        service.assignRole('user-1', dto, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.user_roles.create).not.toHaveBeenCalled();
    });

    it('throws NotFound when role does not exist', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(user);
      mockPrisma.outlets.findUnique.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: 'merchant-1',
      });
      mockPrisma.roles.findUnique.mockResolvedValue(null);

      await expect(
        service.assignRole('user-1', dto, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates the assignment when valid', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(user);
      mockPrisma.outlets.findUnique.mockResolvedValue({
        id: 'outlet-1',
        merchant_id: 'merchant-1',
      });
      mockPrisma.roles.findUnique.mockResolvedValue({ id: 'role-1' });
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);

      await service.assignRole('user-1', dto, 'admin-1');

      expect(mockPrisma.user_roles.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: 'user-1',
          role_id: 'role-1',
          outlet_id: 'outlet-1',
        }),
      });
    });
  });
});
