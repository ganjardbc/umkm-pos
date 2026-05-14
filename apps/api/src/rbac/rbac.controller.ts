import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('RBAC')
@ApiBearerAuth()
@Controller('rbac')
@UseGuards(PermissionGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ─────────────────────────────────────────────
  //  ROLES
  // ─────────────────────────────────────────────

  @Post('roles')
  @RequirePermission('role.create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  createRole(@Body() dto: CreateRoleDto, @CurrentUser('id') userId: string) {
    return this.rbacService.createRole(dto, userId);
  }

  @Get('roles')
  // @RequirePermission('role.read')
  @ApiOperation({ summary: 'List all roles with their permissions' })
  @ApiResponse({ status: 200, description: 'Return all roles (paginated)' })
  findAllRoles(@Query() pagination: PaginationDto) {
    return this.rbacService.findAllRoles(pagination);
  }

  @Get('roles/:id')
  @RequirePermission('role.read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Return role with permissions' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOneRole(@Param('id') id: string) {
    return this.rbacService.findOneRole(id);
  }

  @Patch('roles/:id')
  @RequirePermission('role.update')
  @ApiOperation({ summary: 'Update a role name or description' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.rbacService.updateRole(id, dto, userId);
  }

  @Delete('roles/:id')
  @RequirePermission('role.delete')
  @ApiOperation({
    summary: 'Delete a role (cascades role_permissions and user_roles)',
  })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  removeRole(@Param('id') id: string) {
    return this.rbacService.removeRole(id);
  }

  // ─────────────────────────────────────────────
  //  PERMISSIONS
  // ─────────────────────────────────────────────

  @Post('permissions')
  @RequirePermission('permission.create')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 409, description: 'Permission code already exists' })
  createPermission(
    @Body() dto: CreatePermissionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.rbacService.createPermission(dto, userId);
  }

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

  @Delete('permissions/:id')
  @RequirePermission('permission.delete')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  removePermission(@Param('id') id: string) {
    return this.rbacService.removePermission(id);
  }

  // ─────────────────────────────────────────────
  //  ROLE ↔ PERMISSIONS
  // ─────────────────────────────────────────────

  @Post('roles/:id/permissions')
  @RequirePermission('role.update')
  @ApiOperation({ summary: 'Assign a permission to a role' })
  @ApiResponse({ status: 201, description: 'Permission assigned to role' })
  @ApiResponse({ status: 409, description: 'Permission already assigned' })
  assignPermissionToRole(
    @Param('id') roleId: string,
    @Body() dto: AssignPermissionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.rbacService.assignPermissionToRole(roleId, dto, userId);
  }

  @Delete('roles/:id/permissions/:permId')
  @RequirePermission('role.update')
  @ApiOperation({ summary: 'Revoke a permission from a role' })
  @ApiResponse({ status: 200, description: 'Permission revoked from role' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  revokePermissionFromRole(
    @Param('id') roleId: string,
    @Param('permId') permissionId: string,
  ) {
    return this.rbacService.revokePermissionFromRole(roleId, permissionId);
  }

  // ─────────────────────────────────────────────
  //  USER ↔ ROLES
  // ─────────────────────────────────────────────

  @Post('user-roles')
  @RequirePermission('role.assign')
  @ApiOperation({ summary: 'Assign a role to a user at a specific outlet' })
  @ApiResponse({ status: 201, description: 'Role assigned to user' })
  @ApiResponse({ status: 409, description: 'Role already assigned' })
  assignRoleToUser(
    @Body() dto: AssignRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.rbacService.assignRoleToUser(dto, userId);
  }

  @Delete('user-roles')
  @RequirePermission('role.assign')
  @ApiOperation({ summary: 'Revoke a role from a user at a specific outlet' })
  @ApiResponse({ status: 200, description: 'Role revoked from user' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  revokeRoleFromUser(@Body() dto: AssignRoleDto) {
    return this.rbacService.revokeRoleFromUser(dto);
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
