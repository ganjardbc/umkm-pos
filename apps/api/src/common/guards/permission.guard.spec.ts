import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './permission.guard';

const makeContext = (
  requestOverride: Record<string, any> = {},
): ExecutionContext => {
  const request = {
    user: { id: 'user-1', merchant_id: 'merchant-1' },
    ...requestOverride,
  };

  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('PermissionGuard - GET /users (user.read)', () => {
  let guard: PermissionGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: { user_roles: { findMany: jest.Mock } };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    prisma = {
      user_roles: {
        findMany: jest.fn(),
      },
    };

    guard = new PermissionGuard(reflector, prisma as any);
  });

  it('throws 403 ForbiddenException when user lacks user.read permission', async () => {
    reflector.getAllAndOverride.mockReturnValue('user.read');
    prisma.user_roles.findMany.mockResolvedValue([
      {
        roles: {
          role_permissions: [{ permissions: { code: 'product.read' } }],
        },
      },
    ]);

    const ctx = makeContext();

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('returns true (200) when user has user.read permission', async () => {
    reflector.getAllAndOverride.mockReturnValue('user.read');
    prisma.user_roles.findMany.mockResolvedValue([
      {
        roles: {
          role_permissions: [{ permissions: { code: 'user.read' } }],
        },
      },
    ]);

    const ctx = makeContext();

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws 403 ForbiddenException when user is not authenticated', async () => {
    reflector.getAllAndOverride.mockReturnValue('user.read');
    const ctx = makeContext({ user: undefined });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
