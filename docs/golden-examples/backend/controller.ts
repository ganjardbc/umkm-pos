/**
 * GOLDEN EXAMPLE — Backend Controller
 *
 * Source: apps/api/src/products/products.controller.ts
 *
 * Rules illustrated:
 * - ADR-001: merchant_id selalu dari @CurrentUser('merchant_id'), tidak pernah dari DTO/body
 * - ADR-004: findAll gunakan @Query() query: ProductsQueryDto (extends PaginationDto)
 *            — satu binding, tidak mix @Query('param') + @Query()
 * - Setiap endpoint wajib @RequirePermission('<resource>.<action>')
 * - Controller tipis: tidak ada business logic, hanya routing + delegate ke service
 * - @UseGuards(PermissionGuard) di class level, bukan per-method
 */

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
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SetProductImageDto } from './dto/set-product-image.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(PermissionGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermission('product.create')
  @ApiOperation({ summary: 'Create a new product for the current merchant' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Slug already exists for this merchant',
  })
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.create(dto, merchantId, userId);
  }

  @Get()
  @RequirePermission('product.read')
  @ApiOperation({ summary: 'List all products for the current merchant' })
  @ApiResponse({ status: 200, description: 'Return all products (paginated)' })
  findAll(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() query: ProductsQueryDto,
  ) {
    return this.productsService.findAll(merchantId, query);
  }

  @Get(':id')
  @RequirePermission('product.read')
  @ApiOperation({ summary: 'Get product by ID (merchant-scoped)' })
  @ApiResponse({ status: 200, description: 'Return product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Product ID (UUID format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  findOne(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
    @Query('outlet_id') outletId?: string,
  ) {
    return this.productsService.findOne(id, merchantId, outletId);
  }

  @Patch(':id')
  @RequirePermission('product.update')
  @ApiOperation({ summary: 'Update product details (merchant-scoped)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({
    status: 409,
    description: 'Slug already exists for this merchant',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.update(id, dto, merchantId, userId);
  }

  @Delete(':id')
  @RequirePermission('product.delete')
  @ApiOperation({ summary: 'Delete a product (merchant-scoped)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.productsService.remove(id, merchantId);
  }

  @Patch(':id/image')
  @RequirePermission('product.update')
  @ApiOperation({ summary: 'Set product image from an uploaded file' })
  @ApiResponse({ status: 200, description: 'Product image set successfully' })
  @ApiResponse({ status: 404, description: 'Product or upload not found' })
  setImage(
    @Param('id') id: string,
    @Body() dto: SetProductImageDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.setImage(id, dto.upload_id, merchantId, userId);
  }

  @Delete(':id/image')
  @RequirePermission('product.update')
  @ApiOperation({ summary: 'Remove product image' })
  @ApiResponse({
    status: 200,
    description: 'Product image removed successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  removeImage(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.removeImage(id, merchantId, userId);
  }
}
