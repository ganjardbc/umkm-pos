import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ShiftsService } from '../shifts/shifts.service';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

// A type alias (not an interface) so it is assignable to Prisma's Json input.
type ItemOptionSnapshot = {
  option_id: string;
  group_name: string;
  name: string;
  price_delta: number;
};

const PERMISSION_DISCOUNT = 'transaction.discount';
const PERMISSION_CANCEL_APPROVE = 'transaction.cancel_approve';

const PIN_MAX_FAILURES = 5;
const PIN_LOCK_MS = 5 * 60 * 1000;

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
  // shortcut: failed-PIN counters live in process memory, so they reset on restart and are
  // not shared across instances; move to Redis/DB if the API runs on several nodes.
  private readonly pinFailures = new Map<
    string,
    { count: number; lockedUntil: number }
  >();

  constructor(
    private prisma: PrismaService,
    private shiftsService: ShiftsService,
  ) {}

  async findAll(
    merchantId: string,
    userId: string,
    outletId?: string,
    is_cancelled?: boolean,
    pagination: PaginationDto = new PaginationDto(),
    orderStatus?: string,
    orderSource?: string,
    tableId?: string,
    search?: string,
  ) {
    const allowedOutletIds = await this.getAllowedOutletIds(userId, merchantId);

    if (outletId) {
      await this.assertOutletBelongsToMerchant(outletId, merchantId);
      if (!allowedOutletIds.includes(outletId)) {
        throw new ForbiddenException('You do not have access to this outlet');
      }
    }

    const { page = 1, limit = 10 } = pagination;
    const where = {
      outlet_id: outletId ? outletId : { in: allowedOutletIds },
      ...(is_cancelled !== undefined && { is_cancelled }),
      ...(orderStatus && { order_status: orderStatus }),
      ...(orderSource && { order_source: orderSource }),
      ...(tableId && { table_id: tableId }),
      ...(search && {
        OR: [
          { id: { contains: search } },
          { customer_name_snapshot: { contains: search } },
        ],
      }),
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

  async findOne(id: string, merchantId: string, userId: string) {
    const allowedOutletIds = await this.getAllowedOutletIds(userId, merchantId);
    const transaction = await this.prisma.transactions.findFirst({
      where: {
        id,
        outlet_id: { in: allowedOutletIds },
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
      customer_name_snapshot:
        dto.customer_name_snapshot ?? session.customer_name,
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
          options_snapshot: item.options_snapshot ?? undefined,
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
      include: {
        transaction_items: true,
        store_tables: true,
        customer_sessions: true,
      },
    });
  }

  async addItemsToCatalogOrder(
    transactionId: string,
    items: CreateTransactionDto['items'],
    merchantId: string,
  ) {
    const transaction = await this.prisma.transactions.findFirst({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    if (transaction.is_cancelled) {
      throw new BadRequestException(
        'Cannot add items to a cancelled transaction',
      );
    }

    if (transaction.order_status === ORDER_STATUS_COMPLETED) {
      throw new BadRequestException(
        'Cannot add items to a completed transaction',
      );
    }

    if (transaction.payment_method !== 'pending') {
      throw new BadRequestException(
        'Cannot add items to a transaction that has already been paid',
      );
    }

    const prepared = await this.prepareTransactionPayload(
      { outlet_id: transaction.outlet_id, items },
      merchantId,
      undefined,
      false,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.transaction_items.createMany({
        data: prepared.itemsData.map((item) => ({
          transaction_id: transaction.id,
          product_id: item.product_id,
          product_name_snapshot: item.product_name_snapshot,
          price_snapshot: item.price_snapshot,
          options_snapshot: item.options_snapshot ?? undefined,
          qty: item.qty,
          subtotal: item.subtotal,
          customer_note: item.customer_note
            ? `Tambahan - ${item.customer_note}`
            : 'Tambahan',
        })),
      });

      return tx.transactions.update({
        where: { id: transaction.id },
        data: {
          total_amount: { increment: prepared.totalAmount },
          updated_at: new Date(),
        },
      });
    });

    return this.prisma.transactions.findFirst({
      where: { id: result.id },
      include: {
        transaction_items: true,
        store_tables: true,
        customer_sessions: true,
      },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateTransactionStatusDto,
    merchantId: string,
    userId: string,
  ) {
    const transaction = await this.findOne(id, merchantId, userId);

    if (transaction.is_cancelled) {
      throw new BadRequestException('Cancelled transaction cannot be updated');
    }

    const nextExpected = ORDER_STATUS_TRANSITIONS[transaction.order_status];
    if (!nextExpected || dto.order_status !== nextExpected) {
      throw new BadRequestException(
        `Invalid status transition from ${transaction.order_status} to ${dto.order_status}`,
      );
    }

    const data: Record<string, any> = {
      order_status: dto.order_status,
      updated_by: userId,
      updated_at: new Date(),
    };

    if (dto.order_status === ORDER_STATUS_ACCEPTED)
      data.accepted_at = new Date();
    if (dto.order_status === ORDER_STATUS_PROCESSING)
      data.processed_at = new Date();
    if (dto.order_status === ORDER_STATUS_SERVED) data.served_at = new Date();
    if (dto.order_status === ORDER_STATUS_COMPLETED)
      data.completed_at = new Date();

    const updated = await this.prisma.transactions.update({
      where: { id: transaction.id },
      data,
      include: {
        transaction_items: true,
        store_tables: true,
        customer_sessions: true,
      },
    });

    if (
      dto.order_status === ORDER_STATUS_COMPLETED &&
      transaction.customer_session_id
    ) {
      await this.prisma.customer_sessions.update({
        where: { id: transaction.customer_session_id },
        data: { status: 'closed', updated_at: new Date() },
      });
    }

    return updated;
  }

  async cancel(
    id: string,
    merchantId: string,
    userId: string,
    dto: CancelTransactionDto,
  ) {
    const allowedOutletIds = await this.getAllowedOutletIds(userId, merchantId);
    const transaction = await this.prisma.transactions.findFirst({
      where: {
        id,
        outlet_id: { in: allowedOutletIds },
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

    const approvedBy = await this.resolveCancelApprover(
      userId,
      transaction.outlet_id,
      merchantId,
      dto.approver_pin,
    );
    const refundShiftId = await this.resolveRefundShift(transaction);

    const result = await this.prisma.$transaction(async (tx) => {
      const cancelledTx = await tx.transactions.update({
        where: { id },
        data: {
          is_cancelled: true,
          cancel_reason: dto.reason.trim(),
          cancelled_by: userId,
          cancel_approved_by: approvedBy,
          cancelled_at: new Date(),
          ...(transaction.order_source === ORDER_SOURCE_CUSTOMER && {
            order_status: ORDER_STATUS_COMPLETED,
            completed_at: new Date(),
          }),
          updated_by: userId,
          updated_at: new Date(),
        },
      });

      if (refundShiftId) {
        // The sale already counted in a closed shift, so today's drawer pays it back.
        const amount = Number(transaction.total_amount);
        const entry = await tx.shift_cash_entries.create({
          data: {
            shift_id: refundShiftId,
            type: 'out',
            amount,
            reason:
              `Refund #${transaction.id.slice(0, 8).toUpperCase()}: ${dto.reason.trim()}`.slice(
                0,
                255,
              ),
            created_by: userId,
          },
        });
        await tx.shift_audit_logs.create({
          data: {
            shift_id: refundShiftId,
            action: 'cash_entry_added',
            user_id: userId,
            action_details: {
              entry_id: entry.id,
              type: 'out',
              amount,
              refund_of_transaction: transaction.id,
            },
          },
        });
      }

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
    const payNow = dto.pay_now !== false;
    // Shift off: ignore any client shift_id and store null (no shift attached)
    const shiftId = await this.resolveShiftIdForOutlet(
      dto.outlet_id,
      dto.shift_id,
      merchantId,
    );
    dto = { ...dto, shift_id: shiftId ?? undefined };
    const cashierId = await this.resolveCashierForPos(dto, merchantId, userId);
    const hasDiscount = dto.discount_type != null || dto.discount_value != null;
    if (hasDiscount) {
      if (!payNow) {
        throw new BadRequestException(
          'Discount can only be applied when paying immediately',
        );
      }
      await this.assertCanDiscount(userId, dto.outlet_id);
    }
    const prepared = await this.prepareTransactionPayload(
      dto,
      merchantId,
      userId,
      payNow,
      true,
    );
    const tableId = dto.table_id ?? null;

    const customer = dto.customer_id
      ? await this.prisma.customers.findFirst({
          where: { id: dto.customer_id, merchant_id: merchantId },
        })
      : null;
    if (dto.customer_id && !customer) {
      throw new NotFoundException(
        `Customer with ID ${dto.customer_id} not found`,
      );
    }

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
          paid_shift_id: payNow ? (dto.shift_id ?? null) : null,
          cashier_id: cashierId,
          payment_method: payNow ? dto.payment_method : 'pending',
          total_amount: prepared.totalAmount,
          customer_id: customer?.id ?? null,
          customer_name_snapshot: customer?.name ?? null,
          customer_phone_snapshot: customer?.phone ?? null,
          discount_type: prepared.discountType,
          discount_value: prepared.discountValue,
          discount_amount: prepared.discountAmount,
          cash_received: payNow ? prepared.cashReceived : null,
          change_amount: payNow ? prepared.changeAmount : null,
          order_source: ORDER_SOURCE_POS,
          order_status: ORDER_STATUS_ACCEPTED,
          accepted_at: new Date(),
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
          options_snapshot: item.options_snapshot ?? undefined,
          qty: item.qty,
          subtotal: item.subtotal,
          customer_note: item.customer_note ?? null,
          created_by: userId,
          updated_by: userId,
        })),
      });

      if (payNow) {
        await this.applyInventorySale(
          tx,
          prepared.itemsData,
          merchantId,
          dto.outlet_id,
          transaction.id,
          userId,
        );
      }

      return transaction;
    });

    return this.prisma.transactions.findFirst({
      where: { id: result.id },
      include: { transaction_items: true, store_tables: true },
    });
  }

  async payTransaction(
    transactionId: string,
    dto: {
      payment_method: string;
      cash_received?: number;
      change_amount?: number;
      is_offline?: boolean;
      shift_id?: string;
    },
    merchantId: string,
    userId: string,
  ) {
    const transaction = await this.findOne(transactionId, merchantId, userId);

    if (transaction.is_cancelled) {
      throw new BadRequestException('Cannot pay a cancelled transaction');
    }

    if (transaction.payment_method !== 'pending') {
      throw new BadRequestException('Transaction has already been paid');
    }

    const shiftRequired = await this.shiftsService.isShiftRequired(
      transaction.outlet_id,
      merchantId,
    );
    if (!shiftRequired) {
      dto = { ...dto, shift_id: undefined };
    } else if (dto.payment_method === 'cash' && !dto.shift_id) {
      throw new BadRequestException('shift_id is required for cash payment');
    }
    if (dto.shift_id) {
      // same shift rules as POS creation: open shift, active participant, outlet of merchant
      await this.resolveCashierForPos(
        { shift_id: dto.shift_id, outlet_id: transaction.outlet_id } as any,
        merchantId,
        userId,
      );
    }

    const itemsPayload = transaction.transaction_items
      .filter((item) => item.product_id)
      .map((item) => ({
        product_id: item.product_id!,
        qty: item.qty,
        customer_note: item.customer_note ?? undefined,
        options_snapshot: item.options_snapshot ?? undefined,
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
      false,
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

      return tx.transactions.update({
        where: { id: transaction.id },
        data: {
          payment_method: dto.payment_method,
          cash_received: prepared.cashReceived,
          change_amount: prepared.changeAmount,
          is_offline: dto.is_offline ?? false,
          paid_shift_id: dto.shift_id ?? null,
          cashier_id: userId,
          updated_by: userId,
          updated_at: new Date(),
        },
      });
    });

    return this.prisma.transactions.findFirst({
      where: { id: result.id },
      include: {
        transaction_items: true,
        store_tables: true,
      },
    });
  }

  private async prepareTransactionPayload(
    dto: Partial<CreateTransactionDto> & {
      outlet_id: string;
      items: any[];
      payment_method?: string;
    },
    merchantId: string,
    userId?: string,
    validatePayment = true,
    allowDiscount = false,
    trustSnapshots = false,
  ) {
    await this.assertOutletBelongsToMerchant(dto.outlet_id, merchantId);

    if (userId) {
      const allowedOutletIds = await this.getAllowedOutletIds(
        userId,
        merchantId,
      );
      if (!allowedOutletIds.includes(dto.outlet_id)) {
        throw new ForbiddenException('You do not have access to this outlet');
      }
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Transaction must have at least one item');
    }

    const productIds = dto.items.map((i) => i.product_id);
    const uniqueProductIds = [...new Set(productIds)];
    const products = await this.prisma.products.findMany({
      where: {
        id: { in: uniqueProductIds },
        merchant_id: merchantId,
        is_active: true,
      },
    });

    if (products.length !== uniqueProductIds.length) {
      throw new NotFoundException('One or more products not found or inactive');
    }

    const inventoryRows = await this.prisma.outlet_product_inventory.findMany({
      where: {
        merchant_id: merchantId,
        outlet_id: dto.outlet_id,
        product_id: { in: uniqueProductIds },
        is_active: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const optionGroups = await this.prisma.product_option_groups.findMany({
      where: { product_id: { in: uniqueProductIds } },
      include: { product_options: { orderBy: { sort_order: 'asc' } } },
      orderBy: { sort_order: 'asc' },
    });
    const groupsByProduct = new Map<string, typeof optionGroups>();
    for (const group of optionGroups) {
      const list = groupsByProduct.get(group.product_id) ?? [];
      list.push(group);
      groupsByProduct.set(group.product_id, list);
    }
    const inventoryMap = new Map(
      inventoryRows.map((row) => [row.product_id, row]),
    );

    let totalAmount = 0;
    const itemsData: Array<{
      product_id: string;
      product_name_snapshot: string;
      price_snapshot: number;
      qty: number;
      subtotal: number;
      stock_after: number;
      customer_note?: string;
      options_snapshot?: ItemOptionSnapshot[];
    }> = [];

    // Track remaining stock across items so duplicate product_id entries
    // (e.g. an original order line plus a later "Tambahan" line for the
    // same product) are validated and logged cumulatively, not against a
    // stale snapshot.
    const remainingStockMap = new Map(
      inventoryRows.map((row) => [row.product_id, row.stock_qty]),
    );

    for (const item of dto.items) {
      const product = productMap.get(item.product_id);
      const outletInventory = inventoryMap.get(item.product_id);
      if (!product || !outletInventory) {
        throw new NotFoundException(
          `Inventory for product ${item.product_id} was not found`,
        );
      }

      const remainingStock = remainingStockMap.get(item.product_id) ?? 0;
      if (remainingStock < item.qty) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.name}" in this outlet. Available: ${remainingStock}, Requested: ${item.qty}`,
        );
      }

      // Stored snapshots are only trusted when re-pricing an existing order
      // (pay-later); client input always goes through validation.
      const optionsSnapshot =
        trustSnapshots && Array.isArray(item.options_snapshot)
          ? (item.options_snapshot as ItemOptionSnapshot[])
          : this.resolveItemOptions(
              product.name,
              groupsByProduct.get(product.id) ?? [],
              item.option_ids,
            );
      const optionsTotal = optionsSnapshot.reduce(
        (sum, option) => sum + option.price_delta,
        0,
      );
      const price = Number((Number(product.price) + optionsTotal).toFixed(2));
      const subtotal = price * item.qty;
      totalAmount += subtotal;

      const stockAfter = remainingStock - item.qty;
      remainingStockMap.set(item.product_id, stockAfter);

      itemsData.push({
        product_id: product.id,
        product_name_snapshot: product.name,
        price_snapshot: price,
        qty: item.qty,
        subtotal,
        stock_after: stockAfter,
        customer_note: item.customer_note,
        options_snapshot: optionsSnapshot.length ? optionsSnapshot : undefined,
      });
    }

    // Discounts come only from callers that opted in (POS pay-now); catalog
    // and add-items flows never read them from client input.
    const { discountType, discountValue, discountAmount } = allowDiscount
      ? this.computeDiscount(totalAmount, dto.discount_type, dto.discount_value)
      : { discountType: null, discountValue: null, discountAmount: 0 };
    totalAmount = Number((totalAmount - discountAmount).toFixed(2));

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

    return {
      totalAmount,
      discountType,
      discountValue,
      discountAmount,
      itemsData,
      cashReceived,
      changeAmount,
      userId,
    };
  }

  private resolveItemOptions(
    productName: string,
    groups: Array<{
      name: string;
      is_required: boolean;
      allow_multiple: boolean;
      product_options: Array<{
        id: string;
        name: string;
        price_delta: unknown;
      }>;
    }>,
    optionIds: string[] = [],
  ): ItemOptionSnapshot[] {
    const unclaimed = new Set(optionIds);
    const snapshot: ItemOptionSnapshot[] = [];
    for (const group of groups) {
      const picked = group.product_options.filter((o) => unclaimed.has(o.id));
      picked.forEach((o) => unclaimed.delete(o.id));
      if (group.is_required && picked.length === 0) {
        throw new BadRequestException(
          `Option group "${group.name}" is required for "${productName}"`,
        );
      }
      if (!group.allow_multiple && picked.length > 1) {
        throw new BadRequestException(
          `Option group "${group.name}" allows only one choice`,
        );
      }
      for (const option of picked) {
        snapshot.push({
          option_id: option.id,
          group_name: group.name,
          name: option.name,
          price_delta: Number(option.price_delta),
        });
      }
    }
    if (unclaimed.size > 0) {
      throw new BadRequestException(
        `Unknown option for product "${productName}"`,
      );
    }
    return snapshot;
  }

  private computeDiscount(
    subtotal: number,
    type?: 'amount' | 'percent',
    value?: number,
  ) {
    if (type == null && value == null) {
      return { discountType: null, discountValue: null, discountAmount: 0 };
    }
    if (type == null || value == null) {
      throw new BadRequestException(
        'discount_type and discount_value must be sent together',
      );
    }
    if (type === 'percent' && value > 100) {
      throw new BadRequestException('Percent discount cannot exceed 100');
    }
    const discountAmount =
      type === 'percent'
        ? Number(((subtotal * value) / 100).toFixed(2))
        : value;
    if (discountAmount > subtotal) {
      throw new BadRequestException('Discount cannot exceed the subtotal');
    }
    return { discountType: type, discountValue: value, discountAmount };
  }

  // Cash refunds. A cash sale cancelled while its own shift is still open simply
  // drops out of that shift's expected cash. If that shift is already closed its
  // figures are frozen, so the money must leave the drawer of the shift that is
  // open now. Returns that shift's id, or null when nothing extra is needed.
  private async resolveRefundShift(transaction: {
    outlet_id: string;
    payment_method: string;
    paid_shift_id: string | null;
  }): Promise<string | null> {
    if (transaction.payment_method !== 'cash' || !transaction.paid_shift_id) {
      return null;
    }
    const paidShift = await this.prisma.shifts.findUnique({
      where: { id: transaction.paid_shift_id },
      select: { status: true },
    });
    if (!paidShift || paidShift.status === 'open') return null;

    const openShift = await this.prisma.shifts.findFirst({
      where: { outlet_id: transaction.outlet_id, status: 'open' },
      orderBy: { start_time: 'desc' },
      select: { id: true },
    });
    if (!openShift) {
      throw new BadRequestException(
        'This cash sale belongs to a closed shift. Open a shift first so the refund can be paid from its cash drawer',
      );
    }
    return openShift.id;
  }

  // Roles are per outlet, so check the role the user holds at this outlet.
  private async hasOutletPermission(
    userId: string,
    outletId: string,
    code: string,
  ) {
    const granted = await this.prisma.role_permissions.count({
      where: {
        permissions: { code },
        roles: {
          user_roles: { some: { user_id: userId, outlet_id: outletId } },
        },
      },
    });
    return granted > 0;
  }

  private async assertCanDiscount(userId: string, outletId: string) {
    if (
      !(await this.hasOutletPermission(userId, outletId, PERMISSION_DISCOUNT))
    ) {
      throw new ForbiddenException(
        `Permission denied. Required: ${PERMISSION_DISCOUNT}`,
      );
    }
  }

  // Returns the id of whoever approved the cancellation. Holders of
  // transaction.cancel_approve approve themselves; everyone else needs the PIN
  // of a manager at this outlet.
  private async resolveCancelApprover(
    userId: string,
    outletId: string,
    merchantId: string,
    pin?: string,
  ): Promise<string> {
    if (
      await this.hasOutletPermission(
        userId,
        outletId,
        PERMISSION_CANCEL_APPROVE,
      )
    ) {
      return userId;
    }
    if (!pin) {
      throw new ForbiddenException('Manager approval PIN is required');
    }

    const state = this.pinFailures.get(userId);
    if (state && state.lockedUntil > Date.now()) {
      throw new HttpException(
        'Too many wrong PIN attempts. Try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const approvers = await this.prisma.users.findMany({
      where: {
        merchant_id: merchantId,
        is_active: true,
        pin_hash: { not: null },
        user_roles: {
          some: {
            outlet_id: outletId,
            roles: {
              role_permissions: {
                some: { permissions: { code: PERMISSION_CANCEL_APPROVE } },
              },
            },
          },
        },
      },
      select: { id: true, pin_hash: true },
    });
    if (approvers.length === 0) {
      throw new BadRequestException(
        'No manager with an approval PIN is set for this outlet',
      );
    }

    for (const approver of approvers) {
      if (await bcrypt.compare(pin, approver.pin_hash!)) {
        this.pinFailures.delete(userId);
        return approver.id;
      }
    }

    // The count is zeroed when a lock starts, so an expired lock begins fresh.
    const count = (state?.count ?? 0) + 1;
    this.pinFailures.set(userId, {
      count: count >= PIN_MAX_FAILURES ? 0 : count,
      lockedUntil: count >= PIN_MAX_FAILURES ? Date.now() + PIN_LOCK_MS : 0,
    });
    throw new ForbiddenException('Invalid approval PIN');
  }

  private validatePayment(
    paymentMethod: string,
    cashReceivedInput: number | undefined,
    changeAmountInput: number | undefined,
    totalAmount: number,
  ) {
    const cashReceived =
      paymentMethod === 'cash' ? Number(cashReceivedInput ?? 0) : null;
    const changeAmount =
      paymentMethod === 'cash' ? Number(changeAmountInput ?? 0) : null;

    if (paymentMethod === 'cash') {
      if (cashReceived === null || Number.isNaN(cashReceived)) {
        throw new BadRequestException(
          'cash_received is required for cash payment',
        );
      }
      if (cashReceived < totalAmount) {
        throw new BadRequestException(
          'cash_received must be greater than or equal to total_amount',
        );
      }

      const expectedChange = Number((cashReceived - totalAmount).toFixed(2));
      if (changeAmount === null || Number.isNaN(changeAmount)) {
        throw new BadRequestException(
          'change_amount is required for cash payment',
        );
      }
      if (Number(changeAmount.toFixed(2)) !== expectedChange) {
        throw new BadRequestException(
          'change_amount does not match cash_received - total_amount',
        );
      }
    }

    return { cashReceived, changeAmount };
  }

  /** Required: shift_id mandatory (400 if missing). Off: always null. */
  private async resolveShiftIdForOutlet(
    outletId: string,
    shiftId: string | undefined,
    merchantId: string,
  ) {
    const required = await this.shiftsService.isShiftRequired(
      outletId,
      merchantId,
    );
    if (!required) return null;
    if (!shiftId) {
      throw new BadRequestException(
        'shift_id is required for POS transactions',
      );
    }
    return shiftId;
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
        throw new BadRequestException(
          'Shift is not available for transactions',
        );
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

  private async assertOutletBelongsToMerchant(
    outletId: string,
    merchantId: string,
  ) {
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

  async getAllowedOutletIds(
    userId: string,
    merchantId: string,
  ): Promise<string[]> {
    const userRoles = await this.prisma.user_roles.findMany({
      where: {
        user_id: userId,
        outlets: {
          merchant_id: merchantId,
        },
      },
      include: {
        roles: true,
      },
    });

    const isOwner = userRoles.some((ur) => ur.roles?.name === 'owner');

    if (isOwner) {
      return this.getMerchantOutletIds(merchantId);
    }

    return userRoles.map((ur) => ur.outlet_id).filter(Boolean) as string[];
  }
}
