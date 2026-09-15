import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RolesQueryDto } from './dto/roles-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { ScopeByOutlet } from '../common/decorators/scope-by-outlet.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';
import { ScopeByOutletGuard } from '../common/guards/scope-by-outlet.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

/**
 * Tenant-facing RBAC endpoints.
 * Roles and permissions are global, so creating/updating/deleting them is
 * platform-admin only and lives under `/admin/roles` and `/admin/permissions`.
 */
@ApiTags('RBAC')
@ApiBearerAuth()
@Controller('rbac')
@UseGuards(PermissionGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ─────────────────────────────────────────────
  //  ROLES
  // ─────────────────────────────────────────────

  @Get('roles')
  // @RequirePermission('role.read')
  @ApiOperation({ summary: 'List all roles with their permissions' })
  @ApiResponse({ status: 200, description: 'Return all roles (paginated)' })
  findAllRoles(@Query() query: RolesQueryDto) {
    return this.rbacService.findAllRoles(query);
  }

  @Get('roles/:id')
  @RequirePermission('role.read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Return role with permissions' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOneRole(@Param('id') id: string) {
    return this.rbacService.findOneRole(id);
  }

  // ─────────────────────────────────────────────
  //  PERMISSIONS
  // ─────────────────────────────────────────────

  @Get('permissions')
  // @RequirePermission('permission.read')
  @ApiOperation({ summary: 'List all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Return all permissions (paginated)',
  })
  findAllPermissions(@Query() pagination: PaginationDto) {
    return this.rbacService.findAllPermissions(pagination);
  }

  @Get('permissions/:id')
  @RequirePermission('permission.read')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Return permission' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  findOnePermission(@Param('id') id: string) {
    return this.rbacService.findOnePermission(id);
  }

  // ─────────────────────────────────────────────
  //  USER ↔ ROLES
  // ─────────────────────────────────────────────

  @Post('user-roles')
  @RequirePermission('role.assign')
  @ScopeByOutlet('body.outlet_id')
  @UseGuards(ScopeByOutletGuard)
  @ApiOperation({ summary: 'Assign a role to a user at a specific outlet' })
  @ApiResponse({ status: 201, description: 'Role assigned to user' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  @ApiResponse({
    status: 403,
    description: 'Outlet does not belong to your merchant',
  })
  @ApiResponse({ status: 409, description: 'Role already assigned' })
  assignRoleToUser(
    @Body() dto: AssignRoleDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.rbacService.assignRoleToUser(merchantId, dto, userId);
  }

  @Delete('user-roles')
  @RequirePermission('role.assign')
  @ScopeByOutlet('body.outlet_id')
  @UseGuards(ScopeByOutletGuard)
  @ApiOperation({ summary: 'Revoke a role from a user at a specific outlet' })
  @ApiResponse({ status: 200, description: 'Role revoked from user' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({
    status: 403,
    description: 'Outlet does not belong to your merchant',
  })
  revokeRoleFromUser(
    @Body() dto: AssignRoleDto,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.rbacService.revokeRoleFromUser(merchantId, dto);
  }

  @Get('users/:userId/roles')
  // @RequirePermission('role.read')
  @ApiOperation({
    summary: 'List all roles assigned to a user (with permissions)',
  })
  @ApiResponse({ status: 200, description: 'Return user role assignments' })
  getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId);
  }
}
