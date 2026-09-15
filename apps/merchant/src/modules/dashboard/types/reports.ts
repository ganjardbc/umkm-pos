// ============================================================================
// Request Parameter Types
// ============================================================================

/**
 * Base parameters for all reporting endpoints
 */
export interface BaseReportParams {
  date_from: string;  // ISO 8601 format: YYYY-MM-DD
  date_to: string;    // ISO 8601 format: YYYY-MM-DD
  outlet_id?: string; // Optional UUID filter
}

/**
 * Parameters for top products endpoint
 */
export interface TopProductsParams extends BaseReportParams {
  limit?: number;     // Range: 1-50, default: 10
}

/**
 * Parameters for dashboard endpoint
 */
export interface DashboardParams extends BaseReportParams {
  limit?: number;     // Range: 1-50, default: 10 (for top products)
}

// ============================================================================
// Response Data Types
// ============================================================================

/**
 * Sales summary aggregated metrics
 */
export interface SalesSummaryResponse {
  data: {
    total_sales: number;
    total_transactions: number;
    total_days: number;
    avg_daily_sales: number;
    avg_daily_transactions: number;
    date_from: string;
    date_to: string;
  };
}

/**
 * Single day's report data
 */
export interface DailyReportItem {
  report_date: string;           // YYYY-MM-DD or ISO date string
  total_sales: number;
  total_transactions: number;
}

/**
 * Daily reports response
 */
export interface DailyReportsResponse {
  data: DailyReportItem[];
}

/**
 * Single product performance data
 */
export interface TopProductItem {
  product_id: string;
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

/**
 * Top products response
 */
export interface TopProductsResponse {
  data: TopProductItem[];
}

/**
 * Single outlet comparison data
 */
export interface OutletComparisonItem {
  outlet_id: string;
  outlet_name: string;
  outlet_slug: string;
  total_revenue: number;
  total_transactions: number;
}

/**
 * Outlet comparison response
 */
export interface OutletComparisonResponse {
  data: OutletComparisonItem[];
}

/**
 * Dashboard consolidated data
 */
export interface DashboardResponse {
  data: {
    summary: {
      total_sales: number;
      total_transactions: number;
      total_days: number;
      avg_daily_sales: number;
      avg_daily_transactions: number;
      date_from: string | null;
      date_to: string | null;
    };
    topProducts: TopProductItem[];
    outletComparison: OutletComparisonItem[];
  };
}

// ============================================================================
// Chart Component Props Types
// ============================================================================

/**
 * Generic chart component props
 */
export interface ChartComponentProps<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  title: string;
}

// ============================================================================
// Date Range Types
// ============================================================================

/**
 * Date range selection state
 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Formatted date range for API calls
 */
export interface FormattedDateRange {
  date_from: string;  // YYYY-MM-DD
  date_to: string;    // YYYY-MM-DD
}
