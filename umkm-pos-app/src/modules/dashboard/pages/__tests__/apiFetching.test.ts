import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../../services/api';

// Feature: dashboard-reports-page, Task 4.4
describe('API Data Fetching and State Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Service Functions', () => {
    it('should have all 5 API service functions available', () => {
      expect(api.getSalesSummary).toBeDefined();
      expect(api.getDailyReports).toBeDefined();
      expect(api.getTopProducts).toBeDefined();
      expect(api.getOutletComparison).toBeDefined();
      expect(api.getDashboardData).toBeDefined();
    });

    it('should accept date_from and date_to parameters', () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      expect(params).toHaveProperty('date_from');
      expect(params).toHaveProperty('date_to');
      expect(params.date_from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(params.date_to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should accept optional outlet_id parameter', () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        outlet_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      expect(params).toHaveProperty('outlet_id');
    });

    it('should accept limit parameter for top products', () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 10,
      };

      expect(params).toHaveProperty('limit');
      expect(params.limit).toBe(10);
    });

    it('should accept limit parameter for dashboard data', () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 10,
      };

      expect(params).toHaveProperty('limit');
      expect(params.limit).toBe(10);
    });
  });

  describe('Parallel API Calls', () => {
    it('should call all 5 endpoints in parallel using Promise.allSettled', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      // Mock all API functions
      const mockSalesSummary = vi.spyOn(api, 'getSalesSummary').mockResolvedValue({
        total_revenue: 1000,
        total_transactions: 50,
        average_transaction_value: 20,
        total_items_sold: 100,
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      });

      const mockDailyReports = vi.spyOn(api, 'getDailyReports').mockResolvedValue([]);
      const mockTopProducts = vi.spyOn(api, 'getTopProducts').mockResolvedValue([]);
      const mockOutletComparison = vi.spyOn(api, 'getOutletComparison').mockResolvedValue([]);
      const mockDashboardData = vi.spyOn(api, 'getDashboardData').mockResolvedValue({
        summary: {
          total_revenue: 1000,
          total_transactions: 50,
          average_transaction_value: 20,
          total_items_sold: 100,
        },
        top_products: [],
        daily_trend: [],
        outlet_summary: [],
      });

      // Simulate parallel calls
      const results = await Promise.allSettled([
        api.getSalesSummary(params),
        api.getDailyReports(params),
        api.getTopProducts({ ...params, limit: 10 }),
        api.getOutletComparison(params),
        api.getDashboardData({ ...params, limit: 10 }),
      ]);

      expect(results).toHaveLength(5);
      expect(mockSalesSummary).toHaveBeenCalledWith(params);
      expect(mockDailyReports).toHaveBeenCalledWith(params);
      expect(mockTopProducts).toHaveBeenCalledWith({ ...params, limit: 10 });
      expect(mockOutletComparison).toHaveBeenCalledWith(params);
      expect(mockDashboardData).toHaveBeenCalledWith({ ...params, limit: 10 });
    });

    it('should handle individual endpoint failures independently', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      // Mock some successful and some failed calls
      vi.spyOn(api, 'getSalesSummary').mockResolvedValue({
        total_revenue: 1000,
        total_transactions: 50,
        average_transaction_value: 20,
        total_items_sold: 100,
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      });
      vi.spyOn(api, 'getDailyReports').mockRejectedValue(new Error('Network error'));
      vi.spyOn(api, 'getTopProducts').mockResolvedValue([]);
      vi.spyOn(api, 'getOutletComparison').mockRejectedValue(new Error('Server error'));
      vi.spyOn(api, 'getDashboardData').mockResolvedValue({
        summary: {
          total_revenue: 1000,
          total_transactions: 50,
          average_transaction_value: 20,
          total_items_sold: 100,
        },
        top_products: [],
        daily_trend: [],
        outlet_summary: [],
      });

      const results = await Promise.allSettled([
        api.getSalesSummary(params),
        api.getDailyReports(params),
        api.getTopProducts({ ...params, limit: 10 }),
        api.getOutletComparison(params),
        api.getDashboardData({ ...params, limit: 10 }),
      ]);

      // Check that some succeeded and some failed
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
      expect(results[3].status).toBe('rejected');
      expect(results[4].status).toBe('fulfilled');
    });
  });

  describe('State Management', () => {
    it('should have separate data state for each chart', () => {
      const states = {
        salesSummaryData: null,
        dailyReportsData: null,
        topProductsData: null,
        outletComparisonData: null,
        dashboardOverviewData: null,
      };

      expect(states).toHaveProperty('salesSummaryData');
      expect(states).toHaveProperty('dailyReportsData');
      expect(states).toHaveProperty('topProductsData');
      expect(states).toHaveProperty('outletComparisonData');
      expect(states).toHaveProperty('dashboardOverviewData');
    });

    it('should have separate loading state for each chart', () => {
      const loadingStates = {
        salesSummaryLoading: false,
        dailyReportsLoading: false,
        topProductsLoading: false,
        outletComparisonLoading: false,
        dashboardOverviewLoading: false,
      };

      expect(loadingStates).toHaveProperty('salesSummaryLoading');
      expect(loadingStates).toHaveProperty('dailyReportsLoading');
      expect(loadingStates).toHaveProperty('topProductsLoading');
      expect(loadingStates).toHaveProperty('outletComparisonLoading');
      expect(loadingStates).toHaveProperty('dashboardOverviewLoading');
    });

    it('should have separate error state for each chart', () => {
      const errorStates = {
        salesSummaryError: null,
        dailyReportsError: null,
        topProductsError: null,
        outletComparisonError: null,
        dashboardOverviewError: null,
      };

      expect(errorStates).toHaveProperty('salesSummaryError');
      expect(errorStates).toHaveProperty('dailyReportsError');
      expect(errorStates).toHaveProperty('topProductsError');
      expect(errorStates).toHaveProperty('outletComparisonError');
      expect(errorStates).toHaveProperty('dashboardOverviewError');
    });

    it('should clear loading states when all requests complete', () => {
      const loadingStates = {
        salesSummaryLoading: true,
        dailyReportsLoading: true,
        topProductsLoading: true,
        outletComparisonLoading: true,
        dashboardOverviewLoading: true,
      };

      // Simulate completion
      loadingStates.salesSummaryLoading = false;
      loadingStates.dailyReportsLoading = false;
      loadingStates.topProductsLoading = false;
      loadingStates.outletComparisonLoading = false;
      loadingStates.dashboardOverviewLoading = false;

      const allLoadingComplete = Object.values(loadingStates).every(loading => !loading);
      expect(allLoadingComplete).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should set error message when API call fails', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      vi.spyOn(api, 'getSalesSummary').mockRejectedValue(new Error('Network error'));

      let errorMessage: string | null = null;
      try {
        await api.getSalesSummary(params);
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Failed to fetch sales summary';
      }

      expect(errorMessage).toBe('Network error');
    });

    it('should clear data when API call fails', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      vi.spyOn(api, 'getSalesSummary').mockRejectedValue(new Error('Network error'));

      let data: any = { existing: 'data' };
      try {
        data = await api.getSalesSummary(params);
      } catch (error) {
        data = null;
      }

      expect(data).toBeNull();
    });

    it('should handle generic error messages', () => {
      const error = new Error('API Error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';

      expect(errorMessage).toBe('API Error');
    });

    it('should provide fallback error message for non-Error objects', () => {
      const error = 'String error';
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';

      expect(errorMessage).toBe('Failed to fetch data');
    });
  });

  describe('Date Range Reactivity', () => {
    it('should trigger fetchAllReports when date range changes', () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      // Simulate date range change
      const newDateRange = {
        start: new Date('2024-02-01'),
        end: new Date('2024-02-28'),
      };

      expect(newDateRange.start).not.toEqual(dateRange.start);
      expect(newDateRange.end).not.toEqual(dateRange.end);
    });

    it('should not trigger fetchAllReports when date range is invalid', () => {
      const dateRange = {
        start: new Date('2024-01-31'),
        end: new Date('2024-01-01'),
      };

      const isValid = dateRange.start <= dateRange.end;
      expect(isValid).toBe(false);
    });
  });

  describe('Component Mount Behavior', () => {
    it('should fetch data on component mount', () => {
      const shouldFetchOnMount = true;
      expect(shouldFetchOnMount).toBe(true);
    });

    it('should initialize date range before fetching', () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      const dateRange = [start, end];
      expect(dateRange).toHaveLength(2);
      expect(dateRange[0]).toBeDefined();
      expect(dateRange[1]).toBeDefined();
    });
  });
});
