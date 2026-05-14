import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create an immutable audit log entry
   */
  async createAuditLog(
    shiftId: string,
    action:
      | 'shift_opened'
      | 'participant_added'
      | 'participant_removed'
      | 'shift_handoff'
      | 'shift_closed',
    userId: string,
    actionDetails?: Record<string, any>,
  ) {
    return this.prisma.shift_audit_logs.create({
      data: {
        shift_id: shiftId,
        action,
        user_id: userId,
        action_details: actionDetails || {},
        created_at: new Date(),
      },
    });
  }

  /**
   * Get audit logs for a shift with pagination
   */
  async getAuditLogs(
    shiftId: string,
    merchantId: string,
    limit: number = 10,
    offset: number = 0,
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

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.shift_audit_logs.findMany({
        where: { shift_id: shiftId },
        include: {
          users: { select: { id: true, name: true, username: true } },
        },
        orderBy: { created_at: 'asc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.shift_audit_logs.count({ where: { shift_id: shiftId } }),
    ]);

    const enrichedLogs = logs.map((log) => ({
      id: log.id,
      shift_id: log.shift_id,
      action: log.action,
      user_id: log.user_id,
      user_name: log.users.name,
      action_details: log.action_details,
      created_at: log.created_at,
    }));

    return {
      data: enrichedLogs,
      total,
      limit,
      offset,
    };
  }

  /**
   * Validate audit trail consistency (for testing/verification)
   * Reconstructs shift state from audit logs
   */
  async validateAuditTrail(shiftId: string) {
    const logs = await this.prisma.shift_audit_logs.findMany({
      where: { shift_id: shiftId },
      orderBy: { created_at: 'asc' },
    });

    const participants = new Set<string>();
    let owner: string | null = null;
    let status: 'open' | 'closed' | 'transferred' = 'open';

    for (const log of logs) {
      if (log.action === 'shift_opened') {
        owner = log.user_id;
        participants.add(log.user_id);
      } else if (log.action === 'participant_added') {
        const details = log.action_details as any;
        if (details?.user_id) {
          participants.add(details.user_id);
        }
      } else if (log.action === 'participant_removed') {
        const details = log.action_details as any;
        if (details?.user_id) {
          participants.delete(details.user_id);
        }
      } else if (log.action === 'shift_handoff') {
        const details = log.action_details as any;
        if (details?.to_user_id) {
          owner = details.to_user_id;
        }
      } else if (log.action === 'shift_closed') {
        status = 'closed';
        participants.clear();
      }
    }

    return {
      reconstructed_owner: owner,
      reconstructed_participants: Array.from(participants),
      reconstructed_status: status,
    };
  }
}
