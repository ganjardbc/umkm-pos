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

describe('API Service Parameter Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Limit Parameter Validation', () => {
    it('should accept valid limit values (1-50)', async () => {
      const mockResponse = { data: { data: [] } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 25,
      };

      await expect(getTopProducts(params)).resolves.toBeDefined();
      await expect(getDashboardData(params)).resolves.toBeDefined();
    });

    it('should accept limit at lower boundary (1)', async () => {
      const mockResponse = { data: { data: [] } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 1,
      };

      await expect(getTopProducts(params)).resolves.toBeDefined();
    });

    it('should accept limit at upper boundary (50)', async () => {
      const mockResponse = { data: { data: [] } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 50,
      };

      await expect(getTopProducts(params)).resolves.toBeDefined();
    });

    it('should reject limit below valid range (0)', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 0,
      };

      await expect(getTopProducts(params)).rejects.toThrow(
        'Limit parameter must be an integer between 1 and 50'
      );
    });

    it('should reject limit above valid range (51)', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 51,
      };

      await expect(getTopProducts(params)).rejects.toThrow(
        'Limit parameter must be an integer between 1 and 50'
      );
    });

    it('should reject negative limit values', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: -5,
      };

      await expect(getTopProducts(params)).rejects.toThrow(
        'Limit parameter must be an integer between 1 and 50'
      );
    });

    it('should reject non-integer limit values', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 25.5,
      };

      await expect(getTopProducts(params)).rejects.toThrow(
        'Limit parameter must be an integer between 1 and 50'
      );
    });

    it('should accept undefined limit (uses default)', async () => {
      const mockResponse = { data: { data: [] } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      await expect(getTopProducts(params)).resolves.toBeDefined();
    });
  });

  describe('outlet_id Parameter Validation', () => {
    it('should accept valid UUID format', async () => {
      const mockResponse = { data: { data: {} } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        outlet_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      await expect(getSalesSummary(params)).resolves.toBeDefined();
      await expect(getDailyReports(params)).resolves.toBeDefined();
      await expect(getOutletComparison(params)).resolves.toBeDefined();
    });

    it('should accept lowercase UUID', async () => {
      const mockResponse = { data: { data: {} } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        outlet_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      };

      await expect(getSalesSummary(params)).resolves.toBeDefined();
    });

    it('should accept uppercase UUID', async () => {
      const mockResponse = { data: { data: {} } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        outlet_id: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
      };

      await expect(getSalesSummary(params)).resolves.toBeDefined();
    });

    it('should accept undefined outlet_id', async () => {
      const mockResponse = { data: { data: {} } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      await expect(getSalesSummary(params)).resolves.toBeDefined();
    });

    it('should reject invalid UUID format (missing dashes)', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        outlet_id: '550e8400e29b41d4a716446655440000',
      };

      await expect(getSalesSummary(params)).rejects.toThrow(
        'outlet_id must be a valid UUID format'
      );
    });

    it('should reject invalid UUID format (wrong length)', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        outlet_id: '550e8400-e29b-41d4-a716',
      };

      await expect(getSalesSummary(params)).rejects.toThrow(
        'outlet_id must be a valid UUID format'
      );
    });

    it('should reject invalid UUID format (invalid characters)', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        outlet_id: '550e8400-e29b-41d4-a716-44665544000g',
      };

      await expect(getSalesSummary(params)).rejects.toThrow(
        'outlet_id must be a valid UUID format'
      );
    });

    it('should reject non-UUID strings', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        outlet_id: 'not-a-uuid',
      };

      await expect(getSalesSummary(params)).rejects.toThrow(
        'outlet_id must be a valid UUID format'
      );
    });

    it('should reject numeric outlet_id', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        outlet_id: '12345',
      };

      await expect(getSalesSummary(params)).rejects.toThrow(
        'outlet_id must be a valid UUID format'
      );
    });
  });

  describe('Combined Parameter Validation', () => {
    it('should validate both limit and outlet_id for getTopProducts', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 100, // Invalid
        outlet_id: '550e8400-e29b-41d4-a716-446655440000', // Valid
      };

      await expect(getTopProducts(params)).rejects.toThrow(
        'Limit parameter must be an integer between 1 and 50'
      );
    });

    it('should validate both limit and outlet_id for getDashboardData', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 25, // Valid
        outlet_id: 'invalid-uuid', // Invalid
      };

      await expect(getDashboardData(params)).rejects.toThrow(
        'outlet_id must be a valid UUID format'
      );
    });

    it('should accept valid limit and outlet_id together', async () => {
      const mockResponse = { data: { data: {} } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 25,
        outlet_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      await expect(getTopProducts(params)).resolves.toBeDefined();
      await expect(getDashboardData(params)).resolves.toBeDefined();
    });
  });

  describe('Validation Error Display', () => {
    it('should throw descriptive error for invalid limit', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        limit: 75,
      };

      try {
        await getTopProducts(params);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Limit parameter');
        expect((error as Error).message).toContain('1 and 50');
      }
    });

    it('should throw descriptive error for invalid outlet_id', async () => {
      const params = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        outlet_id: 'bad-id',
      };

      try {
        await getSalesSummary(params);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('outlet_id');
        expect((error as Error).message).toContain('UUID format');
      }
    });
  });
});
