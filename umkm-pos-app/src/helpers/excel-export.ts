import * as XLSX from 'xlsx';

interface ExportOptions {
  filename: string;
  sheetName?: string;
}

/**
 * Export data to Excel file
 */
export function exportToExcel(
  data: Record<string, any>[],
  options: ExportOptions
) {
  const { filename, sheetName = 'Sheet1' } = options;

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write the file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export summary data to Excel
 */
export function exportSummaryToExcel(
  summary: {
    total_sales: number;
    total_transactions: number;
    total_days: number;
    avg_daily_sales: number;
    avg_daily_transactions: number;
    date_from: string | null;
    date_to: string | null;
  },
  filename: string
) {
  const data = [
    {
      Metric: 'Total Sales',
      Value: summary.total_sales,
    },
    {
      Metric: 'Total Transactions',
      Value: summary.total_transactions,
    },
    {
      Metric: 'Total Days',
      Value: summary.total_days,
    },
    {
      Metric: 'Average Daily Sales',
      Value: summary.avg_daily_sales,
    },
    {
      Metric: 'Average Daily Transactions',
      Value: summary.avg_daily_transactions,
    },
    {
      Metric: 'Date From',
      Value: summary.date_from,
    },
    {
      Metric: 'Date To',
      Value: summary.date_to,
    },
  ];

  exportToExcel(data, { filename, sheetName: 'Summary' });
}

/**
 * Export daily reports to Excel
 */
export function exportDailyReportsToExcel(
  reports: Array<{
    report_date: string | Date;
    total_sales: number;
    total_transactions: number;
  }>,
  filename: string
) {
  const data = reports.map((report) => ({
    'Report Date': report.report_date instanceof Date 
      ? report.report_date.toISOString().split('T')[0]
      : report.report_date,
    'Total Sales': report.total_sales,
    'Total Transactions': report.total_transactions,
  }));

  exportToExcel(data, { filename, sheetName: 'Daily Reports' });
}

/**
 * Export top products to Excel
 */
export function exportTopProductsToExcel(
  products: Array<{
    product_id: string;
    product_name: string;
    total_revenue: number;
    total_qty: number;
  }>,
  filename: string
) {
  const data = products.map((product) => ({
    'Product ID': product.product_id,
    'Product Name': product.product_name,
    'Total Revenue': product.total_revenue,
    'Total Quantity': product.total_qty,
  }));

  exportToExcel(data, { filename, sheetName: 'Top Products' });
}

/**
 * Export outlet comparison to Excel
 */
export function exportOutletComparisonToExcel(
  outlets: Array<{
    outlet_id: string;
    outlet_name: string;
    outlet_slug: string;
    total_revenue: number;
    total_transactions: number;
  }>,
  filename: string
) {
  const data = outlets.map((outlet) => ({
    'Outlet ID': outlet.outlet_id,
    'Outlet Name': outlet.outlet_name,
    'Outlet Slug': outlet.outlet_slug,
    'Total Revenue': outlet.total_revenue,
    'Total Transactions': outlet.total_transactions,
  }));

  exportToExcel(data, { filename, sheetName: 'Outlet Comparison' });
}
