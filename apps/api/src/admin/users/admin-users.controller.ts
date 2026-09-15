import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import {
  AdminCreateUserDto,
  AdminUserRoleDto,
  AdminUsersQueryDto,
} from './dto/admin-users.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { SetUserAvatarDto } from '../../users/dto/set-user-avatar.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(AdminGuard, PermissionGuard)
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Post()
  @RequirePermission('user.create')
  @ApiOperation({ summary: 'Create a user under any merchant' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Merchant not found' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  create(@Body() dto: AdminCreateUserDto, @CurrentUser('id') userId: string) {
    return this.usersService.create(dto, userId);
  }

  @Get()
  @RequirePermission('user.read')
  @ApiOperation({ summary: 'List users across merchants' })
  @ApiResponse({ status: 200, description: 'Return users (paginated)' })
  findAll(@Query() query: AdminUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('user.read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return user details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('user.update')
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.update(id, dto, userId);
  }

  @Delete(':id')
  @RequirePermission('user.delete')
  @ApiOperation({ summary: 'Deactivate a user (soft-delete)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot deactivate own account' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.usersService.remove(id, userId);
  }

  @Patch(':id/avatar')
  @RequirePermission('user.update')
  @ApiOperation({ summary: 'Set user avatar from an uploaded file' })
  @ApiResponse({ status: 200, description: 'User avatar set successfully' })
  @ApiResponse({ status: 404, description: 'User or upload not found' })
  setAvatar(
    @Param('id') id: string,
    @Body() dto: SetUserAvatarDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.setAvatar(id, dto.upload_id, userId);
  }

  @Delete(':id/avatar')
  @RequirePermission('user.update')
  @ApiOperation({ summary: 'Remove user avatar' })
  @ApiResponse({ status: 200, description: 'User avatar removed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  removeAvatar(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.usersService.removeAvatar(id, userId);
  }

  @Get(':id/roles')
  @RequirePermission('user.read')
  @ApiOperation({ summary: 'List role assignments of a user' })
  @ApiResponse({ status: 200, description: 'Return role assignments' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getRoles(@Param('id') id: string) {
    return this.usersService.getRoles(id);
  }

  @Post(':id/roles')
  @RequirePermission('role.assign')
  @ApiOperation({ summary: 'Assign a role to a user at an outlet' })
  @ApiResponse({ status: 201, description: 'Role assigned to user' })
  @ApiResponse({ status: 400, description: "Outlet not in user's merchant" })
  @ApiResponse({ status: 409, description: 'Role already assigned' })
  assignRole(
    @Param('id') id: string,
    @Body() dto: AdminUserRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.assignRole(id, dto, userId);
  }

  @Delete(':id/roles')
  @RequirePermission('role.assign')
  @ApiOperation({ summary: 'Revoke a role from a user at an outlet' })
  @ApiResponse({ status: 200, description: 'Role revoked from user' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  revokeRole(@Param('id') id: string, @Body() dto: AdminUserRoleDto) {
    return this.usersService.revokeRole(id, dto);
  }
}
