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
import { AdminMerchantsService } from './admin-merchants.service';
import { CreateMerchantDto } from '../../merchants/dto/create-merchant.dto';
import { UpdateMerchantDto } from '../../merchants/dto/update-merchant.dto';
import { SetMerchantImageDto } from '../../merchants/dto/set-merchant-image.dto';
import { MerchantsQueryDto } from '../../merchants/dto/merchants-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';

@ApiTags('Admin - Merchants')
@ApiBearerAuth()
@Controller('admin/merchants')
@UseGuards(AdminGuard, PermissionGuard)
export class AdminMerchantsController {
  constructor(private readonly merchantsService: AdminMerchantsService) {}

  @Post()
  @RequirePermission('merchants.create')
  @ApiOperation({ summary: 'Create a new merchant' })
  @ApiResponse({ status: 201, description: 'Merchant created successfully' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  create(@Body() dto: CreateMerchantDto, @CurrentUser('id') userId: string) {
    return this.merchantsService.create(dto, userId);
  }

  @Get()
  @RequirePermission('merchants.read')
  @ApiOperation({ summary: 'List all merchants on the platform' })
  @ApiResponse({ status: 200, description: 'Return merchants (paginated)' })
  findAll(@Query() query: MerchantsQueryDto) {
    return this.merchantsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('merchants.read')
  @ApiOperation({ summary: 'Get merchant by ID' })
  @ApiResponse({ status: 200, description: 'Return merchant details' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  findOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('merchants.update')
  @ApiOperation({ summary: 'Update merchant details' })
  @ApiResponse({ status: 200, description: 'Merchant updated successfully' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMerchantDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.merchantsService.update(id, dto, userId);
  }

  @Delete(':id')
  @RequirePermission('merchants.delete')
  @ApiOperation({ summary: 'Delete a merchant' })
  @ApiResponse({ status: 200, description: 'Merchant deleted successfully' })
  @ApiResponse({ status: 403, description: 'Admin merchant cannot be deleted' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  remove(@Param('id') id: string) {
    return this.merchantsService.remove(id);
  }

  @Patch(':id/image')
  @RequirePermission('merchants.update')
  @ApiOperation({ summary: 'Set merchant logo from an uploaded file' })
  @ApiResponse({ status: 200, description: 'Merchant logo set successfully' })
  @ApiResponse({ status: 404, description: 'Merchant or upload not found' })
  setImage(
    @Param('id') id: string,
    @Body() dto: SetMerchantImageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.merchantsService.setImage(id, dto.upload_id, userId);
  }

  @Delete(':id/image')
  @RequirePermission('merchants.update')
  @ApiOperation({ summary: 'Remove merchant logo' })
  @ApiResponse({ status: 200, description: 'Merchant logo removed' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  removeImage(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.merchantsService.removeImage(id, userId);
  }
}
