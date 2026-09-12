import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * OutletHeaderGuard
 *
 * Reads the untrusted `X-Outlet-Id` request header and, when present, validates
 * it against three checks before trusting it as the caller's active outlet
 * context:
 *   1. the outlet exists
 *   2. the outlet belongs to the caller's merchant (from the JWT)
 *   3. the authenticated user holds a `user_roles` row for that outlet
 *
 * Absent header => no outlet filter (pass-through, not a rejection).
 * Any of the three checks failing => reject with the same generic 403 so a
 * caller cannot use differing error shapes to enumerate outlets/merchants/roles.
 *
 * On success, sets `request.user.outlet_id` so the existing
 * `@CurrentUser('outlet_id')` reads become live.
 *
 * Registered per-controller only (NotificationsController) — never as a global
 * guard, and never on transactions/stock/shifts, which resolve outlets via
 * their own `getAllowedOutletIds` logic.
 */
@Injectable()
export class OutletHeaderGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const outletId = request.headers['x-outlet-id'] as string | undefined;

    // Absent header = no outlet filter. Never treat this branch as a rejection.
    if (!outletId) {
      return true;
    }

    try {
      const outlet = await this.prisma.outlets.findUnique({
        where: { id: outletId },
      });

      if (!outlet || outlet.merchant_id !== request.user?.merchant_id) {
        throw new ForbiddenException('Invalid outlet context');
      }

      const membership = await this.prisma.user_roles.findFirst({
        where: { user_id: request.user.id, outlet_id: outletId },
        select: { user_id: true },
      });

      if (!membership) {
        throw new ForbiddenException('Invalid outlet context');
      }
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      // Malformed id (bad UUID shape, DB-level error, etc.) must never surface as a 500.
      throw new ForbiddenException('Invalid outlet context');
    }

    request.user.outlet_id = outletId;
    return true;
  }
}
