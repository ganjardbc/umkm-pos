import { describe, it, expect } from 'vitest';
import {
  validateSalesSummaryData,
  validateDailyReportsData,
  validateTopProductsData,
  validateOutletComparisonData,
  validateDashboardData,
  DataValidationError,
} from '../validation';

describe('Data Validation Utilities', () => {
  describe('validateSalesSummaryData', () => {
    it('should accept valid sales summary data', () => {
      const validData = {
        total_revenue: 1000000,
        total_transactions: 150,
        average_transaction_value: 6666.67,
        total_items_sold: 450,
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      expect(() => validateSalesSummaryData(validData)).not.toThrow();
      const result = validateSalesSummaryData(validData);
      expect(result).toEqual(validData);
    });

    it('should reject null or undefined data', () => {
      expect(() => validateSalesSummaryData(null)).toThrow(DataValidationError);
      expect(() => validateSalesSummaryData(undefined)).toThrow(DataValidationError);
    });

    it('should reject data with missing numeric fields', () => {
      const invalidData = {
        total_revenue: 1000000,
        // missing total_transactions
        average_transaction_value: 6666.67,
        total_items_sold: 450,
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      expect(() => validateSalesSummaryData(invalidData)).toThrow(DataValidationError);
      expect(() => validateSalesSummaryData(invalidData)).toThrow(/total_transactions/);
    });

    it('should reject data with invalid numeric fields', () => {
      const invalidData = {
        total_revenue: 'not a number',
        total_transactions: 150,
        average_transaction_value: 6666.67,
        total_items_sold: 450,
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      expect(() => validateSalesSummaryData(invalidData)).toThrow(DataValidationError);
      expect(() => validateSalesSummaryData(invalidData)).toThrow(/total_revenue/);
    });

    it('should reject data with NaN or Infinity', () => {
      const invalidData = {
        total_revenue: NaN,
        total_transactions: 150,
        average_transaction_value: 6666.67,
        total_items_sold: 450,
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      expect(() => validateSalesSummaryData(invalidData)).toThrow(DataValidationError);
    });

    it('should reject data with invalid date format', () => {
      const invalidData = {
        total_revenue: 1000000,
        total_transactions: 150,
        average_transaction_value: 6666.67,
        total_items_sold: 450,
        date_from: '01/01/2024', // Wrong format
        date_to: '2024-01-31',
      };

      expect(() => validateSalesSummaryData(invalidData)).toThrow(DataValidationError);
      expect(() => validateSalesSummaryData(invalidData)).toThrow(/date_from/);
    });

    it('should reject data with missing date fields', () => {
      const invalidData = {
        total_revenue: 1000000,
        total_transactions: 150,
        average_transaction_value: 6666.67,
        total_items_sold: 450,
        date_from: '2024-01-01',
        // missing date_to
      };

      expect(() => validateSalesSummaryData(invalidData)).toThrow(DataValidationError);
    });
  });

  describe('validateDailyReportsData', () => {
    it('should accept valid daily reports data', () => {
      const validData = [
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
      ];

      expect(() => validateDailyReportsData(validData)).not.toThrow();
      const result = validateDailyReportsData(validData);
      expect(result).toEqual(validData);
    });

    it('should accept empty array', () => {
      expect(() => validateDailyReportsData([])).not.toThrow();
    });

    it('should reject non-array data', () => {
      expect(() => validateDailyReportsData(null)).toThrow(DataValidationError);
      expect(() => validateDailyReportsData({})).toThrow(DataValidationError);
      expect(() => validateDailyReportsData('not an array')).toThrow(DataValidationError);
    });

    it('should reject array with invalid items', () => {
      const invalidData = [
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
      ];

      expect(() => validateDailyReportsData(invalidData)).toThrow(DataValidationError);
      expect(() => validateDailyReportsData(invalidData)).toThrow(/index 1/);
    });

    it('should reject items with missing numeric fields', () => {
      const invalidData = [
        {
          date: '2024-01-01',
          revenue: 50000,
          // missing transactions
          items_sold: 75,
        },
      ];

      expect(() => validateDailyReportsData(invalidData)).toThrow(DataValidationError);
      expect(() => validateDailyReportsData(invalidData)).toThrow(/transactions/);
    });
  });

  describe('validateTopProductsData', () => {
    it('should accept valid top products data', () => {
      const validData = [
        {
          product_id: 'prod-123',
          product_name: 'Product A',
          quantity_sold: 100,
          revenue: 500000,
        },
        {
          product_id: 'prod-456',
          product_name: 'Product B',
          quantity_sold: 80,
          revenue: 400000,
        },
      ];

      expect(() => validateTopProductsData(validData)).not.toThrow();
      const result = validateTopProductsData(validData);
      expect(result).toEqual(validData);
    });

    it('should accept empty array', () => {
      expect(() => validateTopProductsData([])).not.toThrow();
    });

    it('should reject non-array data', () => {
      expect(() => validateTopProductsData(null)).toThrow(DataValidationError);
      expect(() => validateTopProductsData({})).toThrow(DataValidationError);
    });

    it('should reject items with missing string fields', () => {
      const invalidData = [
        {
          product_id: 'prod-123',
          // missing product_name
          quantity_sold: 100,
          revenue: 500000,
        },
      ];

      expect(() => validateTopProductsData(invalidData)).toThrow(DataValidationError);
      expect(() => validateTopProductsData(invalidData)).toThrow(/product_name/);
    });

    it('should reject items with empty string fields', () => {
      const invalidData = [
        {
          product_id: '',
          product_name: 'Product A',
          quantity_sold: 100,
          revenue: 500000,
        },
      ];

      expect(() => validateTopProductsData(invalidData)).toThrow(DataValidationError);
      expect(() => validateTopProductsData(invalidData)).toThrow(/product_id/);
    });

    it('should reject items with invalid numeric fields', () => {
      const invalidData = [
        {
          product_id: 'prod-123',
          product_name: 'Product A',
          quantity_sold: 'not a number',
          revenue: 500000,
        },
      ];

      expect(() => validateTopProductsData(invalidData)).toThrow(DataValidationError);
      expect(() => validateTopProductsData(invalidData)).toThrow(/quantity_sold/);
    });
  });

  describe('validateOutletComparisonData', () => {
    it('should accept valid outlet comparison data', () => {
      const validData = [
        {
          outlet_id: 'outlet-123',
          outlet_name: 'Outlet A',
          revenue: 1000000,
          transactions: 200,
          items_sold: 600,
        },
        {
          outlet_id: 'outlet-456',
          outlet_name: 'Outlet B',
          revenue: 800000,
          transactions: 150,
          items_sold: 450,
        },
      ];

      expect(() => validateOutletComparisonData(validData)).not.toThrow();
      const result = validateOutletComparisonData(validData);
      expect(result).toEqual(validData);
    });

    it('should accept empty array', () => {
      expect(() => validateOutletComparisonData([])).not.toThrow();
    });

    it('should reject non-array data', () => {
      expect(() => validateOutletComparisonData(null)).toThrow(DataValidationError);
    });

    it('should reject items with missing fields', () => {
      const invalidData = [
        {
          outlet_id: 'outlet-123',
          // missing outlet_name
          revenue: 1000000,
          transactions: 200,
          items_sold: 600,
        },
      ];

      expect(() => validateOutletComparisonData(invalidData)).toThrow(DataValidationError);
      expect(() => validateOutletComparisonData(invalidData)).toThrow(/outlet_name/);
    });
  });

  describe('validateDashboardData', () => {
    it('should accept valid dashboard data', () => {
      const validData = {
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
      };

      expect(() => validateDashboardData(validData)).not.toThrow();
      const result = validateDashboardData(validData);
      expect(result).toEqual(validData);
    });

    it('should reject null or undefined data', () => {
      expect(() => validateDashboardData(null)).toThrow(DataValidationError);
      expect(() => validateDashboardData(undefined)).toThrow(DataValidationError);
    });

    it('should reject data with missing summary section', () => {
      const invalidData = {
        // missing summary
        top_products: [],
        daily_trend: [],
        outlet_summary: [],
      };

      expect(() => validateDashboardData(invalidData)).toThrow(DataValidationError);
      expect(() => validateDashboardData(invalidData)).toThrow(/summary/);
    });

    it('should reject data with invalid summary fields', () => {
      const invalidData = {
        summary: {
          total_revenue: 'not a number',
          total_transactions: 150,
          average_transaction_value: 6666.67,
          total_items_sold: 450,
        },
        top_products: [],
        daily_trend: [],
        outlet_summary: [],
      };

      expect(() => validateDashboardData(invalidData)).toThrow(DataValidationError);
      expect(() => validateDashboardData(invalidData)).toThrow(/total_revenue/);
    });

    it('should reject data with non-array sections', () => {
      const invalidData = {
        summary: {
          total_revenue: 1000000,
          total_transactions: 150,
          average_transaction_value: 6666.67,
          total_items_sold: 450,
        },
        top_products: 'not an array',
        daily_trend: [],
        outlet_summary: [],
      };

      expect(() => validateDashboardData(invalidData)).toThrow(DataValidationError);
      expect(() => validateDashboardData(invalidData)).toThrow(/top_products/);
    });

    it('should reject data with invalid items in nested arrays', () => {
      const invalidData = {
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
            quantity_sold: 'invalid',
            revenue: 500000,
          },
        ],
        daily_trend: [],
        outlet_summary: [],
      };

      expect(() => validateDashboardData(invalidData)).toThrow(DataValidationError);
      expect(() => validateDashboardData(invalidData)).toThrow(/quantity_sold/);
    });

    it('should accept empty arrays for nested sections', () => {
      const validData = {
        summary: {
          total_revenue: 1000000,
          total_transactions: 150,
          average_transaction_value: 6666.67,
          total_items_sold: 450,
        },
        top_products: [],
        daily_trend: [],
        outlet_summary: [],
      };

      expect(() => validateDashboardData(validData)).not.toThrow();
    });
  });

  describe('DataValidationError', () => {
    it('should be an instance of Error', () => {
      const error = new DataValidationError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('DataValidationError');
      expect(error.message).toBe('Test error');
    });
  });
});
