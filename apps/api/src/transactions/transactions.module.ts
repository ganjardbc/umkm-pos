import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { DatabaseModule } from '../database';
import { ShiftsModule } from '../shifts/shifts.module';

@Module({
  imports: [DatabaseModule, ShiftsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
