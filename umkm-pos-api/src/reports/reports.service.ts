import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueryReportDto } from './dto/query-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

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

  /** Parse optional ISO date string to Date or undefined */
  private parseDate(dateStr?: string): Date | undefined {
    return dateStr ? new Date(dateStr) : undefined;
  }

  // ─────────────────────────────────────────────
  //  Summary — aggregate from daily_reports
  // ─────────────────────────────────────────────

  async getSummary(merchantId: string, dto: QueryReportDto) {
    const dateFrom = this.parseDate(dto.date_from);
    const dateTo = this.parseDate(dto.date_to);
    const outletIds = await this.resolveOutletIds(merchantId, dto.outlet_id);

    const where: Record<string, unknown> = {
      merchant_id: merchantId,
      outlet_id: { in: outletIds },
    };
    if (dateFrom || dateTo) {
      where.report_date = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    const reports = await this.prisma.daily_reports.findMany({ where });

    const total_sales = reports.reduce(
      (acc, r) => acc + Number(r.total_sales),
      0,
    );
    const total_transactions = reports.reduce(
      (acc, r) => acc + r.total_transactions,
      0,
    );
    const total_days = reports.length;

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
    const dateTo = this.parseDate(dto.date_to);
    const outletIds = await this.resolveOutletIds(merchantId, dto.outlet_id);

    const where: Record<string, unknown> = {
      merchant_id: merchantId,
      outlet_id: { in: outletIds },
    };
    if (dateFrom || dateTo) {
      where.report_date = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    return this.prisma.daily_reports.findMany({
      where,
      orderBy: { report_date: 'desc' },
    });
  }

  // ─────────────────────────────────────────────
  //  Top Products — by total revenue
  // ─────────────────────────────────────────────

  async getTopProducts(merchantId: string, dto: QueryReportDto) {
    const outletIds = await this.resolveOutletIds(merchantId, dto.outlet_id);
    const dateFrom = this.parseDate(dto.date_from);
    const dateTo = this.parseDate(dto.date_to);
    const limit = dto.limit ?? 10;

    // Get transaction IDs scoped to merchant (& optionally date range)
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
    const dateTo = this.parseDate(dto.date_to);

    const txWhere: Record<string, unknown> = {
      outlet_id: { in: outletIds },
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
}
