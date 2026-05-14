import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AuditLogsService],
  controllers: [AuditLogsController],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
