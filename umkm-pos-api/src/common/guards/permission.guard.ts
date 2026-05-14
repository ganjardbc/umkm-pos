import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

/**
 * Permission Guard
 * Checks if user has required permission for the endpoint
 *
 * Works with @RequirePermission() decorator
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permission from decorator
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permission required, allow access
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user's permissions from database
    // User -> UserRoles -> Roles -> RolePermissions -> Permissions
    const userPermissions = await this.prisma.user_roles.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        roles: {
          include: {
            role_permissions: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    // Extract permission codes
    const permissionCodes = userPermissions.flatMap((userRole) =>
      userRole.roles.role_permissions.map((rp) => rp.permissions.code),
    );

    // Check if user has required permission
    if (!permissionCodes.includes(requiredPermission)) {
      throw new ForbiddenException(
        `Permission denied. Required: ${requiredPermission}`,
      );
    }

    return true;
  }
}
