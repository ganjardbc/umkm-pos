import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OutletHeaderGuard } from './outlet-header.guard';

const makeContext = (
  headers: Record<string, any> = {},
  user: Record<string, any> = { id: 'user-1', merchant_id: 'merchant-1' },
): ExecutionContext => {
  const request = { headers, user };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('OutletHeaderGuard', () => {
  let guard: OutletHeaderGuard;
  let prisma: {
    outlets: { findUnique: jest.Mock };
    user_roles: { findFirst: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      outlets: { findUnique: jest.fn() },
      user_roles: { findFirst: jest.fn() },
    };

    guard = new OutletHeaderGuard(prisma as any);
  });

  it('absent header → returns true, no outlet filter, no DB calls', async () => {
    const ctx = makeContext({});

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(prisma.outlets.findUnique).not.toHaveBeenCalled();
    expect(prisma.user_roles.findFirst).not.toHaveBeenCalled();
  });

  it('valid header (exists, same merchant, has role) → sets request.user.outlet_id and returns true', async () => {
    const request = {
      headers: { 'x-outlet-id': 'outlet-1' },
      user: { id: 'user-1', merchant_id: 'merchant-1' },
    };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    prisma.outlets.findUnique.mockResolvedValue({
      id: 'outlet-1',
      merchant_id: 'merchant-1',
    });
    prisma.user_roles.findFirst.mockResolvedValue({ user_id: 'user-1' });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(request.user.outlet_id).toBe('outlet-1');
  });

  it('outlet belongs to a different merchant → throws ForbiddenException', async () => {
    const ctx = makeContext({ 'x-outlet-id': 'outlet-other' });

    prisma.outlets.findUnique.mockResolvedValue({
      id: 'outlet-other',
      merchant_id: 'merchant-2',
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(prisma.user_roles.findFirst).not.toHaveBeenCalled();
  });

  it('user has no user_roles row for the outlet → throws ForbiddenException', async () => {
    const ctx = makeContext({ 'x-outlet-id': 'outlet-1' });

    prisma.outlets.findUnique.mockResolvedValue({
      id: 'outlet-1',
      merchant_id: 'merchant-1',
    });
    prisma.user_roles.findFirst.mockResolvedValue(null);

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('non-existent outlet → throws ForbiddenException', async () => {
    const ctx = makeContext({ 'x-outlet-id': 'nonexistent' });

    prisma.outlets.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('malformed id / DB error → converted to the same generic ForbiddenException, never surfaces as 500', async () => {
    const ctx = makeContext({ 'x-outlet-id': 'not-a-valid-uuid' });

    prisma.outlets.findUnique.mockRejectedValue(new Error('DB driver error'));

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
