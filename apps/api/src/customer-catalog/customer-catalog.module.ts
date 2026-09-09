import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database';
import { CustomerCatalogController } from './customer-catalog.controller';
import { CustomerCatalogService } from './customer-catalog.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, TransactionsModule, NotificationsModule],
  controllers: [CustomerCatalogController],
  providers: [CustomerCatalogService],
})
export class CustomerCatalogModule {}
