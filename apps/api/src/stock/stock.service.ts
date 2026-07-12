import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

const INCREASE_REASONS = new Set([
  'restock',
  'correction_plus',
  'opname_adjustment',
]);
const DECREASE_REASONS = new Set([
  'damage',
  'expired',
  'shrinkage',
  'correction_minus',
  'opname_adjustment',
]);

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findInventory(
    merchantId: string,
    outletId?: string,
    lowStockOnly?: boolean,
    pagination: PaginationDto = new PaginationDto(),
  ) {
    if (outletId) {
      const outlet = await this.prisma.outlets.findFirst({
        where: { id: outletId, merchant_id: merchantId },
      });
      if (!outlet) {
        throw new NotFoundException(`Outlet with ID ${outletId} not found`);
      }
    }

    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;
    const where = {
      merchant_id: merchantId,
      ...(outletId ? { outlet_id: outletId } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.outlet_product_inventory.findMany({
        where,
        include: {
          outlets: { select: { id: true, name: true, slug: true } },
          products: {
            select: { id: true, name: true, slug: true, price: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.outlet_product_inventory.count({ where }),
    ]);

    const filtered = lowStockOnly
      ? data.filter((row) => row.stock_qty <= row.min_stock)
      : data;

    return {
      data: filtered,
      meta: PaginationDto.calculateMeta(total, page, limit),
    };
  }

  /**
   * List all stock_logs for a merchant (via product.merchant_id).
   * Optionally filter by product_id.
   */
  async findLogs(
    merchantId: string,
    productId?: string,
    outletId?: string,
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

    if (outletId) {
      const outlet = await this.prisma.outlets.findFirst({
        where: { id: outletId, merchant_id: merchantId },
      });
      if (!outlet) {
        throw new NotFoundException(`Outlet with ID ${outletId} not found`);
      }
    }

    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;
    const where = {
      merchant_id: merchantId,
      ...(productId ? { product_id: productId } : {}),
      ...(outletId ? { outlet_id: outletId } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventory_movements.findMany({
        where,
        include: {
          outlets: {
            select: { id: true, name: true, slug: true },
          },
          products: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.inventory_movements.count({ where }),
    ]);

    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  /**
   * Manual stock adjustment.
   * - Validates product belongs to this merchant.
   * - change_qty must be non-zero.
   * - Prevents stock from going below 0.
   * - Updates outlet-level inventory and writes inventory movements atomically.
   */
  async adjust(
    dto: CreateStockAdjustmentDto,
    merchantId: string,
    userId: string,
  ) {
    if (dto.change_qty === 0) {
      throw new BadRequestException('change_qty must not be 0');
    }
    if (dto.change_qty > 0 && !INCREASE_REASONS.has(dto.reason)) {
      throw new BadRequestException(
        `reason "${dto.reason}" is not valid for positive change_qty`,
      );
    }
    if (dto.change_qty < 0 && !DECREASE_REASONS.has(dto.reason)) {
      throw new BadRequestException(
        `reason "${dto.reason}" is not valid for negative change_qty`,
      );
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

    const outlet = await this.prisma.outlets.findFirst({
      where: { id: dto.outlet_id, merchant_id: merchantId },
    });
    if (!outlet) {
      throw new NotFoundException(`Outlet with ID ${dto.outlet_id} not found`);
    }

    const inventory = await this.prisma.outlet_product_inventory.findFirst({
      where: {
        merchant_id: merchantId,
        outlet_id: dto.outlet_id,
        product_id: dto.product_id,
      },
    });

    // If inventory row does not exist yet, allow creating it only for positive adjustments.
    if (!inventory && dto.change_qty < 0) {
      throw new NotFoundException(
        `Inventory row for outlet ${dto.outlet_id} and product ${dto.product_id} not found`,
      );
    }

    const currentStock = inventory?.stock_qty ?? 0;
    const newStock = currentStock + dto.change_qty;
    if (newStock < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current: ${currentStock}, Change: ${dto.change_qty}. Stock cannot go below 0.`,
      );
    }

    const upsertedInventory = inventory
      ? this.prisma.outlet_product_inventory.update({
          where: {
            outlet_id_product_id: {
              outlet_id: dto.outlet_id,
              product_id: dto.product_id,
            },
          },
          data: {
            stock_qty: newStock,
            updated_by: userId,
            updated_at: new Date(),
          },
        })
      : this.prisma.outlet_product_inventory.create({
          data: {
            merchant_id: merchantId,
            outlet_id: dto.outlet_id,
            product_id: dto.product_id,
            stock_qty: newStock,
            min_stock: product.min_stock ?? 0,
            is_active: true,
            created_by: userId,
            updated_by: userId,
          },
        });

    // Atomic update: adjust outlet stock + write movement
    const [updatedInventory, movement] = await this.prisma.$transaction([
      upsertedInventory,
      this.prisma.inventory_movements.create({
        data: {
          merchant_id: merchantId,
          outlet_id: dto.outlet_id,
          product_id: dto.product_id,
          change_qty: dto.change_qty,
          stock_after: newStock,
          reason: dto.reason,
          ref_type: 'manual_adjustment',
          ref_id: null,
          note: dto.note ?? null,
          created_by: userId,
          updated_by: userId,
        },
        include: {
          products: {
            select: { id: true, name: true, slug: true },
          },
          outlets: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
    ]);

    return {
      outlet_inventory: {
        outlet_id: updatedInventory.outlet_id,
        product_id: updatedInventory.product_id,
        stock_qty: updatedInventory.stock_qty,
      },
      movement,
    };
  }
}
