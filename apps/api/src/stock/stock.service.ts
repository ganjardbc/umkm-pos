import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  /**
   * List all stock_logs for a merchant (via product.merchant_id).
   * Optionally filter by product_id.
   */
  async findLogs(
    merchantId: string,
    productId?: string,
    pagination: PaginationDto = new PaginationDto(),
  ) {
    // If filtering by product, verify it belongs to this merchant first
    if (productId) {
      const product = await this.prisma.products.findFirst({
        where: { id: productId, merchant_id: merchantId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
    }

    // Fetch all product ids that belong to this merchant
    const products = await this.prisma.products.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const productIds = products.map((p) => p.id);

    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;
    const where = {
      product_id: productId ? productId : { in: productIds },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.stock_logs.findMany({
        where,
        include: {
          products: {
            select: { id: true, name: true, slug: true, stock_qty: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stock_logs.count({ where }),
    ]);

    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  /**
   * Manual stock adjustment.
   * - Validates product belongs to this merchant.
   * - change_qty must be non-zero.
   * - Prevents stock from going below 0.
   * - Updates product.stock_qty and writes stock_logs atomically.
   */
  async adjust(
    dto: CreateStockAdjustmentDto,
    merchantId: string,
    userId: string,
  ) {
    if (dto.change_qty === 0) {
      throw new BadRequestException('change_qty must not be 0');
    }

    // Validate product belongs to this merchant
    const product = await this.prisma.products.findFirst({
      where: { id: dto.product_id, merchant_id: merchantId },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${dto.product_id} not found`,
      );
    }

    const newStock = product.stock_qty + dto.change_qty;
    if (newStock < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current: ${product.stock_qty}, Change: ${dto.change_qty}. Stock cannot go below 0.`,
      );
    }

    // Atomic update: adjust stock + write log
    const [updatedProduct, log] = await this.prisma.$transaction([
      this.prisma.products.update({
        where: { id: dto.product_id },
        data: {
          stock_qty: newStock,
          updated_by: userId,
          updated_at: new Date(),
        },
      }),
      this.prisma.stock_logs.create({
        data: {
          product_id: dto.product_id,
          change_qty: dto.change_qty,
          reason: dto.reason,
          ref_id: null,
          created_by: userId,
          updated_by: userId,
        },
        include: {
          products: {
            select: { id: true, name: true, slug: true, stock_qty: true },
          },
        },
      }),
    ]);

    return {
      product: {
        id: updatedProduct.id,
        stock_qty: updatedProduct.stock_qty,
      },
      log,
    };
  }
}
