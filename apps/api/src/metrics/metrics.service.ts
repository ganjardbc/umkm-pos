import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get performance metrics for a participant in a shift
   * Task 5.2: Create MetricsService
   */
  async getParticipantMetrics(
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

    // Get participant
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
        `Participant with user ID ${userId} not found in this shift`,
      );
    }

    // Calculate metrics
    const transactionCount = await this.calculateTransactionCount(
      shiftId,
      userId,
    );
    const totalAmount = await this.calculateTotalAmount(shiftId, userId);
    const averageAmount = await this.calculateAverageAmount(shiftId, userId);
    const participationDuration = await this.calculateParticipationDuration(
      shiftId,
      userId,
    );

    return {
      user_id: participant.user_id,
      user_name: participant.users.name,
      transaction_count: transactionCount,
      total_amount: totalAmount,
      average_transaction_amount: averageAmount,
      participation_duration_minutes: participationDuration,
      participant_added_at: participant.participant_added_at,
      participant_removed_at: participant.participant_removed_at,
    };
  }

  /**
   * Calculate transaction count for a participant
   * Task 5.2: Create MetricsService
   */
  async calculateTransactionCount(
    shiftId: string,
    userId: string,
  ): Promise<number> {
    const count = await this.prisma.transactions.count({
      where: {
        shift_id: shiftId,
        cashier_id: userId,
        is_cancelled: false,
      },
    });

    return count;
  }

  /**
   * Calculate total transaction amount for a participant
   * Task 5.2: Create MetricsService
   */
  async calculateTotalAmount(shiftId: string, userId: string): Promise<number> {
    const result = await this.prisma.transactions.aggregate({
      where: {
        shift_id: shiftId,
        cashier_id: userId,
        is_cancelled: false,
      },
      _sum: {
        total_amount: true,
      },
    });

    return result._sum.total_amount ? Number(result._sum.total_amount) : 0;
  }

  /**
   * Calculate average transaction amount for a participant
   * Task 5.2: Create MetricsService
   */
  async calculateAverageAmount(
    shiftId: string,
    userId: string,
  ): Promise<number> {
    const result = await this.prisma.transactions.aggregate({
      where: {
        shift_id: shiftId,
        cashier_id: userId,
        is_cancelled: false,
      },
      _avg: {
        total_amount: true,
      },
    });

    return result._avg.total_amount ? Number(result._avg.total_amount) : 0;
  }

  /**
   * Calculate participation duration in minutes
   * Task 5.2: Create MetricsService
   */
  async calculateParticipationDuration(
    shiftId: string,
    userId: string,
  ): Promise<number> {
    const participant = await this.prisma.shift_participants.findFirst({
      where: {
        shift_id: shiftId,
        user_id: userId,
      },
    });

    if (!participant) {
      return 0;
    }

    const endTime = participant.participant_removed_at || new Date();
    const durationMs =
      endTime.getTime() - participant.participant_added_at.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    return durationMinutes;
  }
}
