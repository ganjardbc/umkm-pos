import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { isPlatformAdminMerchant } from '../constants/admin.constants';

/**
 * Admin Guard
 * Allows access only to platform admins (users of the admin merchant).
 *
 * Relies on `request.user.merchant.slug`, which JwtStrategy loads from the
 * database on every request — never from client input.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !isPlatformAdminMerchant(user.merchant?.slug)) {
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}
