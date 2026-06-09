import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database';
import { StoreTablesController } from './store-tables.controller';
import { StoreTablesService } from './store-tables.service';

@Module({
  imports: [DatabaseModule],
  controllers: [StoreTablesController],
  providers: [StoreTablesService],
  exports: [StoreTablesService],
})
export class StoreTablesModule {}
