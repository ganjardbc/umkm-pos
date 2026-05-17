import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CategoriesService } from './categories/categories.service';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private categoriesService: CategoriesService,
    private uploadsService: UploadsService,
  ) {}

  private async attachSignedUrl(product: any) {
    if (!product?.image_upload_id) return product;

    return {
      ...product,
      thumbnail: (await this.uploadsService.generateSignedUrl(product.image_upload_id))
        .url,
    };
  }

  async findAll(merchantId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;
    const where = { merchant_id: merchantId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.products.findMany({
        where,
        include: { merchants: true, product_categories: true, upload: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.products.count({ where }),
    ]);

    const dataWithSignedUrls = await Promise.all(
      data.map((product) => this.attachSignedUrl(product)),
    );

    return {
      data: dataWithSignedUrls,
      meta: PaginationDto.calculateMeta(total, page, limit),
    };
  }

  async findOne(id: string, merchantId: string) {
    const product = await this.prisma.products.findFirst({
      include: { merchants: true, product_categories: true, upload: true },
      where: { id, merchant_id: merchantId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.attachSignedUrl(product);
  }

  async create(dto: CreateProductDto, merchantId: string, userId: string) {
    // Slug must be unique per merchant
    const existing = await this.prisma.products.findFirst({
      where: { merchant_id: merchantId, slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(
        'Product slug already exists for this merchant',
      );
    }

    // Validate category_id if provided
    if (dto.category_id) {
      try {
        await this.categoriesService.findOne(dto.category_id, merchantId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            'Invalid category_id: category does not exist or belongs to another merchant',
          );
        }
        throw error;
      }
    }

    return this.prisma.products.create({
      data: {
        ...dto,
        merchant_id: merchantId,
        price: dto.price,
        cost: dto.cost ?? 0,
        stock_qty: dto.stock_qty ?? 0,
        min_stock: dto.min_stock ?? 0,
        is_active: dto.is_active ?? true,
        created_by: userId,
        updated_by: userId,
      },
      include: { merchants: true, product_categories: true, upload: true },
    });
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    merchantId: string,
    userId: string,
  ) {
    // Ensure product exists and belongs to this merchant
    await this.findOne(id, merchantId);

    // Check slug uniqueness if being updated
    if (dto.slug) {
      const conflict = await this.prisma.products.findFirst({
        where: { merchant_id: merchantId, slug: dto.slug },
      });

      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          'Product slug already exists for this merchant',
        );
      }
    }

    // Validate category_id if provided
    if (dto.category_id !== undefined) {
      if (dto.category_id === null) {
        // Allow clearing category_id by setting to null
      } else {
        // Validate category exists and belongs to same merchant
        try {
          await this.categoriesService.findOne(dto.category_id, merchantId);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(
              'Invalid category_id: category does not exist or belongs to another merchant',
            );
          }
          throw error;
        }
      }
    }

    return this.prisma.products.update({
      where: { id },
      data: {
        ...dto,
        updated_by: userId,
        updated_at: new Date(),
      },
      include: { merchants: true, product_categories: true, upload: true },
    });
  }

  async remove(id: string, merchantId: string) {
    // Ensure product exists and belongs to this merchant
    await this.findOne(id, merchantId);

    return this.prisma.products.delete({
      where: { id },
    });
  }

  async setImage(
    id: string,
    uploadId: string,
    merchantId: string,
    userId: string,
  ) {
    await this.findOne(id, merchantId);

    const upload = await this.prisma.uploads.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    return this.prisma.products.update({
      where: { id },
      data: {
        image_upload_id: uploadId,
        thumbnail: (await this.uploadsService.generateSignedUrl(uploadId)).url,
        updated_by: userId,
        updated_at: new Date(),
      },
      include: { merchants: true, product_categories: true, upload: true },
    });
  }

  async removeImage(id: string, merchantId: string, userId: string) {
    await this.findOne(id, merchantId);

    return this.prisma.products.update({
      where: { id },
      data: {
        image_upload_id: null,
        thumbnail: null,
        updated_by: userId,
        updated_at: new Date(),
      },
      include: { merchants: true, product_categories: true, upload: true },
    });
  }
}
