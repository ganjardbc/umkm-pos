/**
 * Data validation utilities for API responses
 * Validates that API responses match expected TypeScript interfaces
 */

import type {
  SalesSummaryResponse,
  DailyReportItem,
  DailyReportsResponse,
  TopProductItem,
  TopProductsResponse,
  OutletComparisonItem,
  OutletComparisonResponse,
  DashboardResponse,
} from '../types/reports';

/**
 * Validation error class for data format issues
 */
export class DataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataValidationError';
  }
}

/**
 * Check if a value is a valid number (including string representations of numbers and Decimal types)
 */
function isValidNumber(value: any): boolean {
  // Handle null/undefined
  if (value === null || value === undefined) return false;
  
  // Handle actual numbers
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }
  
  // Handle string representations of numbers (for Decimal types from Prisma)
  if (typeof value === 'string') {
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }
  
  // Handle Decimal objects (if they have a toNumber method)
  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    const num = value.toNumber();
    return !isNaN(num) && isFinite(num);
  }
  
  return false;
}

/**
 * Check if a value is a valid non-empty string
 */
function isValidString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if a value is a valid date string in YYYY-MM-DD format or ISO format
 */
function isValidDateString(value: any): boolean {
  if (!isValidString(value)) return false;
  
  // Check format YYYY-MM-DD or ISO date string
  const dateRegex = /^\d{4}-\d{2}-\d{2}/;
  if (!dateRegex.test(value)) return false;
  
  // Check if it's a valid date
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate sales summary response data
 */
export function validateSalesSummaryData(data: any): SalesSummaryResponse['data'] {
  if (!data || typeof data !== 'object') {
    throw new DataValidationError('Sales summary data is missing or invalid');
  }

  // Check required numeric fields
  const requiredNumericFields = [
    'total_sales',
    'total_transactions',
    'total_days',
    'avg_daily_sales',
    'avg_daily_transactions',
  ];

  for (const field of requiredNumericFields) {
    if (!isValidNumber(data[field])) {
      throw new DataValidationError(
        `Sales summary: '${field}' must be a valid number`
      );
    }
  }

  // Check required date fields
  const requiredDateFields = ['date_from', 'date_to'];
  for (const field of requiredDateFields) {
    if (!isValidDateString(data[field])) {
      throw new DataValidationError(
        `Sales summary: '${field}' must be a valid date string (YYYY-MM-DD)`
      );
    }
  }

  return data as SalesSummaryResponse['data'];
}

/**
 * Validate a single daily report item
 */
function validateDailyReportItem(item: any, index: number): DailyReportItem {
  if (!item || typeof item !== 'object') {
    throw new DataValidationError(
      `Daily report item at index ${index} is missing or invalid`
    );
  }

  if (!isValidDateString(item.report_date)) {
    throw new DataValidationError(
      `Daily report item at index ${index}: 'report_date' must be a valid date string (YYYY-MM-DD or ISO format)`
    );
  }

  const requiredNumericFields = ['total_sales', 'total_transactions'];
  for (const field of requiredNumericFields) {
    if (!isValidNumber(item[field])) {
      throw new DataValidationError(
        `Daily report item at index ${index}: '${field}' must be a valid number`
      );
    }
  }

  return item as DailyReportItem;
}

/**
 * Validate daily reports response data
 */
export function validateDailyReportsData(data: any): DailyReportsResponse['data'] {
  if (!Array.isArray(data)) {
    throw new DataValidationError('Daily reports data must be an array');
  }

  // Validate each item in the array
  const validatedData = data.map((item, index) => validateDailyReportItem(item, index));

  return validatedData;
}

/**
 * Validate a single top product item
 */
function validateTopProductItem(item: any, index: number): TopProductItem {
  if (!item || typeof item !== 'object') {
    throw new DataValidationError(
      `Top product item at index ${index} is missing or invalid`
    );
  }

  if (!isValidString(item.product_id)) {
    throw new DataValidationError(
      `Top product item at index ${index}: 'product_id' must be a valid string`
    );
  }

  if (!isValidString(item.product_name)) {
    throw new DataValidationError(
      `Top product item at index ${index}: 'product_name' must be a valid string`
    );
  }

  const requiredNumericFields = ['total_qty', 'total_revenue'];
  for (const field of requiredNumericFields) {
    if (!isValidNumber(item[field])) {
      throw new DataValidationError(
        `Top product item at index ${index}: '${field}' must be a valid number`
      );
    }
  }

  return item as TopProductItem;
}

/**
 * Validate top products response data
 */
export function validateTopProductsData(data: any): TopProductsResponse['data'] {
  if (!Array.isArray(data)) {
    throw new DataValidationError('Top products data must be an array');
  }

  // Validate each item in the array
  const validatedData = data.map((item, index) => validateTopProductItem(item, index));

  return validatedData;
}

/**
 * Validate a single outlet comparison item
 */
function validateOutletComparisonItem(item: any, index: number): OutletComparisonItem {
  if (!item || typeof item !== 'object') {
    throw new DataValidationError(
      `Outlet comparison item at index ${index} is missing or invalid`
    );
  }

  if (!isValidString(item.outlet_id)) {
    throw new DataValidationError(
      `Outlet comparison item at index ${index}: 'outlet_id' must be a valid string`
    );
  }

  if (!isValidString(item.outlet_name)) {
    throw new DataValidationError(
      `Outlet comparison item at index ${index}: 'outlet_name' must be a valid string`
    );
  }

  if (!isValidString(item.outlet_slug)) {
    throw new DataValidationError(
      `Outlet comparison item at index ${index}: 'outlet_slug' must be a valid string`
    );
  }

  const requiredNumericFields = ['total_revenue', 'total_transactions'];
  for (const field of requiredNumericFields) {
    if (!isValidNumber(item[field])) {
      throw new DataValidationError(
        `Outlet comparison item at index ${index}: '${field}' must be a valid number`
      );
    }
  }

  return item as OutletComparisonItem;
}

/**
 * Validate outlet comparison response data
 */
export function validateOutletComparisonData(data: any): OutletComparisonResponse['data'] {
  if (!Array.isArray(data)) {
    throw new DataValidationError('Outlet comparison data must be an array');
  }

  // Validate each item in the array
  const validatedData = data.map((item, index) => validateOutletComparisonItem(item, index));

  return validatedData;
}

/**
 * Validate dashboard response data
 */
export function validateDashboardData(data: any): DashboardResponse['data'] {
  if (!data || typeof data !== 'object') {
    throw new DataValidationError('Dashboard data is missing or invalid');
  }

  // Validate summary section
  if (!data.summary || typeof data.summary !== 'object') {
    throw new DataValidationError('Dashboard data: summary section is missing or invalid');
  }

  const requiredSummaryFields = [
    'total_sales',
    'total_transactions',
    'total_days',
    'avg_daily_sales',
    'avg_daily_transactions',
  ];

  for (const field of requiredSummaryFields) {
    if (!isValidNumber(data.summary[field])) {
      throw new DataValidationError(
        `Dashboard summary: '${field}' must be a valid number`
      );
    }
  }

  // Validate topProducts section
  if (!Array.isArray(data.topProducts)) {
    throw new DataValidationError('Dashboard data: topProducts must be an array');
  }
  data.topProducts.forEach((item: any, index: number) => {
    validateTopProductItem(item, index);
  });

  // Validate outletComparison section
  if (!Array.isArray(data.outletComparison)) {
    throw new DataValidationError('Dashboard data: outletComparison must be an array');
  }
  data.outletComparison.forEach((item: any, index: number) => {
    validateOutletComparisonItem(item, index);
  });

  return data as DashboardResponse['data'];
}
