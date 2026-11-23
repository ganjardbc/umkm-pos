import { Injectable, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../database/prisma.service';
import { QueryReportDto } from './dto/query-report.dto';
import {
  DATE_ONLY,
  businessDayKey,
  businessDayRange,
} from '../common/utils/business-day';
import { CsvExportService } from '../common/services/csv-export.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private csvExportService: CsvExportService,
  ) {}

  // ─────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────

  /**
   * Resolve outlet IDs for the current merchant.
   * If outlet_id is provided, validate it belongs to the merchant first.
   */
  private async resolveOutletIds(
    merchantId: string,
    outletId?: string,
  ): Promise<string[]> {
    if (outletId) {
      const outlet = await this.prisma.outlets.findFirst({
        where: { id: outletId, merchant_id: merchantId },
      });
      if (!outlet) {
        throw new NotFoundException(`Outlet with ID ${outletId} not found`);
      }
      return [outletId];
    }

    const outlets = await this.prisma.outlets.findMany({
      where: { merchant_id: merchantId },
      select: { id: true },
    });
    return outlets.map((o) => o.id);
  }

  /** Parse optional date string; a date-only string (YYYY-MM-DD) starts at 00:00 WIB */
  private parseDate(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    return DATE_ONLY.test(dateStr)
      ? businessDayRange(dateStr).from
      : new Date(dateStr);
  }

  /** Like parseDate, but a date-only string covers the whole WIB day */
  private parseDateEnd(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    return DATE_ONLY.test(dateStr)
      ? new Date(businessDayRange(dateStr).to.getTime() - 1)
      : new Date(dateStr);
  }

  // ─────────────────────────────────────────────
  //  Summary — aggregate from daily_reports
  // ─────────────────────────────────────────────

  async getSummary(merchantId: string, dto: QueryReportDto) {
    const dateFrom = this.parseDate(dto.date_from);
    const dateTo = this.parseDateEnd(dto.date_to);
    const outletIds = await this.resolveOutletIds(merchantId, dto.outlet_id);

    // daily_reports is never populated, so aggregate straight from transactions
    const txWhere: Record<string, unknown> = {
      outlet_id: { in: outletIds },
      is_cancelled: false,
    };
    if (dateFrom || dateTo) {
      txWhere.created_at = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    const txs = await this.prisma.transactions.findMany({
      where: txWhere,
      select: { total_amount: true, created_at: true },
    });

    const total_sales = txs.reduce((acc, t) => acc + Number(t.total_amount), 0);
    const total_transactions = txs.length;
    const total_days = new Set(txs.map((t) => businessDayKey(t.created_at)))
      .size;

    return {
      total_sales,
      total_transactions,
      total_days,
      avg_daily_sales: total_days > 0 ? total_sales / total_days : 0,
      avg_daily_transactions:
        total_days > 0 ? total_transactions / total_days : 0,
      date_from: dto.date_from ?? null,
      date_to: dto.date_to ?? null,
    };
  }

  // ─────────────────────────────────────────────
  //  Daily Reports — paginated rows
  // ─────────────────────────────────────────────

  async getDailyReports(merchantId: string, dto: QueryReportDto) {
    const dateFrom = this.parseDate(dto.date_from);
    const dateTo = this.parseDateEnd(dto.date_to);
    const outletIds = await this.resolveOutletIds(merchantId, dto.outlet_id);

    // daily_reports is never populated, so group transactions per day
    const txWhere: Record<string, unknown> = {
      outlet_id: { in: outletIds },
      is_cancelled: false,
    };
    if (dateFrom || dateTo) {
      txWhere.created_at = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    const txs = await this.prisma.transactions.findMany({
      where: txWhere,
      select: { total_amount: true, created_at: true },
      orderBy: { created_at: 'asc' },
    });

    const byDay = new Map<
      string,
      { report_date: string; total_sales: number; total_transactions: number }
    >();
    for (const t of txs) {
      const day = businessDayKey(t.created_at);
      const row = byDay.get(day) ?? {
        report_date: day,
        total_sales: 0,
        total_transactions: 0,
      };
      row.total_sales += Number(t.total_amount);
      row.total_transactions += 1;
      byDay.set(day, row);
    }
    return [...byDay.values()];
  }

  // ─────────────────────────────────────────────
  //  Top Products — by total revenue
  // ─────────────────────────────────────────────

  async getTopProducts(merchantId: string, dto: QueryReportDto) {
    const outletIds = await this.resolveOutletIds(merchantId, dto.outlet_id);
    const dateFrom = this.parseDate(dto.date_from);
    const dateTo = this.parseDateEnd(dto.date_to);
    const limit = dto.limit ?? 10;

    // Get transaction IDs scoped to merchant (& optionally date range)
    const txWhere: Record<string, unknown> = {
      outlet_id: { in: outletIds },
      is_cancelled: false,
    };
    if (dateFrom || dateTo) {
      txWhere.created_at = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    const transactions = await this.prisma.transactions.findMany({
      where: txWhere,
      select: { id: true },
    });
    const txIds = transactions.map((t) => t.id);

    if (txIds.length === 0) {
      return [];
    }

    // Aggregate transaction_items by product
    const grouped = await this.prisma.transaction_items.groupBy({
      by: ['product_id', 'product_name_snapshot'],
      where: { transaction_id: { in: txIds } },
      _sum: { subtotal: true, qty: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: limit,
    });

    return grouped.map((g) => ({
      product_id: g.product_id,
      product_name: g.product_name_snapshot,
      total_revenue: Number(g._sum.subtotal ?? 0),
      total_qty: g._sum.qty ?? 0,
    }));
  }

  // ─────────────────────────────────────────────
  //  Outlet Comparison — revenue per outlet
  // ─────────────────────────────────────────────

  async getOutletComparison(merchantId: string, dto: QueryReportDto) {
    const outletIds = await this.resolveOutletIds(merchantId, undefined);
    const dateFrom = this.parseDate(dto.date_from);
    const dateTo = this.parseDateEnd(dto.date_to);

    const txWhere: Record<string, unknown> = {
      outlet_id: { in: outletIds },
      is_cancelled: false,
    };
    if (dateFrom || dateTo) {
      txWhere.created_at = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    const grouped = await this.prisma.transactions.groupBy({
      by: ['outlet_id'],
      where: txWhere,
      _sum: { total_amount: true },
      _count: { id: true },
    });

    // Fetch outlet names
    const outlets = await this.prisma.outlets.findMany({
      where: { id: { in: outletIds } },
      select: { id: true, name: true, slug: true },
    });
    const outletMap = new Map(outlets.map((o) => [o.id, o]));

    return grouped.map((g) => {
      const outlet = outletMap.get(g.outlet_id);
      return {
        outlet_id: g.outlet_id,
        outlet_name: outlet?.name ?? 'Unknown',
        outlet_slug: outlet?.slug ?? '',
        total_revenue: Number(g._sum.total_amount ?? 0),
        total_transactions: g._count.id,
      };
    });
  }

  // ─────────────────────────────────────────────
  //  Dashboard — combined view
  // ─────────────────────────────────────────────

  async getDashboard(merchantId: string, dto: QueryReportDto) {
    const [summary, topProducts, outletComparison] = await Promise.all([
      this.getSummary(merchantId, dto),
      this.getTopProducts(merchantId, dto),
      this.getOutletComparison(merchantId, dto),
    ]);

    return { summary, topProducts, outletComparison };
  }

  // ─────────────────────────────────────────────
  //  Export Transactions to CSV
  // ─────────────────────────────────────────────

  async exportTransactionsToCsv(
    merchantId: string,
    dto: QueryReportDto,
    res: Response,
  ) {
    const outletIds = await this.resolveOutletIds(merchantId, dto.outlet_id);
    const dateFrom = this.parseDate(dto.date_from);
    const dateTo = this.parseDateEnd(dto.date_to);

    const txWhere: Record<string, unknown> = {
      outlet_id: { in: outletIds },
    };
    if (dateFrom || dateTo) {
      txWhere.created_at = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    const transactions = await this.prisma.transactions.findMany({
      where: txWhere,
      include: {
        outlets: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const formattedData = transactions.map((t) => ({
      'Transaction ID': t.id,
      'Outlet Name': t.outlets?.name ?? 'Unknown',
      Date: t.created_at.toISOString(),
      'Payment Method': t.payment_method,
      'Total Amount': Number(t.total_amount),
      'Cash Received': t.cash_received ? Number(t.cash_received) : 0,
      'Change Amount': t.change_amount ? Number(t.change_amount) : 0,
      'Order Source': t.order_source,
      'Order Status': t.order_status,
      'Customer Name': t.customer_name_snapshot ?? '-',
      'Customer Phone': t.customer_phone_snapshot ?? '-',
      Cancelled: t.is_cancelled ? 'Yes' : 'No',
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Transaction_Report_${timestamp}`;

    this.csvExportService.exportToCsv(formattedData, filename, res);
  }
}
