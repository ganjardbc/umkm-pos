import { Module } from '@nestjs/common';
import { TransactionItemsService } from './transaction-items.service';
import { TransactionItemsController } from './transaction-items.controller';
import { DatabaseModule } from '../database';

@Module({
  imports: [DatabaseModule],
  controllers: [TransactionItemsController],
  providers: [TransactionItemsService],
  exports: [TransactionItemsService],
})
export class TransactionItemsModule {}
