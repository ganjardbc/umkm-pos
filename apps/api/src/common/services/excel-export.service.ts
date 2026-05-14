import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { Response } from 'express';

@Injectable()
export class ExcelExportService {
  /**
   * Export data to Excel and send as response
   */
  exportToExcel(
    data: Record<string, any>[],
    filename: string,
    sheetName: string,
    res: Response,
  ) {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}.xlsx"`,
    );

    // Send buffer
    res.send(buffer);
  }

  /**
   * Export summary data to Excel
   */
  exportSummaryToExcel(
    summary: {
      total_sales: number;
      total_transactions: number;
      total_days: number;
      avg_daily_sales: number;
      avg_daily_transactions: number;
      date_from: string | null;
      date_to: string | null;
    },
    filename: string,
    res: Response,
  ) {
    const data = [
      { Metric: 'Total Sales', Value: summary.total_sales },
      { Metric: 'Total Transactions', Value: summary.total_transactions },
      { Metric: 'Total Days', Value: summary.total_days },
      { Metric: 'Average Daily Sales', Value: summary.avg_daily_sales },
      {
        Metric: 'Average Daily Transactions',
        Value: summary.avg_daily_transactions,
      },
      { Metric: 'Date From', Value: summary.date_from },
      { Metric: 'Date To', Value: summary.date_to },
    ];

    this.exportToExcel(data, filename, 'Summary', res);
  }

  /**
   * Export daily reports to Excel
   */
  exportDailyReportsToExcel(
    reports: Array<{
      report_date: string | Date;
      total_sales: number;
      total_transactions: number;
    }>,
    filename: string,
    res: Response,
  ) {
    const data = reports.map((report) => ({
      'Report Date':
        report.report_date instanceof Date
          ? report.report_date.toISOString().split('T')[0]
          : report.report_date,
      'Total Sales': report.total_sales,
      'Total Transactions': report.total_transactions,
    }));

    this.exportToExcel(data, filename, 'Daily Reports', res);
  }

  /**
   * Export top products to Excel
   */
  exportTopProductsToExcel(
    products: Array<{
      product_id: string;
      product_name: string;
      total_revenue: number;
      total_qty: number;
    }>,
    filename: string,
    res: Response,
  ) {
    const data = products.map((product) => ({
      'Product ID': product.product_id,
      'Product Name': product.product_name,
      'Total Revenue': product.total_revenue,
      'Total Quantity': product.total_qty,
    }));

    this.exportToExcel(data, filename, 'Top Products', res);
  }

  /**
   * Export outlet comparison to Excel
   */
  exportOutletComparisonToExcel(
    outlets: Array<{
      outlet_id: string;
      outlet_name: string;
      outlet_slug: string;
      total_revenue: number;
      total_transactions: number;
    }>,
    filename: string,
    res: Response,
  ) {
    const data = outlets.map((outlet) => ({
      'Outlet ID': outlet.outlet_id,
      'Outlet Name': outlet.outlet_name,
      'Outlet Slug': outlet.outlet_slug,
      'Total Revenue': outlet.total_revenue,
      'Total Transactions': outlet.total_transactions,
    }));

    this.exportToExcel(data, filename, 'Outlet Comparison', res);
  }
}
