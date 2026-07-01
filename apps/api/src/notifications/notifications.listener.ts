import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  @OnEvent('order.created')
  async handleOrderCreatedEvent(transaction: any) {
    this.logger.log(`Handling order.created event for transaction ID: ${transaction.id}`);
    try {
      const tableName = transaction.store_tables?.name || transaction.store_tables?.code || 'Pelanggan';
      const amount = Number(transaction.total_amount || 0);
      const outletId = transaction.outlet_id;

      // 1. Save to Database
      const notification = await this.prisma.notifications.create({
        data: {
          title: 'Pesanan Mandiri Baru!',
          message: `Pesanan baru masuk dari ${tableName} senilai Rp ${amount.toLocaleString('id-ID')}`,
          type: 'order_created',
          outlet_id: outletId,
          user_id: undefined, // Broadcast to all users in the outlet (sets user_id to NULL in DB)
          is_read: false,
        },
      });

      // 2. Push real-time to targeted outlet room
      this.gateway.sendToOutlet(outletId, 'new_notification', notification);
      this.logger.log(`Successfully broadcast order notification for transaction ${transaction.id} to outlet ${outletId}`);
    } catch (error) {
      this.logger.error(`Error processing order.created notification event: ${error.message}`, error.stack);
    }
  }
}
