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
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { CategoriesQueryDto } from './dto/categories-query.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('products/categories')
@UseGuards(PermissionGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequirePermission('category.create')
  @ApiOperation({
    summary: 'Create a new product category for the current merchant',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed - invalid input',
  })
  @ApiResponse({
    status: 409,
    description: 'Category name already exists for this merchant',
  })
  create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.categoriesService.create(dto, merchantId, userId);
  }

  @Get()
  @RequirePermission('category.read')
  @ApiOperation({
    summary: 'List all product categories for the current merchant',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search categories by name or description',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all categories (paginated)',
  })
  findAll(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() query: CategoriesQueryDto,
  ) {
    return this.categoriesService.findAll(merchantId, query);
  }

  @Get('active/list')
  @RequirePermission('category.read')
  @ApiOperation({ summary: 'Get active categories for dropdown selection' })
  @ApiResponse({
    status: 200,
    description: 'Return active categories sorted by name',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  })
  findActiveCategories(@CurrentUser('merchant_id') merchantId: string) {
    return this.categoriesService.findActiveCategories(merchantId);
  }

  @Get(':id')
  @RequirePermission('category.read')
  @ApiOperation({ summary: 'Get a product category by ID (merchant-scoped)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Return category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  findOne(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.categoriesService.findOne(id, merchantId);
  }

  @Patch(':id')
  @RequirePermission('category.update')
  @ApiOperation({ summary: 'Update a product category (merchant-scoped)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed - invalid input',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Category name already exists for this merchant',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.categoriesService.update(id, dto, merchantId, userId);
  }

  @Delete(':id')
  @RequirePermission('category.delete')
  @ApiOperation({ summary: 'Delete a product category (merchant-scoped)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.categoriesService.remove(id, merchantId);
  }
}
