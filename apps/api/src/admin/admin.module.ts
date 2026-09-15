import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database';
import { UploadsModule } from '../uploads/uploads.module';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminAuthController } from './auth/admin-auth.controller';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller';
import { AdminDashboardService } from './dashboard/admin-dashboard.service';
import { AdminMerchantsController } from './merchants/admin-merchants.controller';
import { AdminMerchantsService } from './merchants/admin-merchants.service';
import { AdminOutletsController } from './outlets/admin-outlets.controller';
import { AdminOutletsService } from './outlets/admin-outlets.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';
import { AdminRolesController } from './rbac/admin-roles.controller';
import { AdminPermissionsController } from './rbac/admin-permissions.controller';

/**
 * Admin Module
 * Platform-operator endpoints under `/admin/*`, used by apps/admin.
 *
 * Unlike tenant endpoints, these are NOT scoped by the caller's merchant_id.
 * Every controller must be protected by AdminGuard.
 */
@Module({
  imports: [DatabaseModule, UploadsModule, AuthModule, RbacModule],
  controllers: [
    AdminAuthController,
    AdminDashboardController,
    AdminMerchantsController,
    AdminOutletsController,
    AdminUsersController,
    AdminRolesController,
    AdminPermissionsController,
  ],
  providers: [
    AdminGuard,
    AdminDashboardService,
    AdminMerchantsService,
    AdminOutletsService,
    AdminUsersService,
  ],
})
export class AdminModule {}
