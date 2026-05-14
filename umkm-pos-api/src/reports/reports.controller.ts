import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { QueryReportDto } from './dto/query-report.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';
import { ExcelExportService } from '../common/services/excel-export.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(PermissionGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly excelExportService: ExcelExportService,
  ) {}

  @Get('summary')
  @RequirePermission('report.read')
  @ApiOperation({
    summary:
      'Sales summary — total revenue & transactions (from daily_reports)',
  })
  @ApiResponse({ status: 200, description: 'Aggregated sales summary' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  getSummary(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() dto: QueryReportDto,
  ) {
    return this.reportsService.getSummary(merchantId, dto);
  }

  @Get('daily')
  @RequirePermission('report.read')
  @ApiOperation({
    summary: 'Daily reports list — rows from daily_reports table',
  })
  @ApiResponse({ status: 200, description: 'Daily report rows' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  getDailyReports(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() dto: QueryReportDto,
  ) {
    return this.reportsService.getDailyReports(merchantId, dto);
  }

  @Get('top-products')
  @RequirePermission('report.read')
  @ApiOperation({
    summary: 'Top products — ranked by total revenue within date range',
  })
  @ApiResponse({ status: 200, description: 'Top products list' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  @ApiResponse({ status: 404, description: 'Outlet not found' })
  getTopProducts(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() dto: QueryReportDto,
  ) {
    return this.reportsService.getTopProducts(merchantId, dto);
  }

  @Get('outlet-comparison')
  @RequirePermission('report.read')
  @ApiOperation({
    summary: 'Outlet comparison — revenue & transaction count per outlet',
  })
  @ApiResponse({ status: 200, description: 'Per-outlet revenue comparison' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  getOutletComparison(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() dto: QueryReportDto,
  ) {
    return this.reportsService.getOutletComparison(merchantId, dto);
  }

  @Get('dashboard')
  @RequirePermission('report.read')
  @ApiOperation({
    summary:
      'Dashboard — combined summary, top products & outlet comparison in one call',
  })
  @ApiResponse({ status: 200, description: 'Full dashboard data' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  getDashboard(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() dto: QueryReportDto,
  ) {
    return this.reportsService.getDashboard(merchantId, dto);
  }

  // ─────────────────────────────────────────────
  //  Export Endpoints
  // ─────────────────────────────────────────────

  @Get('export/summary')
  @RequirePermission('report.read')
  @ApiOperation({
    summary: 'Export sales summary as Excel file',
  })
  @ApiResponse({ status: 200, description: 'Excel file' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  async exportSummary(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() dto: QueryReportDto,
    @Res() res: Response,
  ) {
    const summary = await this.reportsService.getSummary(merchantId, dto);
    const timestamp = new Date().toISOString().split('T')[0];
    this.excelExportService.exportSummaryToExcel(
      summary,
      `Sales_Summary_${timestamp}`,
      res,
    );
  }

  @Get('export/daily')
  @RequirePermission('report.read')
  @ApiOperation({
    summary: 'Export daily reports as Excel file',
  })
  @ApiResponse({ status: 200, description: 'Excel file' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  async exportDailyReports(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() dto: QueryReportDto,
    @Res() res: Response,
  ) {
    const reports = await this.reportsService.getDailyReports(merchantId, dto);
    const formattedReports = reports.map((r) => ({
      report_date: r.report_date,
      total_sales: Number(r.total_sales),
      total_transactions: r.total_transactions,
    }));
    const timestamp = new Date().toISOString().split('T')[0];
    this.excelExportService.exportDailyReportsToExcel(
      formattedReports,
      `Daily_Reports_${timestamp}`,
      res,
    );
  }

  @Get('export/top-products')
  @RequirePermission('report.read')
  @ApiOperation({
    summary: 'Export top products as Excel file',
  })
  @ApiResponse({ status: 200, description: 'Excel file' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  async exportTopProducts(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() dto: QueryReportDto,
    @Res() res: Response,
  ) {
    const products = await this.reportsService.getTopProducts(merchantId, dto);
    const formattedProducts = products.map((p) => ({
      product_id: p.product_id || 'N/A',
      product_name: p.product_name,
      total_revenue: p.total_revenue,
      total_qty: p.total_qty,
    }));
    const timestamp = new Date().toISOString().split('T')[0];
    this.excelExportService.exportTopProductsToExcel(
      formattedProducts,
      `Top_Products_${timestamp}`,
      res,
    );
  }

  @Get('export/outlet-comparison')
  @RequirePermission('report.read')
  @ApiOperation({
    summary: 'Export outlet comparison as Excel file',
  })
  @ApiResponse({ status: 200, description: 'Excel file' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  async exportOutletComparison(
    @CurrentUser('merchant_id') merchantId: string,
    @Query() dto: QueryReportDto,
    @Res() res: Response,
  ) {
    const outlets = await this.reportsService.getOutletComparison(
      merchantId,
      dto,
    );
    const timestamp = new Date().toISOString().split('T')[0];
    this.excelExportService.exportOutletComparisonToExcel(
      outlets,
      `Outlet_Comparison_${timestamp}`,
      res,
    );
  }
}
