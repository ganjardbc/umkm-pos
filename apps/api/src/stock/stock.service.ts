import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { randomUUID } from 'crypto';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { CreateStockOpnameDto } from './dto/create-stock-opname.dto';
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

    const include = {
      outlets: { select: { id: true, name: true, slug: true } },
      products: { select: { id: true, name: true, slug: true, price: true } },
    };

    if (lowStockOnly) {
      // Prisma can't compare two columns, so filter in memory before paginating
      const rows = await this.prisma.outlet_product_inventory.findMany({
        where,
        include,
        orderBy: { created_at: 'desc' },
      });
      const low = rows.filter(
        (row) => row.min_stock > 0 && row.stock_qty <= row.min_stock,
      );
      return {
        data: low.slice(skip, skip + limit),
        meta: PaginationDto.calculateMeta(low.length, page, limit),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.outlet_product_inventory.findMany({
        where,
        include,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.outlet_product_inventory.count({ where }),
    ]);

    return {
      data,
      meta: PaginationDto.calculateMeta(total, page, limit),
    };
  }

  /**
   * List all stock_logs for a merchant (via product.merchant_id).
   * Optionally filter by product_id, outlet_id, and search.
   */
  async findLogs(
    merchantId: string,
    productId?: string,
    outletId?: string,
    pagination: PaginationDto = new PaginationDto(),
    search?: string,
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
      ...(search && {
        OR: [
          { products: { name: { contains: search } } },
          { reason: { contains: search } },
        ],
      }),
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

  /**
   * Stock opname: set the outlet stock of every counted product to what was
   * physically counted. The difference is computed inside the transaction from
   * the stock at that moment, so sales made while counting are not overwritten
   * twice. Uncounted products are untouched. One movement per changed product,
   * all sharing the same ref_id so the session can be traced.
   */
  async opname(dto: CreateStockOpnameDto, merchantId: string, userId: string) {
    const ids = dto.counts.map((c) => c.product_id);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('A product appears more than once');
    }

    const outlet = await this.prisma.outlets.findFirst({
      where: { id: dto.outlet_id, merchant_id: merchantId },
    });
    if (!outlet) {
      throw new NotFoundException(`Outlet with ID ${dto.outlet_id} not found`);
    }

    const products = await this.prisma.products.findMany({
      where: { id: { in: ids }, merchant_id: merchantId },
      select: { id: true, name: true, min_stock: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));
    const unknown = ids.filter((id) => !productById.has(id));
    if (unknown.length > 0) {
      throw new NotFoundException(
        `Product(s) not found: ${unknown.join(', ')}`,
      );
    }

    const opnameId = randomUUID();
    // shortcut: one query pair per counted product inside a single transaction
    // (<= 500 rows); batch the writes if opname sessions ever get much larger.
    const items = await this.prisma.$transaction(
      async (tx) => {
        const result: Array<{
          product_id: string;
          name: string;
          before: number;
          counted: number;
          diff: number;
        }> = [];
        for (const count of dto.counts) {
          const product = productById.get(count.product_id)!;
          const inventory = await tx.outlet_product_inventory.findFirst({
            where: {
              merchant_id: merchantId,
              outlet_id: dto.outlet_id,
              product_id: count.product_id,
            },
          });
          const before = inventory?.stock_qty ?? 0;
          const diff = count.counted_qty - before;
          result.push({
            product_id: count.product_id,
            name: product.name,
            before,
            counted: count.counted_qty,
            diff,
          });
          if (diff === 0) continue;

          if (inventory) {
            await tx.outlet_product_inventory.update({
              where: {
                outlet_id_product_id: {
                  outlet_id: dto.outlet_id,
                  product_id: count.product_id,
                },
              },
              data: {
                stock_qty: count.counted_qty,
                updated_by: userId,
                updated_at: new Date(),
              },
            });
          } else {
            await tx.outlet_product_inventory.create({
              data: {
                merchant_id: merchantId,
                outlet_id: dto.outlet_id,
                product_id: count.product_id,
                stock_qty: count.counted_qty,
                min_stock: product.min_stock ?? 0,
                is_active: true,
                created_by: userId,
                updated_by: userId,
              },
            });
          }
          await tx.inventory_movements.create({
            data: {
              merchant_id: merchantId,
              outlet_id: dto.outlet_id,
              product_id: count.product_id,
              change_qty: diff,
              stock_after: count.counted_qty,
              reason: 'opname_adjustment',
              ref_type: 'stock_opname',
              ref_id: opnameId,
              note: dto.note ?? null,
              created_by: userId,
              updated_by: userId,
            },
          });
        }
        return result;
      },
      { timeout: 30000 },
    );

    return {
      opname_id: opnameId,
      counted: items.length,
      adjusted: items.filter((i) => i.diff !== 0).length,
      items,
    };
  }
}
