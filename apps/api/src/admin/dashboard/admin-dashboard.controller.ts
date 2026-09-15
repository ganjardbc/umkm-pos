import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(AdminGuard)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform statistics (merchants, outlets, users)' })
  @ApiResponse({ status: 200, description: 'Return platform statistics' })
  @ApiResponse({ status: 403, description: 'Admin access only' })
  getStats() {
    return this.dashboardService.getStats();
  }
}
