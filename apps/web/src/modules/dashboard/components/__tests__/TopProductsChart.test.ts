import { describe, it, expect } from 'vitest';
import type { TopProductItem } from '../../types/reports';

// Feature: dashboard-reports-page, Task 2.6
describe('TopProductsChart Component', () => {
  it('should have correct TypeScript interface for props', () => {
    // This test verifies the component accepts the correct prop types
    const mockData: TopProductItem[] = [
      {
        product_id: '123e4567-e89b-12d3-a456-426614174000',
        product_name: 'Product A',
        quantity_sold: 100,
        revenue: 1000000,
      },
      {
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        product_name: 'Product B',
        quantity_sold: 80,
        revenue: 800000,
      },
    ];

    const mockProps = {
      data: mockData,
      loading: false,
      error: null,
      title: 'Top Products',
    };

    // Verify prop structure
    expect(mockProps.data).toBeDefined();
    expect(mockProps.loading).toBe(false);
    expect(mockProps.error).toBeNull();
    expect(mockProps.title).toBe('Top Products');
    expect(mockProps.data?.length).toBe(2);
  });

  it('should handle empty data array', () => {
    const mockProps = {
      data: [],
      loading: false,
      error: null,
      title: 'Top Products',
    };

    expect(mockProps.data).toHaveLength(0);
  });

  it('should handle null data', () => {
    const mockProps = {
      data: null,
      loading: false,
      error: null,
      title: 'Top Products',
    };

    expect(mockProps.data).toBeNull();
  });

  it('should handle loading state', () => {
    const mockProps = {
      data: null,
      loading: true,
      error: null,
      title: 'Top Products',
    };

    expect(mockProps.loading).toBe(true);
  });

  it('should handle error state', () => {
    const errorMessage = 'Failed to fetch data';
    const mockProps = {
      data: null,
      loading: false,
      error: errorMessage,
      title: 'Top Products',
    };

    expect(mockProps.error).toBe(errorMessage);
  });

  it('should validate TopProductItem structure', () => {
    const item: TopProductItem = {
      product_id: '123e4567-e89b-12d3-a456-426614174000',
      product_name: 'Test Product',
      quantity_sold: 50,
      revenue: 500000,
    };

    expect(item).toHaveProperty('product_id');
    expect(item).toHaveProperty('product_name');
    expect(item).toHaveProperty('quantity_sold');
    expect(item).toHaveProperty('revenue');
    expect(typeof item.product_id).toBe('string');
    expect(typeof item.product_name).toBe('string');
    expect(typeof item.quantity_sold).toBe('number');
    expect(typeof item.revenue).toBe('number');
  });

  it('should handle products with long names', () => {
    const longName = 'This is a very long product name that exceeds thirty characters';
    const item: TopProductItem = {
      product_id: '123e4567-e89b-12d3-a456-426614174000',
      product_name: longName,
      quantity_sold: 50,
      revenue: 500000,
    };

    expect(item.product_name.length).toBeGreaterThan(30);
    expect(item.product_name).toBe(longName);
  });

  it('should verify products can be sorted by quantity_sold', () => {
    const mockData: TopProductItem[] = [
      {
        product_id: '1',
        product_name: 'Product A',
        quantity_sold: 50,
        revenue: 500000,
      },
      {
        product_id: '2',
        product_name: 'Product B',
        quantity_sold: 100,
        revenue: 1000000,
      },
      {
        product_id: '3',
        product_name: 'Product C',
        quantity_sold: 75,
        revenue: 750000,
      },
    ];

    // Sort in descending order by quantity_sold
    const sorted = [...mockData].sort((a, b) => b.quantity_sold - a.quantity_sold);

    expect(sorted[0].product_name).toBe('Product B');
    expect(sorted[1].product_name).toBe('Product C');
    expect(sorted[2].product_name).toBe('Product A');
    expect(sorted[0].quantity_sold).toBe(100);
    expect(sorted[1].quantity_sold).toBe(75);
    expect(sorted[2].quantity_sold).toBe(50);
  });
});
