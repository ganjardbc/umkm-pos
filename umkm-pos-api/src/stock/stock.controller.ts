import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { StockLogsQueryDto } from './dto/stock-logs-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@ApiTags('Stock')
@ApiBearerAuth()
@Controller('stock')
@UseGuards(PermissionGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('logs')
  @RequirePermission('stock.read')
  @ApiOperation({
    summary:
      'List all stock logs for the current merchant (optionally filter by product)',
  })
  @ApiResponse({ status: 200, description: 'Return stock logs' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findLogs(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() query: StockLogsQueryDto,
  ) {
    const { product_id, page, limit } = query;

    // Create pagination object from query params
    const pagination = Object.assign(new StockLogsQueryDto(), { page, limit });

    return this.stockService.findLogs(merchantId, product_id, pagination);
  }

  @Post('adjust')
  @RequirePermission('stock.adjust')
  @ApiOperation({
    summary: 'Manual stock adjustment (restock, damage, correction, manual)',
  })
  @ApiResponse({ status: 201, description: 'Adjustment applied and logged' })
  @ApiResponse({
    status: 400,
    description: 'Invalid change_qty or insufficient stock',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  adjust(
    @Body() dto: CreateStockAdjustmentDto,
    @CurrentUser('merchant_id') merchantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.stockService.adjust(dto, merchantId, userId);
  }
}
