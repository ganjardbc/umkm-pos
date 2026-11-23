import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ShiftsService } from './shifts.service';

/**
 * Closes open shifts at the outlet's auto_close_time (HH:mm, server time).
 * Checked once a minute; closing is idempotent (an already-closed shift throws and is skipped),
 * so overlapping instances are harmless. shortcut: in-process timer, no job queue; move to a
 * scheduler if the API is ever run with several replicas under heavy load.
 */
@Injectable()
export class ShiftsAutoCloseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ShiftsAutoCloseService.name);
  private timer?: ReturnType<typeof setInterval>;

  constructor(
    private prisma: PrismaService,
    private shifts: ShiftsService,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') return;
    this.timer = setInterval(() => void this.run(), 60_000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /** Most recent occurrence of HH:mm at or before `now`. */
  static lastOccurrence(hhmm: string, now: Date) {
    const [h, m] = hhmm.split(':').map(Number);
    const at = new Date(now);
    at.setHours(h, m, 0, 0);
    if (at > now) at.setDate(at.getDate() - 1);
    return at;
  }

  async run(now = new Date()) {
    const outlets = await this.prisma.outlets.findMany({
      where: { auto_close_time: { not: null }, shift_required: true },
      select: { id: true, merchant_id: true, auto_close_time: true },
    });
    for (const outlet of outlets) {
      const closeAt = ShiftsAutoCloseService.lastOccurrence(
        outlet.auto_close_time!,
        now,
      );
      // Only shifts opened before the last close time; a later shift waits for the next one.
      const open = await this.prisma.shifts.findMany({
        where: {
          outlet_id: outlet.id,
          status: 'open',
          start_time: { lt: closeAt },
        },
        select: { id: true, shift_owner_id: true },
      });
      for (const sh of open) {
        try {
          await this.shifts.closeShift(
            sh.id,
            sh.shift_owner_id,
            outlet.merchant_id,
            null,
            true,
          );
          this.logger.log(`Auto-closed shift ${sh.id}`);
        } catch (error) {
          this.logger.warn(
            `Auto-close skipped for ${sh.id}: ${(error as Error).message}`,
          );
        }
      }
    }
  }
}
