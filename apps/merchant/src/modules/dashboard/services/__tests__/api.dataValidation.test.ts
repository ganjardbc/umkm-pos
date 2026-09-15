import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSalesSummary,
  getDailyReports,
  getTopProducts,
  getOutletComparison,
  getDashboardData,
} from '../api';
import api from '@/plugins/axios';

// Mock the axios instance
vi.mock('@/plugins/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('API Service Data Format Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSalesSummary - Data Validation', () => {
    it('should accept valid response data', async () => {
      const mockResponse = {
        data: {
          data: {
            total_revenue: 1000000,
            total_transactions: 150,
            average_transaction_value: 6666.67,
            total_items_sold: 450,
            date_from: '2024-01-01',
            date_to: '2024-01-31',
          },
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      const result = await getSalesSummary(params);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should reject response with missing numeric fields', async () => {
      const mockResponse = {
        data: {
          data: {
            total_revenue: 1000000,
            // missing total_transactions
            average_transaction_value: 6666.67,
            total_items_sold: 450,
            date_from: '2024-01-01',
            date_to: '2024-01-31',
          },
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      await expect(getSalesSummary(params)).rejects.toThrow(/Data format error/);
      await expect(getSalesSummary(params)).rejects.toThrow(/total_transactions/);
    });

    it('should reject response with invalid date format', async () => {
      const mockResponse = {
        data: {
          data: {
            total_revenue: 1000000,
            total_transactions: 150,
            average_transaction_value: 6666.67,
            total_items_sold: 450,
            date_from: '01/01/2024', // Invalid format
            date_to: '2024-01-31',
          },
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      await expect(getSalesSummary(params)).rejects.toThrow(/Data format error/);
      await expect(getSalesSummary(params)).rejects.toThrow(/date_from/);
    });

    it('should reject response with NaN values', async () => {
      const mockResponse = {
        data: {
          data: {
            total_revenue: NaN,
            total_transactions: 150,
            average_transaction_value: 6666.67,
            total_items_sold: 450,
            date_from: '2024-01-01',
            date_to: '2024-01-31',
          },
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      await expect(getSalesSummary(params)).rejects.toThrow(/Data format error/);
    });
  });

  describe('getDailyReports - Data Validation', () => {
    it('should accept valid response data', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              date: '2024-01-01',
              revenue: 50000,
              transactions: 25,
              items_sold: 75,
            },
            {
              date: '2024-01-02',
              revenue: 60000,
              transactions: 30,
              items_sold: 90,
            },
          ],
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-02',
      };

      const result = await getDailyReports(params);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should reject non-array response', async () => {
      const mockResponse = {
        data: {
          data: { not: 'an array' },
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-02',
      };

      await expect(getDailyReports(params)).rejects.toThrow(/Data format error/);
      await expect(getDailyReports(params)).rejects.toThrow(/must be an array/);
    });

    it('should reject array with invalid items', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              date: '2024-01-01',
              revenue: 50000,
              transactions: 25,
              items_sold: 75,
            },
            {
              date: 'invalid-date',
              revenue: 60000,
              transactions: 30,
              items_sold: 90,
            },
          ],
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-02',
      };

      await expect(getDailyReports(params)).rejects.toThrow(/Data format error/);
      await expect(getDailyReports(params)).rejects.toThrow(/index 1/);
    });
  });

  describe('getTopProducts - Data Validation', () => {
    it('should accept valid response data', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              product_id: 'prod-123',
              product_name: 'Product A',
              quantity_sold: 100,
              revenue: 500000,
            },
          ],
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 10,
      };

      const result = await getTopProducts(params);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should reject items with missing string fields', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              product_id: 'prod-123',
              // missing product_name
              quantity_sold: 100,
              revenue: 500000,
            },
          ],
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 10,
      };

      await expect(getTopProducts(params)).rejects.toThrow(/Data format error/);
      await expect(getTopProducts(params)).rejects.toThrow(/product_name/);
    });

    it('should reject items with empty string fields', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              product_id: '',
              product_name: 'Product A',
              quantity_sold: 100,
              revenue: 500000,
            },
          ],
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 10,
      };

      await expect(getTopProducts(params)).rejects.toThrow(/Data format error/);
      await expect(getTopProducts(params)).rejects.toThrow(/product_id/);
    });
  });

  describe('getOutletComparison - Data Validation', () => {
    it('should accept valid response data', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              outlet_id: 'outlet-123',
              outlet_name: 'Outlet A',
              revenue: 1000000,
              transactions: 200,
              items_sold: 600,
            },
          ],
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      const result = await getOutletComparison(params);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should reject items with missing fields', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              outlet_id: 'outlet-123',
              // missing outlet_name
              revenue: 1000000,
              transactions: 200,
              items_sold: 600,
            },
          ],
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      await expect(getOutletComparison(params)).rejects.toThrow(/Data format error/);
      await expect(getOutletComparison(params)).rejects.toThrow(/outlet_name/);
    });
  });

  describe('getDashboardData - Data Validation', () => {
    it('should accept valid response data', async () => {
      const mockResponse = {
        data: {
          data: {
            summary: {
              total_revenue: 1000000,
              total_transactions: 150,
              average_transaction_value: 6666.67,
              total_items_sold: 450,
            },
            top_products: [
              {
                product_id: 'prod-123',
                product_name: 'Product A',
                quantity_sold: 100,
                revenue: 500000,
              },
            ],
            daily_trend: [
              {
                date: '2024-01-01',
                revenue: 50000,
                transactions: 25,
                items_sold: 75,
              },
            ],
            outlet_summary: [
              {
                outlet_id: 'outlet-123',
                outlet_name: 'Outlet A',
                revenue: 1000000,
                transactions: 200,
                items_sold: 600,
              },
            ],
          },
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 10,
      };

      const result = await getDashboardData(params);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should reject response with missing summary section', async () => {
      const mockResponse = {
        data: {
          data: {
            // missing summary
            top_products: [],
            daily_trend: [],
            outlet_summary: [],
          },
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 10,
      };

      await expect(getDashboardData(params)).rejects.toThrow(/Data format error/);
      await expect(getDashboardData(params)).rejects.toThrow(/summary/);
    });

    it('should reject response with non-array sections', async () => {
      const mockResponse = {
        data: {
          data: {
            summary: {
              total_revenue: 1000000,
              total_transactions: 150,
              average_transaction_value: 6666.67,
              total_items_sold: 450,
            },
            top_products: 'not an array',
            daily_trend: [],
            outlet_summary: [],
          },
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 10,
      };

      await expect(getDashboardData(params)).rejects.toThrow(/Data format error/);
      await expect(getDashboardData(params)).rejects.toThrow(/top_products/);
    });

    it('should reject response with invalid nested items', async () => {
      const mockResponse = {
        data: {
          data: {
            summary: {
              total_revenue: 1000000,
              total_transactions: 150,
              average_transaction_value: 6666.67,
              total_items_sold: 450,
            },
            top_products: [
              {
                product_id: 'prod-123',
                product_name: 'Product A',
                quantity_sold: 'invalid', // Should be number
                revenue: 500000,
              },
            ],
            daily_trend: [],
            outlet_summary: [],
          },
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 10,
      };

      await expect(getDashboardData(params)).rejects.toThrow(/Data format error/);
      await expect(getDashboardData(params)).rejects.toThrow(/quantity_sold/);
    });
  });

  describe('Error Message Format', () => {
    it('should wrap validation errors with "Data format error" prefix', async () => {
      const mockResponse = {
        data: {
          data: {
            total_revenue: 'invalid',
            total_transactions: 150,
            average_transaction_value: 6666.67,
            total_items_sold: 450,
            date_from: '2024-01-01',
            date_to: '2024-01-31',
          },
        },
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      try {
        await getSalesSummary(params);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/^Data format error:/);
      }
    });
  });
});
