import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database';
import { CustomerCatalogController } from './customer-catalog.controller';
import { CustomerCatalogService } from './customer-catalog.service';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [DatabaseModule, TransactionsModule],
  controllers: [CustomerCatalogController],
  providers: [CustomerCatalogService],
})
export class CustomerCatalogModule {}
