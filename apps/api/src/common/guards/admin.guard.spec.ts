import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

const makeContext = (user: Record<string, any> | undefined): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  it('admin merchant user → returns true', () => {
    const ctx = makeContext({
      id: 'user-1',
      merchant: { id: 'm-1', slug: 'merchant-admin' },
    });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('regular merchant user → throws ForbiddenException', () => {
    const ctx = makeContext({
      id: 'user-1',
      merchant: { id: 'm-2', slug: 'kopi-kenangan' },
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('user without merchant → throws ForbiddenException', () => {
    const ctx = makeContext({ id: 'user-1' });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('no user on request → throws ForbiddenException', () => {
    const ctx = makeContext(undefined);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
