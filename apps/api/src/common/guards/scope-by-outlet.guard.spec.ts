import {
  ExecutionContext,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ScopeByOutletGuard } from './scope-by-outlet.guard';
import { SCOPE_BY_OUTLET_KEY } from '../decorators/scope-by-outlet.decorator';

const makeContext = (
  metadata: string | undefined,
  requestOverride: Record<string, any> = {},
): ExecutionContext => {
  const request = {
    body: {},
    params: {},
    query: {},
    user: { merchant_id: 'merchant-1' },
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

describe('ScopeByOutletGuard', () => {
  let guard: ScopeByOutletGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: { outlets: { findUnique: jest.Mock } };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    prisma = {
      outlets: {
        findUnique: jest.fn(),
      },
    };

    guard = new ScopeByOutletGuard(reflector, prisma as any);
  });

  it('TC1: no metadata → return true without DB query', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = makeContext(undefined);

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(prisma.outlets.findUnique).not.toHaveBeenCalled();
  });

  it('TC2: valid outlet_id, merchant_id matches → return true', async () => {
    reflector.getAllAndOverride.mockReturnValue('body.outlet_id');
    const ctx = makeContext('body.outlet_id', {
      body: { outlet_id: 'outlet-1' },
      user: { merchant_id: 'merchant-1' },
    });
    prisma.outlets.findUnique.mockResolvedValue({
      id: 'outlet-1',
      merchant_id: 'merchant-1',
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(prisma.outlets.findUnique).toHaveBeenCalledWith({
      where: { id: 'outlet-1' },
    });
  });

  it('TC3: outlet not found in DB → throw NotFoundException', async () => {
    reflector.getAllAndOverride.mockReturnValue('body.outlet_id');
    const ctx = makeContext('body.outlet_id', {
      body: { outlet_id: 'nonexistent' },
      user: { merchant_id: 'merchant-1' },
    });
    prisma.outlets.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
  });

  it('TC4: outlet found but merchant_id differs → throw ForbiddenException', async () => {
    reflector.getAllAndOverride.mockReturnValue('body.outlet_id');
    const ctx = makeContext('body.outlet_id', {
      body: { outlet_id: 'outlet-other' },
      user: { merchant_id: 'merchant-1' },
    });
    prisma.outlets.findUnique.mockResolvedValue({
      id: 'outlet-other',
      merchant_id: 'merchant-2',
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('TC5: outlet_id missing in request → throw BadRequestException', async () => {
    reflector.getAllAndOverride.mockReturnValue('body.outlet_id');
    const ctx = makeContext('body.outlet_id', {
      body: {},
      user: { merchant_id: 'merchant-1' },
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(BadRequestException);
    expect(prisma.outlets.findUnique).not.toHaveBeenCalled();
  });
});
