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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetUserAvatarDto } from './dto/set-user-avatar.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermission('user.create')
  @ApiOperation({ summary: 'Create a new user under the current merchant' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists for this merchant',
  })
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.create(dto, merchantId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all users for the current merchant' })
  @ApiResponse({
    status: 200,
    description: 'Return all users, paginated (no password_hash)',
  })
  findAll(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.findAll(merchantId, pagination);
  }

  @Get(':id')
  @RequirePermission('user.read')
  @ApiOperation({ summary: 'Get user by ID (merchant-scoped)' })
  @ApiResponse({ status: 200, description: 'Return user details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.usersService.findOne(id, merchantId);
  }

  @Patch(':id')
  @RequirePermission('user.update')
  @ApiOperation({ summary: 'Update user details (merchant-scoped)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists for this merchant',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.update(id, dto, merchantId, userId);
  }

  @Delete(':id')
  @RequirePermission('user.delete')
  @ApiOperation({ summary: 'Deactivate a user (soft-delete, merchant-scoped)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.remove(id, merchantId, userId);
  }

  @Patch(':id/avatar')
  @RequirePermission('user.update')
  @ApiOperation({ summary: 'Set user avatar from an uploaded file' })
  @ApiResponse({ status: 200, description: 'User avatar set successfully' })
  @ApiResponse({ status: 404, description: 'User or upload not found' })
  setAvatar(
    @Param('id') id: string,
    @Body() dto: SetUserAvatarDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.setAvatar(id, dto.upload_id, merchantId, userId);
  }

  @Delete(':id/avatar')
  @RequirePermission('user.update')
  @ApiOperation({ summary: 'Remove user avatar' })
  @ApiResponse({ status: 200, description: 'User avatar removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  removeAvatar(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.removeAvatar(id, merchantId, userId);
  }
}
