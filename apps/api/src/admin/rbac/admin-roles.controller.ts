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
import { RbacService } from '../../rbac/rbac.service';
import { CreateRoleDto } from '../../rbac/dto/create-role.dto';
import { UpdateRoleDto } from '../../rbac/dto/update-role.dto';
import { AssignPermissionDto } from '../../rbac/dto/assign-permission.dto';
import { RolesQueryDto } from '../../rbac/dto/roles-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';

/**
 * Roles are global (not merchant-scoped), so only platform admins manage them.
 * Tenants can still read them via GET /rbac/roles.
 */
@ApiTags('Admin - Roles')
@ApiBearerAuth()
@Controller('admin/roles')
@UseGuards(AdminGuard, PermissionGuard)
export class AdminRolesController {
  constructor(private readonly rbacService: RbacService) {}

  @Post()
  @RequirePermission('role.create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  create(@Body() dto: CreateRoleDto, @CurrentUser('id') userId: string) {
    return this.rbacService.createRole(dto, userId);
  }

  @Get()
  @RequirePermission('role.read')
  @ApiOperation({ summary: 'List all roles with their permissions' })
  @ApiResponse({ status: 200, description: 'Return roles (paginated)' })
  findAll(@Query() query: RolesQueryDto) {
    return this.rbacService.findAllRoles(query);
  }

  @Get(':id')
  @RequirePermission('role.read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Return role with permissions' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOne(@Param('id') id: string) {
    return this.rbacService.findOneRole(id);
  }

  @Patch(':id')
  @RequirePermission('role.update')
  @ApiOperation({ summary: 'Update a role name or description' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.rbacService.updateRole(id, dto, userId);
  }

  @Delete(':id')
  @RequirePermission('role.delete')
  @ApiOperation({
    summary: 'Delete a role (cascades role_permissions and user_roles)',
  })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  remove(@Param('id') id: string) {
    return this.rbacService.removeRole(id);
  }

  @Post(':id/permissions')
  @RequirePermission('role.update')
  @ApiOperation({ summary: 'Assign a permission to a role' })
  @ApiResponse({ status: 201, description: 'Permission assigned to role' })
  @ApiResponse({ status: 409, description: 'Permission already assigned' })
  assignPermission(
    @Param('id') roleId: string,
    @Body() dto: AssignPermissionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.rbacService.assignPermissionToRole(roleId, dto, userId);
  }

  @Delete(':id/permissions/:permId')
  @RequirePermission('role.update')
  @ApiOperation({ summary: 'Revoke a permission from a role' })
  @ApiResponse({ status: 200, description: 'Permission revoked from role' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  revokePermission(
    @Param('id') roleId: string,
    @Param('permId') permissionId: string,
  ) {
    return this.rbacService.revokePermissionFromRole(roleId, permissionId);
  }
}
