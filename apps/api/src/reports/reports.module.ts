import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DatabaseModule } from '../database';
import { ExcelExportService } from '../common/services/excel-export.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ReportsController],
  providers: [ReportsService, ExcelExportService],
  exports: [ReportsService],
})
export class ReportsModule {}
