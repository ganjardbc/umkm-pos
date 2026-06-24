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
  let prisma: PrismaService;
  let jwtService: JwtService;
  let uploadsService: UploadsService;

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
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  };

  const mockUploadsService = {
    generateSignedUrl: jest.fn().mockResolvedValue({ url: 'http://signed-url.com' }),
  };

  beforeEach(async () => {
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

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(prisma.users, 'findFirst').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        is_active: false,
      };
      jest.spyOn(prisma.users, 'findFirst').mockResolvedValue(mockUser as any);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('User account is inactive'),
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        is_active: true,
        password_hash: 'hashed-password',
      };
      jest.spyOn(prisma.users, 'findFirst').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
    });

    it('should return access token and user data on successful login', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        username: 'test',
        is_active: true,
        password_hash: 'hashed-password',
        avatar_upload_id: 'avatar-id',
        avatar: 'avatar.png',
        merchant_id: 'merchant-id',
        merchants: {
          id: 'merchant-id',
          name: 'Merchant Name',
          slug: 'merchant-slug',
          logo: 'logo.png',
          logo_upload_id: 'logo-id',
        },
      };

      const mockUserRoles = [
        { 
          outlets: {
            id: 'outlet-id',
            name: 'Outlet Name',
            slug: 'outlet-slug',
            logo: 'outlet-logo.png',
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
      ];

      jest.spyOn(prisma.users, 'findFirst').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(prisma.user_roles, 'findMany').mockResolvedValue(mockUserRoles as any);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'mocked-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.rbac[0].role.name).toBe('owner');
      expect(uploadsService.generateSignedUrl).toHaveBeenCalledTimes(3);
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      merchant: {
        slug: 'new-merchant',
        name: 'New Merchant',
        phone: '123456',
        address: 'Street 1',
        logo: 'logo.png',
      },
      outlets: [
        {
          slug: 'outlet-1',
          name: 'Outlet 1',
          location: 'Location 1',
          logo: 'logo.png',
        },
      ],
    };

    it('should throw ConflictException if merchant slug already exists', async () => {
      jest.spyOn(prisma.merchants, 'findUnique').mockResolvedValue({ id: 'existing-id' } as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('Merchant slug already exists'),
      );
    });

    it('should throw ConflictException if email already registered', async () => {
      jest.spyOn(prisma.merchants, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.users, 'findFirst').mockResolvedValue({ id: 'existing-user-id' } as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('Email already registered'),
      );
    });

    it('should throw Error if owner role is not found', async () => {
      jest.spyOn(prisma.merchants, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.users, 'findFirst').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      jest.spyOn(prisma.merchants, 'create').mockResolvedValue({ id: 'merchant-id' } as any);
      jest.spyOn(prisma.outlets, 'create').mockResolvedValue({ id: 'outlet-id' } as any);
      jest.spyOn(prisma.users, 'create').mockResolvedValue({
        id: 'user-id',
        email: 'new@example.com',
        name: 'New User',
        username: 'new',
        merchant_id: 'merchant-id',
        is_active: true,
      } as any);
      jest.spyOn(prisma.roles, 'findFirst').mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        new Error('Owner role not found in the system'),
      );
    });

    it('should successfully register a new user, merchant, and outlets', async () => {
      jest.spyOn(prisma.merchants, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.users, 'findFirst').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const mockMerchant = { id: 'merchant-id', name: 'New Merchant', slug: 'new-merchant' };
      const mockOutlet = { id: 'outlet-id', name: 'Outlet 1', slug: 'outlet-1', location: 'Location 1' };
      const mockUser = {
        id: 'user-id',
        email: 'new@example.com',
        name: 'New User',
        username: 'new',
        merchant_id: 'merchant-id',
        is_active: true,
        merchants: mockMerchant,
      };

      jest.spyOn(prisma.merchants, 'create').mockResolvedValue(mockMerchant as any);
      jest.spyOn(prisma.outlets, 'create').mockResolvedValue(mockOutlet as any);
      jest.spyOn(prisma.users, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.roles, 'findFirst').mockResolvedValue({ id: 'role-owner-id', name: 'owner' } as any);
      jest.spyOn(prisma.user_roles, 'create').mockResolvedValue({} as any);
      jest.spyOn(prisma.user_roles, 'findMany').mockResolvedValue([]);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token', 'mocked-jwt-token');
      expect(result.user.email).toBe('new@example.com');
      expect(result.merchant.name).toBe('New Merchant');
      expect(result.outlets[0].name).toBe('Outlet 1');
    });
  });

  describe('getProfile', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        new UnauthorizedException('User not found'),
      );
    });

    it('should return user profile on success', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        username: 'test',
        is_active: true,
        avatar_upload_id: 'avatar-id',
        avatar: 'avatar.png',
        merchant_id: 'merchant-id',
        merchants: {
          id: 'merchant-id',
          name: 'Merchant Name',
          slug: 'merchant-slug',
          logo: 'logo.png',
          logo_upload_id: 'logo-id',
        },
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.getProfile('user-id');

      expect(result.id).toBe('user-id');
      expect(result.email).toBe('test@example.com');
      expect(uploadsService.generateSignedUrl).toHaveBeenCalledTimes(2);
    });
  });
});