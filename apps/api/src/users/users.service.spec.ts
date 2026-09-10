import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { UsersQueryDto } from './dto/users-query.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let uploadsService: UploadsService;

  const mockPrisma = {
    $transaction: jest.fn(),
    users: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    uploads: {
      findUnique: jest.fn(),
    },
  };

  const mockUploadsService = {
    generateSignedUrl: jest
      .fn()
      .mockResolvedValue({ url: 'https://example.com/signed-avatar.png' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    uploadsService = module.get<UploadsService>(UploadsService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users without search query', async () => {
      const merchantId = 'merchant-1';
      const query = new UsersQueryDto();
      query.page = 1;
      query.limit = 10;

      const mockUsers = [
        {
          id: 'user-1',
          merchant_id: merchantId,
          name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          password_hash: 'secret_hash',
          avatar_upload_id: null,
          avatar: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockUsers, 1]);

      const result = await service.findAll(merchantId, query);

      expect(mockPrisma.users.findMany).toHaveBeenCalledWith({
        where: { merchant_id: merchantId },
        include: { merchants: true },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(mockPrisma.users.count).toHaveBeenCalledWith({
        where: { merchant_id: merchantId },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('password_hash');
      expect(result.data[0].name).toBe('John Doe');
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by search keyword across name, email, and username', async () => {
      const merchantId = 'merchant-1';
      const query = new UsersQueryDto();
      query.page = 1;
      query.limit = 10;
      query.search = 'john';

      const mockUsers = [
        {
          id: 'user-1',
          merchant_id: merchantId,
          name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          password_hash: 'secret_hash',
          avatar_upload_id: null,
          avatar: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockUsers, 1]);

      const result = await service.findAll(merchantId, query);

      const expectedWhere = {
        merchant_id: merchantId,
        OR: [
          { name: { contains: 'john' } },
          { email: { contains: 'john' } },
          { username: { contains: 'john' } },
        ],
      };

      expect(mockPrisma.users.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: { merchants: true },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(mockPrisma.users.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('password_hash');
    });

    it('should attach signed url for avatar when avatar_upload_id is present', async () => {
      const merchantId = 'merchant-1';
      const query = new UsersQueryDto();

      const mockUsers = [
        {
          id: 'user-1',
          merchant_id: merchantId,
          name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          password_hash: 'secret_hash',
          avatar_upload_id: 'upload-123',
          avatar: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockUsers, 1]);

      const result = await service.findAll(merchantId, query);

      expect(mockUploadsService.generateSignedUrl).toHaveBeenCalledWith(
        'upload-123',
      );
      expect(result.data[0].avatar).toBe(
        'https://example.com/signed-avatar.png',
      );
    });
  });

  describe('findOne', () => {
    it('should return user by id scoped to merchant', async () => {
      const merchantId = 'merchant-1';
      const userId = 'user-1';

      mockPrisma.users.findFirst.mockResolvedValue({
        id: userId,
        merchant_id: merchantId,
        name: 'John Doe',
        password_hash: 'secret',
      });

      const result = await service.findOne(userId, merchantId);

      expect(mockPrisma.users.findFirst).toHaveBeenCalledWith({
        include: { merchants: true },
        where: { id: userId, merchant_id: merchantId },
      });
      expect(result.id).toBe(userId);
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.users.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-x', 'merchant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
