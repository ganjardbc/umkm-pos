import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@ApiTags('Metrics')
@ApiBearerAuth()
@Controller('shifts/:shift_id/participants/:user_id/metrics')
@UseGuards(PermissionGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @RequirePermission('shift.read')
  @ApiOperation({ summary: 'Get participant performance metrics for a shift' })
  @ApiResponse({
    status: 200,
    description:
      'Return participant metrics including transaction count, total amount, and duration',
  })
  @ApiResponse({ status: 404, description: 'Shift or participant not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getParticipantMetrics(
    @Param('shift_id') shiftId: string,
    @Param('user_id') userId: string,
    @CurrentUser('merchant_id') merchantId: string,
  ) {
    return this.metricsService.getParticipantMetrics(
      shiftId,
      userId,
      merchantId,
    );
  }
}
