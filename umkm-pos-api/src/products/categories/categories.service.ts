import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all categories for a merchant with pagination
   * @param merchantId - The merchant ID to filter categories
   * @param pagination - Pagination parameters (page, limit)
   * @returns Paginated list of categories with metadata
   */
  async findAll(merchantId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;

    const [data, total] = await Promise.all([
      this.prisma.product_categories.findMany({
        where: { merchant_id: merchantId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.product_categories.count({
        where: { merchant_id: merchantId },
      }),
    ]);

    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  /**
   * Find a single category by ID with merchant scoping
   * @param id - The category ID
   * @param merchantId - The merchant ID to ensure access control
   * @returns The category if found and belongs to the merchant
   * @throws NotFoundException if category not found or belongs to different merchant
   */
  async findOne(id: string, merchantId: string) {
    const category = await this.prisma.product_categories.findFirst({
      where: {
        id,
        merchant_id: merchantId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Create a new category for a merchant
   * @param dto - The category creation data
   * @param merchantId - The merchant ID to associate with the category
   * @param userId - The user ID creating the category (for audit trail)
   * @returns The created category
   * @throws ConflictException if category name already exists for this merchant
   */
  async create(dto: CreateCategoryDto, merchantId: string, userId: string) {
    // Check if category name already exists for this merchant
    const existingCategory = await this.prisma.product_categories.findFirst({
      where: {
        merchant_id: merchantId,
        name: dto.name,
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        'Category with this name already exists for your merchant',
      );
    }

    // Create the category with automatic fields
    const category = await this.prisma.product_categories.create({
      data: {
        merchant_id: merchantId,
        name: dto.name,
        description: dto.description || null,
        is_active: dto.is_active ?? true,
        created_by: userId,
        updated_by: userId,
      },
    });

    return category;
  }

  /**
   * Update an existing category for a merchant
   * @param id - The category ID to update
   * @param dto - The category update data
   * @param merchantId - The merchant ID to ensure access control
   * @param userId - The user ID updating the category (for audit trail)
   * @returns The updated category
   * @throws NotFoundException if category not found or belongs to different merchant
   * @throws ConflictException if new name already exists for this merchant
   */
  async update(
    id: string,
    dto: UpdateCategoryDto,
    merchantId: string,
    userId: string,
  ) {
    // Validate category exists and belongs to merchant
    const category = await this.findOne(id, merchantId);

    // If name is being updated, check for duplicates within merchant scope
    if (dto.name !== undefined && dto.name !== category.name) {
      const existingCategory = await this.prisma.product_categories.findFirst({
        where: {
          merchant_id: merchantId,
          name: dto.name,
          id: { not: id }, // Exclude current category from check
        },
      });

      if (existingCategory) {
        throw new ConflictException(
          'Category with this name already exists for your merchant',
        );
      }
    }

    // Update the category with automatic fields
    const updatedCategory = await this.prisma.product_categories.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && {
          description: dto.description || null,
        }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    return updatedCategory;
  }

  /**
   * Delete a category for a merchant with cascade logic
   * @param id - The category ID to delete
   * @param merchantId - The merchant ID to ensure access control
   * @returns The deleted category
   * @throws NotFoundException if category not found or belongs to different merchant
   */
  async remove(id: string, merchantId: string) {
    // Validate category exists and belongs to merchant
    const category = await this.findOne(id, merchantId);

    // Set category_id to NULL for all products referencing this category
    await this.prisma.products.updateMany({
      where: { category_id: id },
      data: { category_id: null },
    });

    // Delete the category record
    const deletedCategory = await this.prisma.product_categories.delete({
      where: { id },
    });

    return deletedCategory;
  }

  /**
   * Find active categories for a merchant, sorted by name
   * Returns only id and name fields for efficiency in dropdown selections
   * @param merchantId - The merchant ID to filter categories
   * @returns Array of active categories with only id and name fields, sorted by name
   */
  async findActiveCategories(merchantId: string) {
    const categories = await this.prisma.product_categories.findMany({
      where: {
        merchant_id: merchantId,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }
}
