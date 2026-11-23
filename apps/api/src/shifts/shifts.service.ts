import { REFUND_REASON_PREFIX } from './shift-cash.constants';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { AddCashEntryDto } from './dto/add-cash-entry.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

export type ShiftStatus = 'open' | 'closed' | 'transferred';

// Lets the holder see expected cash while a shift is still open. Everyone else
// only sees it after the shift is closed (blind close).
const PERMISSION_VIEW_EXPECTED = 'shift.view_expected';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    merchantId: string,
    outletId?: string,
    pagination: PaginationDto = new PaginationDto(),
    search?: string,
  ) {
    // Validate outlet belongs to this merchant when outletId is provided
    if (outletId) {
      const outlet = await this.prisma.outlets.findFirst({
        where: { id: outletId, merchant_id: merchantId },
      });
      if (!outlet) {
        throw new NotFoundException(`Outlet with ID ${outletId} not found`);
      }
    }

    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const { page = 1, limit = 10 } = pagination;
    const skip = pagination.skip;
    const where: Prisma.shiftsWhereInput = {
      outlet_id: outletId ? outletId : { in: outletIds },
    };

    if (search) {
      where.shift_owner = {
        name: {
          contains: search,
        },
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.shifts.findMany({
        where,
        include: {
          outlets: { select: { id: true, name: true, slug: true } },
          shift_owner: { select: { id: true, name: true, username: true } },
        },
        orderBy: { start_time: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.shifts.count({ where }),
    ]);

    return { data, meta: PaginationDto.calculateMeta(total, page, limit) };
  }

  async findOne(id: string, merchantId: string) {
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const shift = await this.prisma.shifts.findFirst({
      where: {
        id,
        outlet_id: { in: outletIds },
      },
      include: {
        outlets: { select: { id: true, name: true, slug: true } },
        shift_owner: { select: { id: true, name: true, username: true } },
        transactions: {
          select: {
            id: true,
            total_amount: true,
            payment_method: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return shift;
  }

  async findByUser(userId: string, merchantId: string) {
    // Get all outlets for this merchant
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    // Find the last shift for this user in any of the merchant's outlets
    const shift = await this.prisma.shifts.findFirst({
      where: {
        shift_owner_id: userId,
        outlet_id: { in: outletIds },
      },
      orderBy: { start_time: 'desc' },
      include: {
        outlets: { select: { id: true, name: true, slug: true } },
        shift_owner: { select: { id: true, name: true, username: true } },
        transactions: {
          select: {
            id: true,
            total_amount: true,
            payment_method: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift for user ${userId} not found`);
    }

    return shift;
  }

  /** Whether the outlet requires cashiers to open a shift (merchant-scoped). */
  async isShiftRequired(outletId: string, merchantId: string) {
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId, merchant_id: merchantId },
      select: { shift_required: true },
    });
    if (!outlet) {
      throw new NotFoundException(
        `Outlet with ID ${outletId} not found or does not belong to your merchant`,
      );
    }
    return outlet.shift_required;
  }

  /** Cash-control settings of the outlet (merchant-scoped). */
  async getOutletSetting(outletId: string, merchantId: string) {
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId, merchant_id: merchantId },
      select: {
        shift_required: true,
        cash_out_daily_limit: true,
        auto_close_time: true,
      },
    });
    if (!outlet) {
      throw new NotFoundException(
        `Outlet with ID ${outletId} not found or does not belong to your merchant`,
      );
    }
    return {
      outlet_id: outletId,
      shift_required: outlet.shift_required,
      cash_out_daily_limit:
        outlet.cash_out_daily_limit === null
          ? null
          : Number(outlet.cash_out_daily_limit),
      auto_close_time: outlet.auto_close_time,
    };
  }

  async findByOutlet(outletId: string) {
    // Find the last shift for this user in any of the merchant's outlets
    const shift = await this.prisma.shifts.findFirst({
      where: {
        outlet_id: outletId,
      },
      orderBy: { start_time: 'desc' },
      include: {
        outlets: { select: { id: true, name: true, slug: true } },
        shift_owner: { select: { id: true, name: true, username: true } },
        transactions: {
          select: {
            id: true,
            total_amount: true,
            payment_method: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift for outlet ${outletId} not found`);
    }

    return shift;
  }

  async open(dto: CreateShiftDto, merchantId: string, userId: string) {
    // Validate outlet belongs to this merchant
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: dto.outlet_id, merchant_id: merchantId },
    });
    if (!outlet) {
      throw new UnauthorizedException(
        `Outlet with ID ${dto.outlet_id} does not belong to your merchant`,
      );
    }

    // Prevent opening a second shift in the same outlet if one is already open
    const existingOpen = await this.prisma.shifts.findFirst({
      where: {
        outlet_id: dto.outlet_id,
        shift_owner_id: userId,
        status: 'open',
      },
    });
    if (existingOpen) {
      throw new BadRequestException(
        `You already have an open shift (ID: ${existingOpen.id}) in this outlet. Please close it first.`,
      );
    }

    return this.prisma.shifts.create({
      data: {
        outlet_id: dto.outlet_id,
        shift_owner_id: userId,
        start_time: new Date(),
        status: 'open' satisfies ShiftStatus,
        created_by: userId,
        updated_by: userId,
      },
      include: {
        outlets: { select: { id: true, name: true, slug: true } },
        shift_owner: { select: { id: true, name: true, username: true } },
      },
    });
  }

  async close(id: string, merchantId: string, userId: string) {
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const shift = await this.prisma.shifts.findFirst({
      where: {
        id,
        outlet_id: { in: outletIds },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    if (shift.status === 'closed') {
      throw new BadRequestException(`Shift with ID ${id} is already closed`);
    }

    return this.prisma.shifts.update({
      where: { id },
      data: {
        end_time: new Date(),
        status: 'closed' satisfies ShiftStatus,
        updated_by: userId,
        updated_at: new Date(),
      },
      include: {
        outlets: { select: { id: true, name: true, slug: true } },
        shift_owner: { select: { id: true, name: true, username: true } },
      },
    });
  }

  /**
   * Open a new multi-cashier shift
   * Creates shift with owner and initial participant, creates audit log
   */
  async openShift(
    outletId: string,
    userId: string,
    merchantId: string,
    openingCash: number,
  ) {
    // Validate outlet belongs to this merchant
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId, merchant_id: merchantId },
    });
    if (!outlet) {
      throw new NotFoundException(
        `Outlet with ID ${outletId} not found or does not belong to your merchant`,
      );
    }

    if (outlet.shift_required === false) {
      throw new BadRequestException(
        'Pengaturan buka/tutup kasir outlet ini sedang mati, shift tidak bisa dibuka',
      );
    }

    // Check if user already has an open shift at this outlet
    const existingOpen = await this.prisma.shifts.findFirst({
      where: {
        outlet_id: outletId,
        shift_owner_id: userId,
        status: 'open',
      },
    });
    if (existingOpen) {
      throw new ConflictException(
        'User already has an open shift at this outlet',
      );
    }

    // Create shift with owner and initial participant in atomic transaction
    const shift = await this.prisma.$transaction(async (tx) => {
      // Create shift
      const newShift = await tx.shifts.create({
        data: {
          outlet_id: outletId,
          shift_owner_id: userId,
          status: 'open' satisfies ShiftStatus,
          start_time: new Date(),
          opening_cash: openingCash,
          created_by: userId,
          updated_by: userId,
        },
      });

      // Add owner as initial participant
      await tx.shift_participants.create({
        data: {
          shift_id: newShift.id,
          user_id: userId,
          is_owner: true,
        },
      });

      // Create audit log
      await tx.shift_audit_logs.create({
        data: {
          shift_id: newShift.id,
          action: 'shift_opened',
          user_id: userId,
          action_details: {
            outlet_id: outletId,
          },
        },
      });

      return newShift;
    });

    return this.getShift(shift.id, merchantId);
  }

  /**
   * Get shift details with participants and transaction counts
   */
  /**
   * expected = opening + cash sales received in this shift (not cancelled)
   * + cash in - cash out. Single source of truth for close and the live view.
   */
  private async calcExpectedCash(
    db: Prisma.TransactionClient,
    shiftId: string,
    openingCash: Prisma.Decimal | number | string | null,
  ): Promise<number> {
    const sales = await db.transactions.aggregate({
      where: {
        paid_shift_id: shiftId,
        payment_method: 'cash',
        is_cancelled: false,
      },
      _sum: { total_amount: true },
    });
    const entries = await db.shift_cash_entries.findMany({
      where: { shift_id: shiftId },
      select: { type: true, amount: true },
    });
    const cashIn = entries
      .filter((e) => e.type === 'in')
      .reduce((a, e) => a + Number(e.amount), 0);
    const cashOut = entries
      .filter((e) => e.type === 'out')
      .reduce((a, e) => a + Number(e.amount), 0);
    return (
      Math.round(
        (Number(openingCash ?? 0) +
          Number(sales._sum.total_amount ?? 0) +
          cashIn -
          cashOut) *
          100,
      ) / 100
    );
  }

  private async canViewExpectedCash(userId: string, outletId: string) {
    const granted = await this.prisma.role_permissions.count({
      where: {
        permissions: { code: PERMISSION_VIEW_EXPECTED },
        roles: {
          user_roles: { some: { user_id: userId, outlet_id: outletId } },
        },
      },
    });
    return granted > 0;
  }

  async getShift(shiftId: string, merchantId: string, viewerId?: string) {
    // Validate shift belongs to merchant
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const shift = await this.prisma.shifts.findFirst({
      where: {
        id: shiftId,
        outlet_id: { in: outletIds },
      },
      include: {
        outlets: { select: { id: true, name: true, slug: true } },
        shift_owner: { select: { id: true, name: true, username: true } },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }

    // Get participants with transaction counts
    const participants = await this.prisma.shift_participants.findMany({
      where: { shift_id: shiftId },
      include: {
        users: { select: { id: true, name: true, username: true } },
      },
      orderBy: { participant_added_at: 'asc' },
    });

    // Calculate transaction count for each participant
    const participantsWithCounts = await Promise.all(
      participants.map(async (p) => {
        const transactionCount = await this.prisma.transactions.count({
          where: {
            shift_id: shiftId,
            cashier_id: p.user_id,
            is_cancelled: false,
          },
        });

        return {
          user_id: p.user_id,
          user_name: p.users.name,
          participant_added_at: p.participant_added_at,
          participant_removed_at: p.participant_removed_at,
          is_owner: p.is_owner,
          transaction_count: transactionCount,
        };
      }),
    );

    // Get total transactions for shift
    const totalTransactions = await this.prisma.transactions.count({
      where: {
        shift_id: shiftId,
        is_cancelled: false,
      },
    });

    const entries = await this.prisma.shift_cash_entries.findMany({
      where: { shift_id: shiftId },
      include: { users: { select: { name: true } } },
      orderBy: { created_at: 'asc' },
    });
    const sumType = (t: string) =>
      Math.round(
        entries
          .filter((e) => e.type === t)
          .reduce((a, e) => a + Number(e.amount), 0) * 100,
      ) / 100;

    // Only for a still-open shift and only for holders of the permission;
    // `expected_cash` itself stays null until close.
    let expectedCashLive: number | null = null;
    if (
      viewerId &&
      shift.status === 'open' &&
      (await this.canViewExpectedCash(viewerId, shift.outlet_id))
    ) {
      expectedCashLive = await this.calcExpectedCash(
        this.prisma,
        shiftId,
        shift.opening_cash,
      );
    }

    return {
      id: shift.id,
      outlet_id: shift.outlet_id,
      outlet: shift.outlets,
      shift_owner_id: shift.shift_owner_id,
      shift_owner: shift.shift_owner,
      status: shift.status,
      start_time: shift.start_time,
      end_time: shift.end_time,
      opening_cash: shift.opening_cash ?? null,
      closing_cash: shift.closing_cash ?? null,
      expected_cash: shift.expected_cash ?? null,
      expected_cash_live: expectedCashLive,
      cash_difference: shift.cash_difference ?? null,
      closed_by_system: shift.closed_by_system,
      cash_entries: entries.map((e) => ({
        id: e.id,
        type: e.type,
        amount: e.amount,
        reason: e.reason,
        reason_code: e.reason_code,
        created_by: e.created_by,
        created_by_name: e.users?.name ?? null,
        created_at: e.created_at,
      })),
      total_cash_in: sumType('in'),
      total_cash_out: sumType('out'),
      participants: participantsWithCounts,
      participant_count: participantsWithCounts.length,
      total_transactions: totalTransactions,
      created_at: shift.created_at,
      updated_at: shift.updated_at,
    };
  }

  /**
   * Close a multi-cashier shift and mark all participants as removed
   */
  async closeShift(
    shiftId: string,
    userId: string,
    merchantId: string,
    closingCash: number | null,
    bySystem = false,
  ) {
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    await this.prisma.$transaction(async (tx) => {
      const shift = await tx.shifts.findFirst({
        where: { id: shiftId, outlet_id: { in: outletIds } },
      });

      if (!shift) {
        throw new NotFoundException(`Shift with ID ${shiftId} not found`);
      }

      if (shift.status === 'closed') {
        throw new BadRequestException('Shift is already closed');
      }

      // Close first so no new transactions land in this shift while summing
      await tx.shifts.update({
        where: { id: shiftId },
        data: {
          status: 'closed',
          end_time: new Date(),
          updated_by: userId,
          closed_by_system: bySystem,
        },
      });

      // Number math rounded to cents: exact for DECIMAL(14,2) (< 2^53 cents)
      const round2 = (n: number) => Math.round(n * 100) / 100;
      const expected = await this.calcExpectedCash(
        tx,
        shiftId,
        shift.opening_cash,
      );

      await tx.shifts.update({
        where: { id: shiftId },
        data: {
          closing_cash: closingCash,
          expected_cash: expected,
          // System close has no counted cash: leave the difference unknown, never fake 0.
          cash_difference:
            closingCash === null ? null : round2(closingCash - expected),
        },
      });

      await tx.shift_participants.updateMany({
        where: { shift_id: shiftId, participant_removed_at: null },
        data: { participant_removed_at: new Date() },
      });

      await tx.shift_audit_logs.create({
        data: {
          shift_id: shiftId,
          action: 'shift_closed',
          user_id: userId,
          action_details: { closed_by: userId, auto_closed: bySystem },
        },
      });
    });

    return this.getShift(shiftId, merchantId);
  }

  /**
   * Record cash in/out on an open shift (final entry + audit log, atomic)
   */
  async addCashEntry(
    shiftId: string,
    userId: string,
    merchantId: string,
    dto: AddCashEntryDto,
  ) {
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const shift = await this.prisma.shifts.findFirst({
      where: { id: shiftId, outlet_id: { in: outlets.map((o) => o.id) } },
    });
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }
    if (shift.status !== 'open') {
      throw new BadRequestException('Cannot record cash on a closed shift');
    }
    if (!(await this.isShiftRequired(shift.outlet_id, merchantId))) {
      throw new BadRequestException(
        'Cash entries are not available when the outlet does not use shifts',
      );
    }
    if (!(await this.isActiveParticipant(shiftId, userId))) {
      throw new ForbiddenException('You are not an active participant');
    }

    if (dto.type === 'out')
      await this.assertWithinCashOutLimit(shift.outlet_id, dto.amount);

    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.shift_cash_entries.create({
        data: {
          shift_id: shiftId,
          type: dto.type,
          amount: dto.amount,
          reason: dto.reason,
          reason_code: dto.reason_code ?? null,
          created_by: userId,
        },
        include: { users: { select: { name: true } } },
      });
      await tx.shift_audit_logs.create({
        data: {
          shift_id: shiftId,
          action: 'cash_entry_added',
          user_id: userId,
          action_details: {
            entry_id: entry.id,
            type: dto.type,
            amount: dto.amount,
          },
        },
      });
      return {
        id: entry.id,
        shift_id: entry.shift_id,
        type: entry.type,
        amount: entry.amount,
        reason: entry.reason,
        reason_code: entry.reason_code,
        created_by: entry.created_by,
        created_by_name: entry.users?.name ?? null,
        created_at: entry.created_at,
      };
    });
  }

  /** Rejects a cash-out that would push today's total over the outlet limit (refunds excluded). */
  private async assertWithinCashOutLimit(outletId: string, amount: number) {
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId },
      select: { cash_out_daily_limit: true },
    });
    if (outlet?.cash_out_daily_limit == null) return;
    const limit = Number(outlet.cash_out_daily_limit);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const today = await this.prisma.shift_cash_entries.findMany({
      where: {
        type: 'out',
        created_at: { gte: startOfDay },
        shifts: { outlet_id: outletId },
        NOT: { reason: { startsWith: REFUND_REASON_PREFIX } },
      },
      select: { amount: true },
    });
    const used = today.reduce((a, e) => a + Number(e.amount), 0);
    if (used + amount > limit + 0.001) {
      throw new BadRequestException(
        `Batas kas keluar harian terlampaui. Terpakai ${used}, batas ${limit}.`,
      );
    }
  }

  /**
   * Daily report: every shift of the outlet that started on `date` (server time).
   * Blind count: expected cash and cash sales are only reported for closed shifts,
   * and totals only sum closed shifts.
   */
  async getDailyReport(outletId: string, merchantId: string, date: string) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') ||
      Number.isNaN(Date.parse(date))
    ) {
      throw new BadRequestException('date must be YYYY-MM-DD');
    }
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId, merchant_id: merchantId },
      select: { id: true, name: true },
    });
    if (!outlet) {
      throw new NotFoundException(`Outlet with ID ${outletId} not found`);
    }
    const [y, m, d] = date.split('-').map(Number);
    const from = new Date(y, m - 1, d, 0, 0, 0, 0);
    const to = new Date(y, m - 1, d + 1, 0, 0, 0, 0);

    const shifts = await this.prisma.shifts.findMany({
      where: { outlet_id: outletId, start_time: { gte: from, lt: to } },
      include: { shift_owner: { select: { id: true, name: true } } },
      orderBy: { start_time: 'asc' },
    });

    const round2 = (n: number) => Math.round(n * 100) / 100;
    const rows = await Promise.all(
      shifts.map(async (sh) => {
        const entries = await this.prisma.shift_cash_entries.findMany({
          where: { shift_id: sh.id },
          select: { type: true, amount: true },
        });
        const sum = (t: string) =>
          round2(
            entries
              .filter((e) => e.type === t)
              .reduce((a, e) => a + Number(e.amount), 0),
          );
        const closed = sh.status === 'closed';
        const sales = closed
          ? await this.prisma.transactions.aggregate({
              where: {
                paid_shift_id: sh.id,
                payment_method: 'cash',
                is_cancelled: false,
              },
              _sum: { total_amount: true },
            })
          : null;
        const transactions = await this.prisma.transactions.count({
          where: { shift_id: sh.id, is_cancelled: false },
        });
        return {
          id: sh.id,
          status: sh.status,
          shift_owner: sh.shift_owner,
          start_time: sh.start_time,
          end_time: sh.end_time,
          closed_by_system: sh.closed_by_system,
          opening_cash:
            sh.opening_cash === null ? null : Number(sh.opening_cash),
          cash_in: sum('in'),
          cash_out: sum('out'),
          cash_sales: sales
            ? round2(Number(sales._sum.total_amount ?? 0))
            : null,
          expected_cash:
            closed && sh.expected_cash !== null
              ? Number(sh.expected_cash)
              : null,
          closing_cash:
            sh.closing_cash === null ? null : Number(sh.closing_cash),
          cash_difference:
            sh.cash_difference === null ? null : Number(sh.cash_difference),
          transactions,
        };
      }),
    );

    const closedRows = rows.filter((r) => r.status === 'closed');
    const total = (f: (r: (typeof rows)[number]) => number | null) =>
      round2(closedRows.reduce((a, r) => a + (f(r) ?? 0), 0));
    return {
      outlet,
      date,
      open_shifts: rows.length - closedRows.length,
      totals: {
        opening_cash: total((r) => r.opening_cash),
        cash_sales: total((r) => r.cash_sales),
        cash_in: total((r) => r.cash_in),
        cash_out: total((r) => r.cash_out),
        // Expected cash only over shifts that were counted, so it compares with closing_cash.
        expected_cash: total((r) => (r.closed_by_system ? 0 : r.expected_cash)),
        closing_cash: total((r) => r.closing_cash),
        cash_difference: total((r) => r.cash_difference),
        transactions: rows.reduce((a, r) => a + r.transactions, 0),
      },
      shifts: rows,
    };
  }

  /**
   * Query shifts with filtering and pagination
   */
  async queryShifts(
    merchantId: string,
    filters: {
      outlet_id?: string;
      status?: ShiftStatus;
      start_date?: Date;
      end_date?: Date;
      user_id?: string;
      search?: string;
      page?: number;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    // Validate outlet belongs to merchant if provided
    if (filters.outlet_id) {
      const outlet = await this.prisma.outlets.findFirst({
        where: { id: filters.outlet_id, merchant_id: merchantId },
      });
      if (!outlet) {
        throw new NotFoundException(
          `Outlet with ID ${filters.outlet_id} not found`,
        );
      }
    }

    // Get all outlets for merchant
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    // Build where clause
    const where: Prisma.shiftsWhereInput = {
      outlet_id: filters.outlet_id ? filters.outlet_id : { in: outletIds },
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.start_date || filters.end_date) {
      where.start_time = {};
      if (filters.start_date) {
        where.start_time = {
          ...where.start_time,
          gte: filters.start_date,
        };
      }
      if (filters.end_date) {
        where.start_time = {
          ...where.start_time,
          lte: filters.end_date,
        };
      }
    }

    if (filters.user_id) {
      where.shift_owner_id = filters.user_id;
    }

    if (filters.search) {
      where.shift_owner = {
        name: {
          contains: filters.search,
        },
      };
    }

    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    const page =
      filters.page || (limit > 0 ? Math.floor(offset / limit) + 1 : 1);

    const [shifts, total] = await this.prisma.$transaction([
      this.prisma.shifts.findMany({
        where,
        include: {
          outlets: { select: { id: true, name: true, slug: true } },
          shift_owner: { select: { id: true, name: true, username: true } },
        },
        orderBy: { start_time: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.shifts.count({ where }),
    ]);

    // Enrich with participant and transaction counts
    const enrichedShifts = await Promise.all(
      shifts.map(async (shift) => {
        const participantCount = await this.prisma.shift_participants.count({
          where: { shift_id: shift.id },
        });

        const totalTransactions = await this.prisma.transactions.count({
          where: {
            shift_id: shift.id,
            is_cancelled: false,
          },
        });

        return {
          id: shift.id,
          outlet_id: shift.outlet_id,
          outlet: shift.outlets,
          shift_owner_id: shift.shift_owner_id,
          shift_owner: shift.shift_owner,
          status: shift.status,
          start_time: shift.start_time,
          end_time: shift.end_time,
          opening_cash: shift.opening_cash ?? null,
          closing_cash: shift.closing_cash ?? null,
          expected_cash: shift.expected_cash ?? null,
          cash_difference: shift.cash_difference ?? null,
          closed_by_system: shift.closed_by_system,
          participant_count: participantCount,
          total_transactions: totalTransactions,
        };
      }),
    );

    return {
      data: enrichedShifts,
      total,
      limit,
      offset,
      meta: PaginationDto.calculateMeta(total, page, limit),
    };
  }

  /**
   * Get shift participants ordered by added_at
   */
  async getShiftParticipants(shiftId: string, merchantId: string) {
    // Validate shift belongs to merchant
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const shift = await this.prisma.shifts.findFirst({
      where: {
        id: shiftId,
        outlet_id: { in: outletIds },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }

    const participants = await this.prisma.shift_participants.findMany({
      where: { shift_id: shiftId },
      include: {
        users: { select: { id: true, name: true, username: true } },
      },
      orderBy: { participant_added_at: 'asc' },
    });

    // Calculate transaction count for each participant
    const participantsWithCounts = await Promise.all(
      participants.map(async (p) => {
        const transactionCount = await this.prisma.transactions.count({
          where: {
            shift_id: shiftId,
            cashier_id: p.user_id,
            is_cancelled: false,
          },
        });

        return {
          user_id: p.user_id,
          user_name: p.users.name,
          participant_added_at: p.participant_added_at,
          participant_removed_at: p.participant_removed_at,
          is_owner: p.is_owner,
          transaction_count: transactionCount,
        };
      }),
    );

    return {
      data: participantsWithCounts,
      total: participantsWithCounts.length,
    };
  }

  /**
   * Add a participant to an open shift
   */
  async addParticipant(shiftId: string, userId: string, merchantId: string) {
    // Validate shift belongs to merchant
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const shift = await this.prisma.shifts.findFirst({
      where: {
        id: shiftId,
        outlet_id: { in: outletIds },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }

    // Check shift is open
    if (shift.status !== 'open') {
      throw new BadRequestException(
        'Cannot add participants to a closed shift',
      );
    }

    // Verify user exists and belongs to same merchant
    const user = await this.prisma.users.findFirst({
      where: { id: userId, merchant_id: merchantId },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found or does not belong to your merchant',
      );
    }

    // Check if user is already a participant
    const existingParticipant = await this.prisma.shift_participants.findFirst({
      where: { shift_id: shiftId, user_id: userId },
    });

    if (existingParticipant) {
      throw new ConflictException(
        'User is already a participant in this shift',
      );
    }

    // Add participant and create audit log in atomic transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.shift_participants.create({
        data: {
          shift_id: shiftId,
          user_id: userId,
          is_owner: false,
          created_at: new Date(),
        },
      });

      await tx.shift_audit_logs.create({
        data: {
          shift_id: shiftId,
          action: 'participant_added',
          user_id: userId,
          action_details: {
            added_user_id: userId,
          },
        },
      });
    });

    // Return participant details
    const participant = await this.prisma.shift_participants.findFirst({
      where: {
        shift_id: shiftId,
        user_id: userId,
      },
      include: {
        users: { select: { id: true, name: true, username: true } },
      },
    });

    if (!participant) {
      throw new NotFoundException(
        'Failed to retrieve participant after creation',
      );
    }

    const transactionCount = await this.prisma.transactions.count({
      where: {
        shift_id: shiftId,
        cashier_id: userId,
        is_cancelled: false,
      },
    });

    return {
      user_id: participant.user_id,
      user_name: participant.users.name,
      participant_added_at: participant.participant_added_at,
      participant_removed_at: participant.participant_removed_at,
      is_owner: participant.is_owner,
      transaction_count: transactionCount,
    };
  }

  /**
   * Remove a participant from a shift
   */
  async removeParticipant(shiftId: string, userId: string, merchantId: string) {
    // Validate shift belongs to merchant
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const shift = await this.prisma.shifts.findFirst({
      where: {
        id: shiftId,
        outlet_id: { in: outletIds },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }

    // Check if participant exists
    const participant = await this.prisma.shift_participants.findFirst({
      where: {
        shift_id: shiftId,
        user_id: userId,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found in this shift');
    }

    // Check if this is the last active participant
    const activeParticipants = await this.prisma.shift_participants.count({
      where: {
        shift_id: shiftId,
        participant_removed_at: null,
      },
    });

    if (activeParticipants === 1) {
      throw new BadRequestException(
        'Cannot remove the last participant from an open shift',
      );
    }

    // Remove participant and create audit log in atomic transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.shift_participants.update({
        where: {
          id: participant.id,
        },
        data: {
          participant_removed_at: new Date(),
        },
      });

      await tx.shift_audit_logs.create({
        data: {
          shift_id: shiftId,
          action: 'participant_removed',
          user_id: userId,
          action_details: {
            removed_user_id: userId,
          },
        },
      });
    });

    return { success: true };
  }

  /**
   * Restore a previously removed participant to a shift
   */
  async restoreParticipant(
    shiftId: string,
    userId: string,
    merchantId: string,
  ) {
    // Validate shift belongs to merchant
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const shift = await this.prisma.shifts.findFirst({
      where: {
        id: shiftId,
        outlet_id: { in: outletIds },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }

    // Check shift is open
    if (shift.status !== 'open') {
      throw new BadRequestException(
        'Cannot restore participants to a closed shift',
      );
    }

    // Verify user exists and belongs to same merchant
    const user = await this.prisma.users.findFirst({
      where: { id: userId, merchant_id: merchantId },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found or does not belong to your merchant',
      );
    }

    // Check if participant exists and is removed
    const participant = await this.prisma.shift_participants.findFirst({
      where: {
        shift_id: shiftId,
        user_id: userId,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found in this shift');
    }

    if (participant.participant_removed_at === null) {
      throw new ConflictException(
        'Participant is already active in this shift',
      );
    }

    // Restore participant and create audit log in atomic transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.shift_participants.update({
        where: {
          id: participant.id,
        },
        data: {
          participant_removed_at: null,
        },
      });

      await tx.shift_audit_logs.create({
        data: {
          shift_id: shiftId,
          action: 'participant_restored',
          user_id: userId,
          action_details: {
            restored_user_id: userId,
          },
        },
      });
    });

    // Return participant details
    const restoredParticipant = await this.prisma.shift_participants.findFirst({
      where: {
        shift_id: shiftId,
        user_id: userId,
      },
      include: {
        users: { select: { id: true, name: true, username: true } },
      },
    });

    if (!restoredParticipant) {
      throw new NotFoundException(
        'Failed to retrieve participant after restoration',
      );
    }

    const transactionCount = await this.prisma.transactions.count({
      where: {
        shift_id: shiftId,
        cashier_id: userId,
        is_cancelled: false,
      },
    });

    return {
      user_id: restoredParticipant.user_id,
      user_name: restoredParticipant.users.name,
      participant_added_at: restoredParticipant.participant_added_at,
      participant_removed_at: restoredParticipant.participant_removed_at,
      is_owner: restoredParticipant.is_owner,
      transaction_count: transactionCount,
    };
  }

  /**
   * Handoff shift ownership to another participant
   */
  async handoffShift(
    shiftId: string,
    targetUserId: string,
    removePreviousOwner: boolean,
    merchantId: string,
  ) {
    // Validate shift belongs to merchant
    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    const outletIds = outlets.map((o) => o.id);

    const shift = await this.prisma.shifts.findFirst({
      where: {
        id: shiftId,
        outlet_id: { in: outletIds },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }

    // Check shift is open
    if (shift.status !== 'open') {
      throw new BadRequestException('Cannot handoff a closed shift');
    }

    // Check target user is a participant
    const targetParticipant = await this.prisma.shift_participants.findFirst({
      where: {
        shift_id: shiftId,
        user_id: targetUserId,
        participant_removed_at: null,
      },
    });

    if (!targetParticipant) {
      throw new BadRequestException(
        'Target user must be a participant in the shift',
      );
    }

    // Handoff shift and optionally remove previous owner in atomic transaction
    await this.prisma.$transaction(async (tx) => {
      // Update shift owner
      await tx.shifts.update({
        where: { id: shiftId },
        data: {
          shift_owner_id: targetUserId,
          updated_by: targetUserId,
          updated_at: new Date(),
        },
      });

      // Update target participant to be owner
      await tx.shift_participants.update({
        where: { id: targetParticipant.id },
        data: { is_owner: true },
      });

      // Optionally remove previous owner
      if (removePreviousOwner) {
        const previousOwner = await tx.shift_participants.findFirst({
          where: {
            shift_id: shiftId,
            user_id: shift.shift_owner_id,
            participant_removed_at: null,
          },
        });

        if (previousOwner) {
          await tx.shift_participants.update({
            where: { id: previousOwner.id },
            data: { participant_removed_at: new Date(), is_owner: false },
          });
        }
      } else {
        // Update previous owner to not be owner
        const previousOwner = await tx.shift_participants.findFirst({
          where: {
            shift_id: shiftId,
            user_id: shift.shift_owner_id,
          },
        });

        if (previousOwner) {
          await tx.shift_participants.update({
            where: { id: previousOwner.id },
            data: { is_owner: false },
          });
        }
      }

      // Create audit log
      await tx.shift_audit_logs.create({
        data: {
          shift_id: shiftId,
          action: 'shift_handoff',
          user_id: targetUserId,
          action_details: {
            from_user_id: shift.shift_owner_id,
            to_user_id: targetUserId,
            remove_previous_owner: removePreviousOwner,
          },
        },
      });
    });

    return this.getShift(shiftId, merchantId);
  }
  /**
   * Check if user is an active participant in a shift
   * Task 4.2: Add participant status checking logic
   */
  async isActiveParticipant(shiftId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.shift_participants.findFirst({
      where: {
        shift_id: shiftId,
        user_id: userId,
        participant_removed_at: null,
      },
    });

    return !!participant;
  }

  /**
   * Validate that a shift is open
   * Task 4.3: Add shift status validation
   */
  async validateShiftOpen(shiftId: string): Promise<void> {
    const shift = await this.prisma.shifts.findFirst({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }

    if (shift.status !== 'open') {
      throw new BadRequestException('Shift is not available for transactions');
    }
  }

  /**
   * Handoff shift ownership to another participant
   */
}
