import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('shifts/:shift_id/audit-log')
@UseGuards(PermissionGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermission('shift.read')
  @ApiOperation({ summary: 'Get audit trail for a shift' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Return audit log entries' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getAuditLogs(
    @Param('shift_id') shiftId: string,
    @CurrentUser('merchant_id') merchantId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    return this.auditLogsService.getAuditLogs(
      shiftId,
      merchantId,
      limitNum,
      offsetNum,
    );
  }
}
