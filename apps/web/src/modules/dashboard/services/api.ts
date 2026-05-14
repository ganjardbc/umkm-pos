import api from "@/plugins/axios.ts";
import type {
  BaseReportParams,
  TopProductsParams,
  DashboardParams,
  SalesSummaryResponse,
  DailyReportsResponse,
  TopProductsResponse,
  OutletComparisonResponse,
  DashboardResponse,
} from '../types/reports';
import {
  validateSalesSummaryData,
  validateDailyReportsData,
  validateTopProductsData,
  validateOutletComparisonData,
  validateDashboardData,
  DataValidationError,
} from '../utils/validation';

const REPORTS_BASE_PATH = '/api/v1/reports';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates that a limit parameter is within the valid range (1-50)
 * @param limit - The limit value to validate
 * @throws Error if limit is outside the valid range
 */
function validateLimit(limit: number | undefined): void {
  if (limit !== undefined) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new Error('Limit parameter must be an integer between 1 and 50');
    }
  }
}

/**
 * Validates that an outlet_id is a valid UUID format or null/undefined
 * @param outletId - The outlet_id to validate
 * @throws Error if outlet_id is not a valid UUID format
 */
function validateOutletId(outletId: string | undefined): void {
  if (outletId !== undefined && outletId !== null && outletId !== '') {
    // UUID v4 format: 8-4-4-4-12 hexadecimal characters
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(outletId)) {
      throw new Error('outlet_id must be a valid UUID format');
    }
  }
}

// ============================================================================
// Reports API Functions
// ============================================================================

/**
 * Fetch sales summary for a date range
 */
export async function getSalesSummary(
  params: BaseReportParams
): Promise<SalesSummaryResponse['data']> {
  // Validate parameters
  validateOutletId(params.outlet_id);
  
  try {
    const response = await api.get<SalesSummaryResponse>(
      `${REPORTS_BASE_PATH}/summary`,
      { params }
    );
    
    // Validate response data structure
    const validatedData = validateSalesSummaryData(response.data.data);
    return validatedData;
  } catch (error) {
    if (error instanceof DataValidationError) {
      throw new Error(`Data format error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch daily reports for a date range
 */
export async function getDailyReports(
  params: BaseReportParams
): Promise<DailyReportsResponse['data']> {
  // Validate parameters
  validateOutletId(params.outlet_id);
  
  try {
    const response = await api.get<DailyReportsResponse>(
      `${REPORTS_BASE_PATH}/daily`,
      { params }
    );
    
    // Validate response data structure
    const validatedData = validateDailyReportsData(response.data.data);
    return validatedData;
  } catch (error) {
    if (error instanceof DataValidationError) {
      throw new Error(`Data format error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch top products for a date range
 */
export async function getTopProducts(
  params: TopProductsParams
): Promise<TopProductsResponse['data']> {
  const { limit = 10, ...baseParams } = params;
  
  // Validate parameters
  validateLimit(limit);
  validateOutletId(baseParams.outlet_id);
  
  try {
    const response = await api.get<TopProductsResponse>(
      `${REPORTS_BASE_PATH}/top-products`,
      { params: { ...baseParams, limit } }
    );
    
    // Validate response data structure
    const validatedData = validateTopProductsData(response.data.data);
    return validatedData;
  } catch (error) {
    if (error instanceof DataValidationError) {
      throw new Error(`Data format error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch outlet comparison for a date range
 */
export async function getOutletComparison(
  params: BaseReportParams
): Promise<OutletComparisonResponse['data']> {
  // Validate parameters
  validateOutletId(params.outlet_id);
  
  try {
    const response = await api.get<OutletComparisonResponse>(
      `${REPORTS_BASE_PATH}/outlet-comparison`,
      { params }
    );
    
    // Validate response data structure
    const validatedData = validateOutletComparisonData(response.data.data);
    return validatedData;
  } catch (error) {
    if (error instanceof DataValidationError) {
      throw new Error(`Data format error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch consolidated dashboard data
 */
export async function getDashboardData(
  params: DashboardParams
): Promise<DashboardResponse['data']> {
  const { limit = 10, ...baseParams } = params;
  
  // Validate parameters
  validateLimit(limit);
  validateOutletId(baseParams.outlet_id);
  
  try {
    const response = await api.get<DashboardResponse>(
      `${REPORTS_BASE_PATH}/dashboard`,
      { params: { ...baseParams, limit } }
    );
    
    // Validate response data structure
    const validatedData = validateDashboardData(response.data.data);
    return validatedData;
  } catch (error) {
    if (error instanceof DataValidationError) {
      throw new Error(`Data format error: ${error.message}`);
    }
    throw error;
  }
}
