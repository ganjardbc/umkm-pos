import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UploadsService } from '../uploads/uploads.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let uploadsService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      users: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      merchants: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      outlets: {
        create: jest.fn(),
      },
      roles: {
        findFirst: jest.fn(),
      },
      user_roles: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(mockPrismaService)),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    const mockUploadsService = {
      generateSignedUrl: jest.fn().mockResolvedValue({ url: 'signed-url' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UploadsService, useValue: mockUploadsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    uploadsService = module.get<UploadsService>(UploadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully login and return token and user data', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        password_hash: 'hashed-password',
        is_active: true,
        merchant_id: 'merchant-id',
        avatar_upload_id: 'avatar-id',
        avatar: 'avatar-fallback',
        merchants: {
          id: 'merchant-id',
          name: 'Merchant Name',
          slug: 'merchant-slug',
          logo: 'logo-fallback',
          logo_upload_id: 'logo-id',
        },
      };

      prisma.users.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user_roles.findMany.mockResolvedValue([
        {
          outlets: {
            id: 'outlet-id',
            name: 'Outlet Name',
            slug: 'outlet-slug',
            logo: 'outlet-logo',
            logo_upload_id: 'outlet-logo-id',
          },
          roles: {
            id: 'role-id',
            name: 'owner',
            description: 'Owner Role',
            role_permissions: [
              {
                permissions: {
                  id: 'perm-id',
                  code: 'manage_all',
                  description: 'Manage All',
                },
              },
            ],
          },
        },
      ]);

      const result = await service.login(loginDto);

      expect(prisma.users.findFirst).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        include: {
          merchants: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              logo_upload_id: true,
            },
          },
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password_hash);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
      expect(uploadsService.generateSignedUrl).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        access_token: 'mock-token',
        token_type: 'Bearer',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          username: 'testuser',
          avatar: 'signed-url',
          avatar_upload_id: 'avatar-id',
          merchant_id: 'merchant-id',
          merchant: {
            id: 'merchant-id',
            name: 'Merchant Name',
            slug: 'merchant-slug',
            logo: 'signed-url',
            logo_upload_id: 'logo-id',
          },
          is_active: true,
        },
        rbac: [
          {
            outlet: {
              id: 'outlet-id',
              name: 'Outlet Name',
              slug: 'outlet-slug',
              logo: 'signed-url',
              logo_upload_id: 'outlet-logo-id',
            },
            role: {
              id: 'role-id',
              name: 'owner',
              description: 'Owner Role',
              permissions: [
                {
                  id: 'perm-id',
                  code: 'manage_all',
                  description: 'Manage All',
                },
              ],
            },
          },
        ],
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.users.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      prisma.users.findFirst.mockResolvedValue({ is_active: false });

      await expect(
        service.login({ email: 'inactive@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      prisma.users.findFirst.mockResolvedValue({
        is_active: true,
        password_hash: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should fallback to original URLs if generateSignedUrl throws an error', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        password_hash: 'hashed-password',
        is_active: true,
        merchant_id: 'merchant-id',
        avatar_upload_id: 'avatar-id',
        avatar: 'avatar-fallback',
        merchants: {
          id: 'merchant-id',
          name: 'Merchant Name',
          slug: 'merchant-slug',
          logo: 'logo-fallback',
          logo_upload_id: 'logo-id',
        },
      };

      prisma.users.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user_roles.findMany.mockResolvedValue([]);
      uploadsService.generateSignedUrl.mockRejectedValue(new Error('S3 error'));

      const result = await service.login(loginDto);

      expect(result.user.avatar).toBe('avatar-fallback');
      expect(result.user.merchant.logo).toBe('logo-fallback');
    });

    it('should return fallback or null if uploadId is not provided', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        password_hash: 'hashed-password',
        is_active: true,
        merchant_id: 'merchant-id',
        avatar_upload_id: null,
        avatar: null,
        merchants: {
          id: 'merchant-id',
          name: 'Merchant Name',
          slug: 'merchant-slug',
          logo: null,
          logo_upload_id: null,
        },
      };

      prisma.users.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user_roles.findMany.mockResolvedValue([]);

      const result = await service.login(loginDto);

      expect(result.user.avatar).toBeNull();
      expect(result.user.merchant.logo).toBeNull();
    });
  });

  describe('register', () => {
    it('should successfully register a new merchant, outlets, and user', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        merchant: {
          slug: 'new-merchant',
          name: 'New Merchant',
          phone: '123456',
          address: 'Address',
          logo: 'logo-url',
        },
        outlets: [
          {
            slug: 'outlet-1',
            name: 'Outlet 1',
            location: 'Location 1',
            logo: 'logo-url-1',
          },
        ],
      };

      prisma.merchants.findUnique.mockResolvedValue(null);
      prisma.users.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const mockMerchant = { id: 'merchant-id', ...registerDto.merchant };
      const mockOutlet = { id: 'outlet-id', ...registerDto.outlets[0] };
      const mockUser = {
        id: 'user-id',
        email: registerDto.email,
        name: registerDto.name,
        username: 'new',
        merchant_id: 'merchant-id',
        is_active: true,
        merchants: {
          id: 'merchant-id',
          name: 'New Merchant',
          slug: 'new-merchant',
        },
      };

      prisma.merchants.create.mockResolvedValue(mockMerchant);
      prisma.outlets.create.mockResolvedValue(mockOutlet);
      prisma.users.create.mockResolvedValue(mockUser);
      prisma.roles.findFirst.mockResolvedValue({ id: 'role-owner-id', name: 'owner' });
      prisma.user_roles.create.mockResolvedValue({});
      prisma.user_roles.findMany.mockResolvedValue([]);

      const result = await service.register(registerDto);

      expect(prisma.merchants.findUnique).toHaveBeenCalledWith({
        where: { slug: registerDto.merchant.slug },
      });
      expect(prisma.users.findFirst).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(result).toEqual({
        access_token: 'mock-token',
        token_type: 'Bearer',
        user: {
          id: 'user-id',
          email: 'new@example.com',
          name: 'New User',
          username: 'new',
          merchant_id: 'merchant-id',
          merchant: {
            id: 'merchant-id',
            name: 'New Merchant',
            slug: 'new-merchant',
          },
          is_active: true,
        },
        merchant: {
          id: 'merchant-id',
          name: 'New Merchant',
          slug: 'new-merchant',
        },
        outlets: [
          {
            id: 'outlet-id',
            name: 'Outlet 1',
            slug: 'outlet-1',
            location: 'Location 1',
          },
        ],
        rbac: [],
      });
    });

    it('should throw ConflictException if merchant slug already exists', async () => {
      prisma.merchants.findUnique.mockResolvedValue({ id: 'existing-merchant' });

      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        merchant: { slug: 'existing-merchant' },
        outlets: [],
      } as any;

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email already registered', async () => {
      prisma.merchants.findUnique.mockResolvedValue(null);
      prisma.users.findFirst.mockResolvedValue({ id: 'existing-user' });

      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'New User',
        merchant: { slug: 'new-merchant' },
        outlets: [],
      } as any;

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw Error if owner role is not found', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        merchant: { slug: 'new-merchant' },
        outlets: [{ slug: 'outlet-1' }],
      } as any;

      prisma.merchants.findUnique.mockResolvedValue(null);
      prisma.users.findFirst.mockResolvedValue(null);
      prisma.merchants.create.mockResolvedValue({ id: 'merchant-id' });
      prisma.outlets.create.mockResolvedValue({ id: 'outlet-id' });
      prisma.users.create.mockResolvedValue({ id: 'user-id' });
      prisma.roles.findFirst.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow('Owner role not found in the system');
    });
  });

  describe('getProfile', () => {
    it('should return user profile if found', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        avatar_upload_id: 'avatar-id',
        avatar: 'avatar-fallback',
        merchant_id: 'merchant-id',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        merchants: { 
          id: 'merchant-id',
          name: 'Merchant Name',
          slug: 'merchant-slug',
          logo: 'logo-fallback',
          logo_upload_id: 'logo-id',
        },
      };

      prisma.users.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-id');

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        include: {
          merchants: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              logo_upload_id: true,
            },
          },
        },
      });
      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        avatar: 'signed-url',
        avatar_upload_id: 'avatar-id',
        merchant_id: 'merchant-id',
        merchants: {
          id: 'merchant-id',
          name: 'Merchant Name',
          slug: 'merchant-slug',
          logo: 'signed-url',
          logo_upload_id: 'logo-id',
        },
        is_active: true,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});