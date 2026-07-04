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
import { ProductsQueryDto } from './dto/products-query.dto';
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
      thumbnail: (
        await this.uploadsService.generateSignedUrl(product.image_upload_id)
      ).url,
    };
  }

  async findAll(merchantId: string, query: ProductsQueryDto) {
    const { page = 1, limit = 10, outlet_id, category_id } = query;
    const skip = query.skip;
    const where = {
      merchant_id: merchantId,
      ...(category_id && { category_id }),
    };

    if (outlet_id) {
      const outlet = await this.prisma.outlets.findFirst({
        where: { id: outlet_id, merchant_id: merchantId },
      });
      if (!outlet) {
        throw new NotFoundException(`Outlet with ID ${outlet_id} not found`);
      }
    }

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

    let inventoryMap = new Map<string, any>();
    if (outlet_id && dataWithSignedUrls.length > 0) {
      const inventories = await this.prisma.outlet_product_inventory.findMany({
        where: {
          merchant_id: merchantId,
          outlet_id,
          product_id: { in: dataWithSignedUrls.map((product) => product.id) },
        },
      });
      inventoryMap = new Map(
        inventories.map((inventory) => [inventory.product_id, inventory]),
      );
    }

    const hydratedProducts = dataWithSignedUrls.map((product) => {
      if (!outlet_id) return product;

      const inventory = inventoryMap.get(product.id);
      return {
        ...product,
        stock_qty: inventory?.stock_qty ?? 0,
        min_stock: inventory?.min_stock ?? 0,
        inventory: inventory
          ? {
              id: inventory.id,
              outlet_id: inventory.outlet_id,
              stock_qty: inventory.stock_qty,
              min_stock: inventory.min_stock,
              is_active: inventory.is_active,
            }
          : null,
      };
    });

    return {
      data: hydratedProducts,
      meta: PaginationDto.calculateMeta(total, page, limit),
    };
  }

  async findOne(id: string, merchantId: string, outletId?: string) {
    if (outletId) {
      const outlet = await this.prisma.outlets.findFirst({
        where: { id: outletId, merchant_id: merchantId },
      });
      if (!outlet) {
        throw new NotFoundException(`Outlet with ID ${outletId} not found`);
      }
    }

    const product = await this.prisma.products.findFirst({
      include: { merchants: true, product_categories: true, upload: true },
      where: { id, merchant_id: merchantId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const productWithSignedUrl = await this.attachSignedUrl(product);

    if (!outletId) return productWithSignedUrl;

    const inventory = await this.prisma.outlet_product_inventory.findFirst({
      where: {
        merchant_id: merchantId,
        outlet_id: outletId,
        product_id: id,
      },
    });

    return {
      ...productWithSignedUrl,
      stock_qty: inventory?.stock_qty ?? 0,
      min_stock: inventory?.min_stock ?? 0,
      inventory: inventory
        ? {
            id: inventory.id,
            outlet_id: inventory.outlet_id,
            stock_qty: inventory.stock_qty,
            min_stock: inventory.min_stock,
            is_active: inventory.is_active,
          }
        : null,
    };
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

    const { outlet_id, stock_qty, min_stock, ...productPayload } = dto;

    if (outlet_id) {
      const outlet = await this.prisma.outlets.findFirst({
        where: { id: outlet_id, merchant_id: merchantId },
      });
      if (!outlet) {
        throw new NotFoundException(`Outlet with ID ${outlet_id} not found`);
      }
    }

    const created = await this.prisma.products.create({
      data: {
        ...productPayload,
        merchant_id: merchantId,
        price: dto.price,
        cost: dto.cost ?? 0,
        stock_qty: 0,
        min_stock: 0,
        is_active: dto.is_active ?? true,
        created_by: userId,
        updated_by: userId,
      },
      include: { merchants: true, product_categories: true, upload: true },
    });

    if (outlet_id) {
      await this.prisma.outlet_product_inventory.upsert({
        where: {
          outlet_id_product_id: { outlet_id, product_id: created.id },
        },
        update: {
          stock_qty: stock_qty ?? 0,
          min_stock: min_stock ?? 0,
          updated_by: userId,
          updated_at: new Date(),
        },
        create: {
          merchant_id: merchantId,
          outlet_id,
          product_id: created.id,
          stock_qty: stock_qty ?? 0,
          min_stock: min_stock ?? 0,
          is_active: true,
          created_by: userId,
          updated_by: userId,
        },
      });
    }

    return created;
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

    const { outlet_id, stock_qty, min_stock, ...productPayload } = dto as any;

    if (outlet_id) {
      const outlet = await this.prisma.outlets.findFirst({
        where: { id: outlet_id, merchant_id: merchantId },
      });
      if (!outlet) {
        throw new NotFoundException(`Outlet with ID ${outlet_id} not found`);
      }
      await this.prisma.outlet_product_inventory.upsert({
        where: {
          outlet_id_product_id: { outlet_id, product_id: id },
        },
        update: {
          ...(stock_qty !== undefined ? { stock_qty } : {}),
          ...(min_stock !== undefined ? { min_stock } : {}),
          updated_by: userId,
          updated_at: new Date(),
        },
        create: {
          merchant_id: merchantId,
          outlet_id,
          product_id: id,
          stock_qty: stock_qty ?? 0,
          min_stock: min_stock ?? 0,
          is_active: true,
          created_by: userId,
          updated_by: userId,
        },
      });
    }

    return this.prisma.products.update({
      where: { id },
      data: {
        ...productPayload,
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
