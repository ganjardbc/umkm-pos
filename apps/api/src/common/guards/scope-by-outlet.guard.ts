import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { SCOPE_BY_OUTLET_KEY } from '../decorators/scope-by-outlet.decorator';

/**
 * ScopeByOutletGuard
 * Works with @ScopeByOutlet(fieldPath) decorator.
 * Validates that the outlet_id in the request belongs to the caller's merchant (from JWT).
 */
@Injectable()
export class ScopeByOutletGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const fieldPath = this.reflector.getAllAndOverride<string>(
      SCOPE_BY_OUTLET_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Guard is a no-op if decorator not present
    if (!fieldPath) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const [source, fieldName] = fieldPath.split('.');
    const outletId: string | undefined = request[source]?.[fieldName];

    if (!outletId) {
      throw new BadRequestException('outlet_id is required for this endpoint');
    }

    const outlet = await this.prisma.outlets.findUnique({
      where: { id: outletId },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    if (outlet.merchant_id !== request.user.merchant_id) {
      throw new ForbiddenException('Outlet does not belong to your merchant');
    }

    return true;
  }
}
