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
import { RbacService } from '../../rbac/rbac.service';
import { CreatePermissionDto } from '../../rbac/dto/create-permission.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Admin - Permissions')
@ApiBearerAuth()
@Controller('admin/permissions')
@UseGuards(AdminGuard, PermissionGuard)
export class AdminPermissionsController {
  constructor(private readonly rbacService: RbacService) {}

  @Post()
  @RequirePermission('permission.create')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 409, description: 'Permission code already exists' })
  create(@Body() dto: CreatePermissionDto, @CurrentUser('id') userId: string) {
    return this.rbacService.createPermission(dto, userId);
  }

  @Get()
  @RequirePermission('permission.read')
  @ApiOperation({ summary: 'List all permissions' })
  @ApiResponse({ status: 200, description: 'Return permissions (paginated)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.rbacService.findAllPermissions(pagination);
  }

  @Get(':id')
  @RequirePermission('permission.read')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Return permission' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  findOne(@Param('id') id: string) {
    return this.rbacService.findOnePermission(id);
  }

  @Delete(':id')
  @RequirePermission('permission.delete')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  remove(@Param('id') id: string) {
    return this.rbacService.removePermission(id);
  }
}
