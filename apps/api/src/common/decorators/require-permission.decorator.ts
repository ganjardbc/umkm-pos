import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

/**
 * Decorator to require specific permission for endpoint access
 * Usage: @RequirePermission('product.create')
 *
 * This will be checked by PermissionGuard
 */
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);
