import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DatabaseModule } from '../database';
import { ExcelExportService } from '../common/services/excel-export.service';
import { CsvExportService } from '../common/services/csv-export.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ReportsController],
  providers: [ReportsService, ExcelExportService, CsvExportService],
  exports: [ReportsService, CsvExportService],
})
export class ReportsModule {}
