import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { UsersQueryDto } from './dto/users-query.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    users: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    uploads: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockUploadsService = {
    generateSignedUrl: jest
      .fn()
      .mockResolvedValue({ url: 'https://example.com/avatar.png' }),
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
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should query users without search filter when search is not provided', async () => {
      const merchantId = 'merchant-123';
      const query = new UsersQueryDto();
      query.page = 1;
      query.limit = 10;

      const mockUsers = [
        {
          id: 'user-1',
          name: 'Alice',
          username: 'alice',
          email: 'alice@example.com',
          password_hash: 'hashed',
          avatar_upload_id: null,
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockUsers, 1]);

      const result = await service.findAll(merchantId, query);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.data).toEqual([
        {
          id: 'user-1',
          name: 'Alice',
          username: 'alice',
          email: 'alice@example.com',
          avatar_upload_id: null,
        },
      ]);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should query users with search filter across name, email, and username', async () => {
      const merchantId = 'merchant-123';
      const query = new UsersQueryDto();
      query.page = 1;
      query.limit = 10;
      query.search = 'alice';

      const mockUsers = [
        {
          id: 'user-1',
          name: 'Alice',
          username: 'alice_123',
          email: 'alice@example.com',
          password_hash: 'hashed',
          avatar_upload_id: 'upload-1',
        },
      ];

      mockPrisma.$transaction.mockImplementation((promises) => {
        return Promise.resolve([mockUsers, 1]);
      });

      const result = await service.findAll(merchantId, query);

      expect(result.data).toEqual([
        {
          id: 'user-1',
          name: 'Alice',
          username: 'alice_123',
          email: 'alice@example.com',
          avatar_upload_id: 'upload-1',
          avatar: 'https://example.com/avatar.png',
        },
      ]);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should ignore empty or whitespace search filter', async () => {
      const merchantId = 'merchant-123';
      const query = new UsersQueryDto();
      query.page = 1;
      query.limit = 10;
      query.search = '   ';

      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const result = await service.findAll(merchantId, query);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });
});
