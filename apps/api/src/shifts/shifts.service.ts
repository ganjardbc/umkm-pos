import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

export type ShiftStatus = 'open' | 'closed' | 'transferred';

@Injectable()
export class ShiftsService { 
  constructor(private prisma: PrismaService) {}

  async findAll(
    merchantId: string,
    outletId?: string,
    pagination: PaginationDto = new PaginationDto(),
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
    const where = { 
      outlet_id: outletId ? outletId : { in: outletIds },
    };

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

  async findByOutlet(outletId: string, merchantId: string) {
    // Validate outlet belongs to this merchant
    if (!outletId || typeof outletId !== 'string' || outletId.trim() === '') {
      throw new BadRequestException('Invalid outlet ID');
    }
    if (!merchantId || typeof merchantId !== 'string' || merchantId.trim() === '') {
      throw new BadRequestException('Invalid merchant ID');
    }
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId, merchant_id: merchantId },
    });
    if (!outlet) {
      throw new NotFoundException(`Shift for outlet ${outletId} not found`);
    }

    // Find the last shift for this outlet
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
  async openShift(outletId: string, userId: string, merchantId: string) {
    // Validate outlet belongs to this merchant
    const outlet = await this.prisma.outlets.findFirst({
      where: { id: outletId, merchant_id: merchantId },
    });
    if (!outlet) {
      throw new NotFoundException(
        `Outlet with ID ${outletId} not found or does not belong to your merchant`,
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
  async getShift(shiftId: string, merchantId: string) {
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

    return {
      id: shift.id,
      outlet_id: shift.outlet_id,
      outlet: shift.outlets,
      shift_owner_id: shift.shift_owner_id,
      shift_owner: shift.shift_owner,
      status: shift.status,
      start_time: shift.start_time,
      end_time: shift.end_time,
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
  async closeShift(shiftId: string, userId: string, merchantId: string) {
    try {
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

      if (shift.status === 'closed') {
        throw new BadRequestException('Shift is already closed');
      }

      // Update shift status
      await this.prisma.shifts.update({
        where: { id: shiftId },
        data: {
          status: 'closed',
          end_time: new Date(),
          updated_by: userId,
        },
      });

      // Mark all participants as removed
      await this.prisma.shift_participants.updateMany({
        where: {
          shift_id: shiftId,
          participant_removed_at: null,
        },
        data: {
          participant_removed_at: new Date(),
        },
      });

      // Create audit log
      await this.prisma.shift_audit_logs.create({
        data: {
          shift_id: shiftId,
          action: 'shift_closed',
          user_id: userId,
          action_details: {
            closed_by: userId,
          },
        },
      });

      // Return full shift details
      return this.getShift(shiftId, merchantId);
    } catch (error) {
      console.error('Error closing shift:', error);
      throw error;
    }
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

    const limit = filters.limit || 10;
    const offset = filters.offset || 0;

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
      this.prisma.shifts.count({