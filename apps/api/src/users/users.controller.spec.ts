import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PermissionGuard } from '../common/guards/permission.guard';
import { PrismaService } from '../database/prisma.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setAvatar: jest.fn(),
    removeAvatar: jest.fn(),
  };

  const mockPermissionGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should pass merchantId and pagination through to usersService.findAll', async () => {
    const merchantId = 'merchant-1';
    const pagination = { page: 1, limit: 10 };
    const response = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    mockUsersService.findAll.mockResolvedValue(response);

    const result = await controller.findAll(merchantId, pagination as any);

    expect(result).toEqual(response);
    expect(mockUsersService.findAll).toHaveBeenCalledWith(
      merchantId,
      pagination,
    );
  });

  it('should have @RequirePermission("user.read") metadata on findAll', () => {
    const reflector = new Reflector();
    const permission = reflector.get<string>('permission', controller.findAll);

    expect(permission).toBe('user.read');
  });
});

describe('PermissionGuard on UsersController.findAll (GET /users)', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let prisma: { user_roles: { findMany: jest.Mock } };

  const makeContext = (userId: string): ExecutionContext => {
    const request = { user: { id: userId } };

    return {
      getHandler: () => UsersController.prototype.findAll,
      getClass: () => UsersController,
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    prisma = {
      user_roles: {
        findMany: jest.fn(),
      },
    };

    guard = new PermissionGuard(reflector, prisma as unknown as PrismaService);
  });

  it('returns 403 Forbidden when the requesting user lacks the user.read permission', async () => {
    prisma.user_roles.findMany.mockResolvedValue([
      {
        roles: {
          role_permissions: [{ permissions: { code: 'transaction.create' } }],
        },
      },
    ]);

    const ctx = makeContext('user-without-permission');

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      'Permission denied. Required: user.read',
    );
  });

  it('returns 200 (allows access) when the requesting user has the user.read permission', async () => {
    prisma.user_roles.findMany.mockResolvedValue([
      {
        roles: {
          role_permissions: [{ permissions: { code: 'user.read' } }],
        },
      },
    ]);

    const ctx = makeContext('user-with-permission');

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
