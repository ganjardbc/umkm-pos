import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ShiftsService } from '../shifts/shifts.service';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

const ORDER_SOURCE_POS = 'pos';
const ORDER_SOURCE_CUSTOMER = 'customer_catalog';

const ORDER_STATUS_PENDING = 'menunggu_konfirmasi';
const ORDER_STATUS_ACCEPTED = 'diterima';
const ORDER_STATUS_PROCESSING = 'diproses';
const ORDER_STATUS_SERVED = 'sampai';
const ORDER_STATUS_COMPLETED = 'selesai';

const ORDER_STATUS_TRANSITIONS: Record<string, string | null> = {
  [ORDER_STATUS_PENDING]: ORDER_STATUS_ACCEPTED,
  [ORDER_STATUS_ACCEPTED]: ORDER_STATUS_PROCESSING,
  [ORDER_STATUS_PROCESSING]: ORDER_STATUS_SERVED,
  [ORDER_STATUS_SERVED]: ORDER_STATUS_COMPLETED,
  [ORDER_STATUS_COMPLETED]: null,
};

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
    orderStatus?: string,
    orderSource?: string,
    tableId?: string,
  ) {
    if (outletId) {
      await this.assertOutletBelongsToMerchant(outletId, merchantId);
    }

    const outletIds = await this.getMerchantOutletIds(merchantId);
    const { page = 1, limit = 10 } = pagination;
    const where = {
      outlet_id: outletId ? outletId : { in: outletIds },
      ...(is_cancelled !== undefined && { is_cancelled }),
      ...(orderStatus && { order_status: orderStatus }),
      ...(orderSource && { order_source: orderSource }),
      ...(tableId && { table_id: tableId }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transactions.findMany({
        where,
        include: {
          transaction_items: true,
          outlets: true,
          shifts: true,
          users: true,
          cashier: true,
          store_tables: true,
          customer_sessions: true,
        },
        orderBy: { created_at: 'desc' },
        skip: pagination.skip,
        take: limit,
      }),
      this.prisma.transactions.count({ where }),
    ]);

    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  async findOne(id: string, merchantId: string) {
    const outletIds = await this.getMerchantOutletIds(merchantId);
    const transaction = await this.prisma.transactions.findFirst({
      where: {
        id,
        outlet_id: { in: outletIds },
      },
      include: {
        transaction_items: true,
        outlets: true,
        users: true,
        cashier: true,
        shifts: true,
        store_tables: true,
        customer_sessions: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async create(dto: CreateTransactionDto, merchantId: string, userId: string) {
    return this.createPosTransaction(dto, merchantId, userId);
  }

  async createCatalogOrder(dto: CreateTransactionDto, merchantId: string) {
    const session = await this.prisma.customer_sessions.findFirst({
      where: {
        id: dto.customer_session_id,
        merchant_id: merchantId,
        outlet_id: dto.outlet_id,
        status: { in: ['active', 'ordered'] },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Customer session is not valid');
    }

    if (session.expires_at <= new Date()) {
      throw new UnauthorizedException('Customer session has expired');
    }

    const tableId = dto.table_id ?? session.selected_table_id ?? undefined;
    if (!tableId) {
      throw new BadRequestException('Table is required to place an order');
    }
    await this.assertTableBelongsToOutlet(tableId, dto.outlet_id, merchantId);

    const orderDto: CreateTransactionDto = {
      ...dto,
      table_id: tableId,
      order_source: ORDER_SOURCE_CUSTOMER,
      order_status: ORDER_STATUS_PENDING,
      payment_method: 'pending',
      is_offline: false,
      customer_name_snapshot: dto.customer_name_snapshot ?? session.customer_name,
      customer_phone_snapshot:
        dto.customer_phone_snapshot ?? session.customer_phone ?? undefined,
    };

    const prepared = await this.prepareTransactionPayload(
      orderDto,
      merchantId,
      undefined,
      false,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transactions.create({
        data: {
          outlet_id: orderDto.outlet_id,
          user_id: null,
          shift_id: orderDto.shift_id ?? null,
          cashier_id: null,
          payment_method: 'pending',
          total_amount: prepared.totalAmount,
          cash_received: null,
          change_amount: null,
          order_source: ORDER_SOURCE_CUSTOMER,
          order_status: ORDER_STATUS_PENDING,
          customer_session_id: session.id,
          table_id: tableId,
          customer_name_snapshot: orderDto.customer_name_snapshot,
          customer_phone_snapshot: orderDto.customer_phone_snapshot ?? null,
          ordered_at: new Date(),
          is_offline: false,
          device_id: orderDto.device_id ?? null,
        },
      });

      await tx.transaction_items.createMany({
        data: prepared.itemsData.map((item) => ({
          transaction_id: transaction.id,
          product_id: item.product_id,
          product_name_snapshot: item.product_name_snapshot,
          price_snapshot: item.price_snapshot,
          qty: item.qty,
          subtotal: item.subtotal,
          customer_note: item.customer_note ?? null,
        })),
      });

      await tx.customer_sessions.update({
        where: { id: session.id },
        data: {
          selected_table_id: tableId,
          status: 'ordered',
          updated_at: new Date(),
        },
      });

      return transaction;
    });

    return this.prisma.transactions.findFirst({
      where: { id: result.id },
      include: { transaction_items: true, store_tables: true, customer_sessions: true },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateTransactionStatusDto,
    merchantId: string,
    userId: string,
  ) {
    const transaction = await this.findOne(id, merchantId);

    if (transaction.order_source !== ORDER_SOURCE_CUSTOMER) {
      throw new BadRequestException(
        'Status updates are only available for customer catalog orders',
      );
    }

    if (transaction.is_cancelled) {
      throw new BadRequestException('Cancelled transaction cannot be updated');
    }

    const nextExpected = ORDER_STATUS_TRANSITIONS[transaction.order_status];
    if (!nextExpected || dto.order_status !== nextExpected) {
      throw new BadRequestException(
        `Invalid status transition from ${transaction.order_status} to ${dto.order_status}`,
      );
    }

    if (dto.order_status === ORDER_STATUS_COMPLETED) {
      return this.finalizeCustomerOrder(transaction.id, dto, merchantId, userId);
    }

    const data: Record<string, any> = {
      order_status: dto.order_status,
      updated_by: userId,
      updated_at: new Date(),
    };

    if (dto.order_status === ORDER_STATUS_ACCEPTED) data.accepted_at = new Date();
    if (dto.order_status === ORDER_STATUS_PROCESSING) data.processed_at = new Date();
    if (dto.order_status === ORDER_STATUS_SERVED) data.served_at = new Date();

    return this.prisma.transactions.update({
      where: { id: transaction.id },
      data,
      include: {
        transaction_items: true,
        store_tables: true,
        customer_sessions: true,
      },
    });
  }

  async cancel(id: string, merchantId: string, userId: string) {
    const outletIds = await this.getMerchantOutletIds(merchantId);
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

    const result = await this.prisma.$transaction(async (tx) => {
      const cancelledTx = await tx.transactions.update({
        where: { id },
        data: {
          is_cancelled: true,
          ...(transaction.order_source === ORDER_SOURCE_CUSTOMER && {
            order_status: ORDER_STATUS_COMPLETED,
            completed_at: new Date(),
          }),
          updated_by: userId,
          updated_at: new Date(),
        },
      });

      if (transaction.payment_method !== 'pending') {
        for (const item of transaction.transaction_items) {
          if (!item.product_id) continue;

          const restoredInventory = await tx.outlet_product_inventory.update({
            where: {
              outlet_id_product_id: {
                outlet_id: transaction.outlet_id,
                product_id: item.product_id,
              },
            },
            data: {
              stock_qty: { increment: item.qty },
              updated_by: userId,
              updated_at: new Date(),
            },
          });

          await tx.inventory_movements.create({
            data: {
              merchant_id: merchantId,
              outlet_id: transaction.outlet_id,
              product_id: item.product_id,
              change_qty: item.qty,
              stock_after: restoredInventory.stock_qty,
              reason: 'sale_cancel',
              ref_type: 'transaction_cancel',
              ref_id: id,
              created_by: userId,
              updated_by: userId,
            },
          });
        }
      }

      if (transaction.customer_session_id) {
        await tx.customer_sessions.updateMany({
          where: { id: transaction.customer_session_id },
          data: {
            status: 'closed',
            updated_at: new Date(),
          },
        });
      }

      return cancelledTx;
    });

    return this.prisma.transactions.findFirst({
      where: { id: result.id },
      include: { transaction_items: true, customer_sessions: true },
    });
  }

  private async createPosTransaction(
    dto: CreateTransactionDto,
    merchantId: string,
    userId: string,
  ) {
    const cashierId = await this.resolveCashierForPos(dto, merchantId, userId);
    const prepared = await this.prepareTransactionPayload(dto, merchantId, userId, true);
    const tableId = dto.table_id ?? null;

    if (tableId) {
      await this.assertTableBelongsToOutlet(tableId, dto.outlet_id, merchantId);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transactions.create({
        data: {
          outlet_id: dto.outlet_id,
          table_id: tableId,
          user_id: userId,
          shift_id: dto.shift_id ?? null,
          cashier_id: cashierId,
          payment_method: dto.payment_method,
          total_amount: prepared.totalAmount,
          cash_received: prepared.cashReceived,
          change_amount: prepared.changeAmount,
          order_source: ORDER_SOURCE_POS,
          order_status: ORDER_STATUS_COMPLETED,
          completed_at: new Date(),
          is_offline: dto.is_offline ?? false,
          device_id: dto.device_id ?? null,
          created_by: userId,
          updated_by: userId,
        },
      });

      await tx.transaction_items.createMany({
        data: prepared.itemsData.map((item) => ({
          transaction_id: transaction.id,
          product_id: item.product_id,
          product_name_snapshot: item.product_name_snapshot,
          price_snapshot: item.price_snapshot,
          qty: item.qty,
          subtotal: item.subtotal,
          customer_note: item.customer_note ?? null,
          created_by: userId,
          updated_by: userId,
        })),
      });

      await this.applyInventorySale(
        tx,
        prepared.itemsData,
        merchantId,
        dto.outlet_id,
        transaction.id,
        userId,
      );

      return transaction;
    });

    return this.prisma.transactions.findFirst({
      where: { id: result.id },
      include: { transaction_items: true, store_tables: true },
    });
  }

  private async finalizeCustomerOrder(
    transactionId: string,
    dto: UpdateTransactionStatusDto,
    merchantId: string,
    userId: string,
  ) {
    if (!dto.payment_method) {
      throw new BadRequestException('payment_method is required when completing an order');
    }

    const transaction = await this.prisma.transactions.findFirst({
      where: { id: transactionId },
      include: {
        transaction_items: true,
        customer_sessions: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    const itemsPayload = transaction.transaction_items
      .filter((item) => item.product_id)
      .map((item) => ({
        product_id: item.product_id!,
        qty: item.qty,
        customer_note: item.customer_note ?? undefined,
      }));

    const prepared = await this.prepareTransactionPayload(
      {
        outlet_id: transaction.outlet_id,
        payment_method: dto.payment_method,
        cash_received: dto.cash_received,
        change_amount: dto.change_amount,
        items: itemsPayload,
      },
      merchantId,
      userId,
      true,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      await this.applyInventorySale(
        tx,
        prepared.itemsData,
        merchantId,
        transaction.outlet_id,
        transaction.id,
        userId,
      );

      const updated = await tx.transactions.update({
        where: { id: transaction.id },
        data: {
          payment_method: dto.payment_method,
          cash_received: prepared.cashReceived,
          change_amount: prepared.changeAmount,
          order_status: ORDER_STATUS_COMPLETED,
          completed_at: new Date(),
          cashier_id: userId,
          updated_by: userId,
          updated_at: new Date(),
        },
      });

      if (transaction.customer_session_id) {
        await tx.customer_sessions.update({
          where: { id: transaction.customer_session_id },
          data: {
            status: 'closed',
            updated_at: new Date(),
          },
        });
      }

      return updated;
    });

    return this.prisma.transactions.findFirst({
      where: { id: result.id },
      include: { transaction_items: true, customer_sessions: true, store_tables: true },
    });
  }

  private async prepareTransactionPayload(
    dto: Partial<CreateTransactionDto> & { outlet_id: string; items: any[]; payment_method?: string },
    merchantId: string,
    userId?: string,
    validatePayment = true,
  ) {
    await this.assertOutletBelongsToMerchant(dto.outlet_id, merchantId);

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Transaction must have at least one item');
    }

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

    const inventoryRows = await this.prisma.outlet_product_inventory.findMany({
      where: {
        merchant_id: merchantId,
        outlet_id: dto.outlet_id,
        product_id: { in: productIds },
        is_active: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const inventoryMap = new Map(inventoryRows.map((row) => [row.product_id, row]));

    let totalAmount = 0;
    const itemsData: Array<{
      product_id: string;
      product_name_snapshot: string;
      price_snapshot: number;
      qty: number;
      subtotal: number;
      stock_after: number;
      customer_note?: string;
    }> = [];

    for (const item of dto.items) {
      const product = productMap.get(item.product_id);
      const outletInventory = inventoryMap.get(item.product_id);
      if (!product || !outletInventory) {
        throw new NotFoundException(`Inventory for product ${item.product_id} was not found`);
      }
      if (outletInventory.stock_qty < item.qty) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.name}" in this outlet. Available: ${outletInventory.stock_qty}, Requested: ${item.qty}`,
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
        stock_after: outletInventory.stock_qty - item.qty,
        customer_note: item.customer_note,
      });
    }

    let cashReceived: number | null = null;
    let changeAmount: number | null = null;
    if (validatePayment) {
      ({ cashReceived, changeAmount } = this.validatePayment(
        dto.payment_method ?? 'cash',
        dto.cash_received,
        dto.change_amount,
        totalAmount,
      ));
    }

    return { totalAmount, itemsData, cashReceived, changeAmount, userId };
  }

  private validatePayment(
    paymentMethod: string,
    cashReceivedInput: number | undefined,
    changeAmountInput: number | undefined,
    totalAmount: number,
  ) {
    const cashReceived = paymentMethod === 'cash' ? Number(cashReceivedInput ?? 0) : null;
    const changeAmount = paymentMethod === 'cash' ? Number(changeAmountInput ?? 0) : null;

    if (paymentMethod === 'cash') {
      if (cashReceived === null || Number.isNaN(cashReceived)) {
        throw new BadRequestException('cash_received is required for cash payment');
      }
      if (cashReceived < totalAmount) {
        throw new BadRequestException('cash_received must be greater than or equal to total_amount');
      }

      const expectedChange = Number((cashReceived - totalAmount).toFixed(2));
      if (changeAmount === null || Number.isNaN(changeAmount)) {
        throw new BadRequestException('change_amount is required for cash payment');
      }
      if (Number(changeAmount.toFixed(2)) !== expectedChange) {
        throw new BadRequestException('change_amount does not match cash_received - total_amount');
      }
    }

    return { cashReceived, changeAmount };
  }

  private async resolveCashierForPos(
    dto: CreateTransactionDto,
    merchantId: string,
    userId: string,
  ) {
    if (!dto.shift_id) return userId;

    try {
      await this.shiftsService.validateShiftOpen(dto.shift_id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Shift is not available for transactions');
      }
      throw error;
    }

    const isActiveParticipant = await this.shiftsService.isActiveParticipant(
      dto.shift_id,
      userId,
    );

    if (!isActiveParticipant) {
      throw new ForbiddenException('User is not a participant in this shift');
    }

    await this.assertOutletBelongsToMerchant(dto.outlet_id, merchantId);
    return userId;
  }

  private async applyInventorySale(
    tx: any,
    itemsData: Array<{
      product_id: string;
      qty: number;
      stock_after: number;
    }>,
    merchantId: string,
    outletId: string,
    transactionId: string,
    userId: string,
  ) {
    for (const item of itemsData) {
      await tx.outlet_product_inventory.update({
        where: {
          outlet_id_product_id: {
            outlet_id: outletId,
            product_id: item.product_id,
          },
        },
        data: {
          stock_qty: { decrement: item.qty },
          updated_by: userId,
          updated_at: new Date(),
        },
      });

      await tx.inventory_movements.create({
        data: {
          merchant_id: merchantId,
          outlet_id: outletId,
          product_id: item.product_id,
          change_qty: -item.qty,
          stock_after: item.stock_after,
          reason: 'sale',
          ref_type: 'transaction',
          ref_id: transactionId,
          created_by: userId,
          updated_by: userId,
        },
      });
    }
  }

  private async getMerchantOutletIds(merchantId: string) {
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });

    return outlets.map((o) => o.id);
  }

  private async assertOutletBelongsToMerchant(outletId: string, merchantId: string) {
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId, merchant_id: merchantId },
    });
    if (!outlet) {
      throw new UnauthorizedException(
        `Outlet with ID ${outletId} does not belong to your merchant`,
      );
    }

    return outlet;
  }

  private async assertTableBelongsToOutlet(
    tableId: string,
    outletId: string,
    merchantId: string,
  ) {
    const table = await this.prisma.store_tables.findFirst({
      where: {
        id: tableId,
        outlet_id: outletId,
        merchant_id: merchantId,
        is_active: true,
      },
    });

    if (!table) {
      throw new NotFoundException('Selected table is not available');
    }

    return table;
  }
}
