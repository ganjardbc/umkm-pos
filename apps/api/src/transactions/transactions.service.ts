import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ShiftsService } from '../shifts/shifts.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private shiftsService: ShiftsService,
  ) {}

  async findAll(
    merchantId: string,
    outletId?: string,
    is_cancelled?: boolean,
    pagination: PaginationDto = new PaginationDto(),
  ) {
    const outletWhere = outletId
      ? { id: outletId, merchant_id: merchantId }
      : { merchant_id: merchantId };

    // Validate outlet belongs to this merchant if outletId given
    if (outletId) {
      const outlet = await this.prisma.outlets.findFirst({
        where: outletWhere,
      });
      if (!outlet) {
        throw new NotFoundException(`Outlet with ID ${outletId} not found`);
      }
    }

    // Collect outlet IDs that belong to this merchant
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;
    const where = {
      outlet_id: outletId ? outletId : { in: outletIds },
      ...(is_cancelled !== undefined && { is_cancelled }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transactions.findMany({
        where,
        include: {
          transaction_items: true,
          outlets: true,
          shifts: true,
          users: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transactions.count({ where }),
    ]);

    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  async findOne(id: string, merchantId: string) {
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const transaction = await this.prisma.transactions.findFirst({
      where: {
        id,
        outlet_id: { in: outletIds },
      },
      include: {
        transaction_items: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async create(dto: CreateTransactionDto, merchantId: string, userId: string) {
    // 1. Validate outlet belongs to this merchant
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: dto.outlet_id, merchant_id: merchantId },
    });
    if (!outlet) {
      throw new UnauthorizedException(
        `Outlet with ID ${dto.outlet_id} does not belong to your merchant`,
      );
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Transaction must have at least one item');
    }

    // Task 4.1, 4.4, 4.5: Validate shift and participant if shift_id provided
    let cashierId = userId;
    if (dto.shift_id) {
      // Validate shift exists and is open
      try {
        await this.shiftsService.validateShiftOpen(dto.shift_id);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            'Shift is not available for transactions',
          );
        }
        throw error;
      }

      // Validate user is an active participant in the shift
      const isActiveParticipant = await this.shiftsService.isActiveParticipant(
        dto.shift_id,
        userId,
      );
      if (!isActiveParticipant) {
        throw new ForbiddenException('User is not a participant in this shift');
      }

      cashierId = userId;
    }

    // 2. Fetch all products (merchant-scoped) and validate stock
    const productIds = dto.items.map((i) => i.product_id);
    const products = await this.prisma.products.findMany({
      where: {
        id: { in: productIds },
        merchant_id: merchantId,
        is_active: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found or inactive');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. Validate stock availability
    let totalAmount = 0;
    const itemsData: {
      product_id: string;
      product_name_snapshot: string;
      price_snapshot: number;
      qty: number;
      subtotal: number;
    }[] = [];

    for (const item of dto.items) {
      const product = productMap.get(item.product_id)!;
      if (product.stock_qty < item.qty) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.name}". Available: ${product.stock_qty}, Requested: ${item.qty}`,
        );
      }

      const price = Number(product.price);
      const subtotal = price * item.qty;
      totalAmount += subtotal;

      itemsData.push({
        product_id: product.id,
        product_name_snapshot: product.name,
        price_snapshot: price,
        qty: item.qty,
        subtotal,
      });
    }

    // 4. Atomic DB transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.transactions.create({
        data: {
          outlet_id: dto.outlet_id,
          user_id: userId,
          shift_id: dto.shift_id ?? null,
          cashier_id: cashierId,
          payment_method: dto.payment_method,
          total_amount: totalAmount,
          is_offline: dto.is_offline ?? false,
          device_id: dto.device_id ?? null,
          created_by: userId,
          updated_by: userId,
        },
      });

      // Create transaction items (snapshot price)
      await tx.transaction_items.createMany({
        data: itemsData.map((item) => ({
          transaction_id: transaction.id,
          product_id: item.product_id,
          product_name_snapshot: item.product_name_snapshot,
          price_snapshot: item.price_snapshot,
          qty: item.qty,
          subtotal: item.subtotal,
          created_by: userId,
          updated_by: userId,
        })),
      });

      // Decrement product stock and write stock_logs
      for (const item of itemsData) {
        await tx.products.update({
          where: { id: item.product_id },
          data: {
            stock_qty: { decrement: item.qty },
            updated_by: userId,
            updated_at: new Date(),
          },
        });

        await tx.stock_logs.create({
          data: {
            product_id: item.product_id,
            change_qty: -item.qty,
            reason: 'sale',
            ref_id: transaction.id,
            created_by: userId,
            updated_by: userId,
          },
        });
      }

      return transaction;
    });

    // Return full transaction with items
    return this.prisma.transactions.findFirst({
      where: { id: result.id },
      include: { transaction_items: true },
    });
  }

  async cancel(id: string, merchantId: string, userId: string) {
    // 1. Verify transaction exists and belongs to merchant
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const transaction = await this.prisma.transactions.findFirst({
      where: {
        id,
        outlet_id: { in: outletIds },
      },
      include: {
        transaction_items: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (transaction.is_cancelled) {
      throw new BadRequestException('Transaction is already cancelled');
    }

    // 2. Atomic DB transaction for cancellation
    const result = await this.prisma.$transaction(async (tx) => {
      // Mark transaction as cancelled
      const cancelledTx = await tx.transactions.update({
        where: { id },
        data: {
          is_cancelled: true,
          updated_by: userId,
          updated_at: new Date(),
        },
      });

      // Restore stock for each item and create cancellation logs
      for (const item of transaction.transaction_items) {
        if (item.product_id) {
          // Increment product stock
          await tx.products.update({
            where: { id: item.product_id },
            data: {
              stock_qty: { increment: item.qty },
              updated_by: userId,
              updated_at: new Date(),
            },
          });

          // Create stock log for cancellation
          await tx.stock_logs.create({
            data: {
              product_id: item.product_id,
              change_qty: item.qty,
              reason: 'cancellation',
              ref_id: id,
              created_by: userId,
              updated_by: userId,
            },
          });
        }
      }

      return cancelledTx;
    });

    // Return cancelled transaction with items
    return this.prisma.transactions.findFirst({
      where: { id: result.id },
      include: { transaction_items: true },
    });
  }
}
