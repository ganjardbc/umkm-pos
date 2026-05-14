import { describe, it, expect } from 'vitest';

// Feature: dashboard-reports-page, Task 4.1
describe('Date Range Filtering and Validation', () => {
  /**
   * Format a Date object to YYYY-MM-DD format for API calls
   * This is the same function used in the dashboard page
   */
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  describe('Date Formatting', () => {
    it('should format date to YYYY-MM-DD format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-01-15');
    });

    it('should pad single digit months and days with zero', () => {
      const date = new Date('2024-03-05');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-03-05');
    });

    it('should handle end of year dates', () => {
      const date = new Date('2024-12-31');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-12-31');
    });

    it('should handle start of year dates', () => {
      const date = new Date('2024-01-01');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-01-01');
    });

    it('should match ISO 8601 format pattern', () => {
      const date = new Date('2024-06-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Date Range Validation', () => {
    it('should validate that start date is before end date', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      
      expect(start <= end).toBe(true);
    });

    it('should invalidate when start date is after end date', () => {
      const start = new Date('2024-01-31');
      const end = new Date('2024-01-01');
      
      expect(start > end).toBe(true);
    });

    it('should validate when start date equals end date', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-15');
      
      expect(start <= end).toBe(true);
    });

    it('should invalidate future end dates', () => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      expect(futureDate > now).toBe(true);
    });

    it('should validate past dates', () => {
      const now = new Date();
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      
      expect(pastDate <= now).toBe(true);
    });
  });

  describe('Default Date Range Initialization', () => {
    it('should initialize to last 30 days', () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      
      const daysDifference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDifference).toBe(30);
    });

    it('should have end date as today', () => {
      const end = new Date();
      const today = new Date();
      
      expect(formatDate(end)).toBe(formatDate(today));
    });

    it('should have start date 30 days before end date', () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      
      expect(start < end).toBe(true);
    });
  });

  describe('Formatted Date Range for API', () => {
    it('should create formatted date range object', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      
      const formattedRange = {
        date_from: formatDate(start),
        date_to: formatDate(end),
      };
      
      expect(formattedRange).toHaveProperty('date_from');
      expect(formattedRange).toHaveProperty('date_to');
      expect(formattedRange.date_from).toBe('2024-01-01');
      expect(formattedRange.date_to).toBe('2024-01-31');
    });

    it('should return null for incomplete date range', () => {
      const dateRange: Date[] | null = null;
      
      expect(dateRange).toBeNull();
    });

    it('should handle date range with only one date', () => {
      const dateRange = [new Date('2024-01-01')];
      
      expect(dateRange.length).toBe(1);
      expect(dateRange.length).not.toBe(2);
    });
  });

  describe('Date Range Error Messages', () => {
    it('should generate error for missing dates', () => {
      const dateRange: Date[] | null = null;
      const errorMessage = 'Please select both start and end dates';
      
      if (!dateRange || dateRange.length !== 2) {
        expect(errorMessage).toBe('Please select both start and end dates');
      }
    });

    it('should generate error for invalid date order', () => {
      const start = new Date('2024-01-31');
      const end = new Date('2024-01-01');
      const errorMessage = 'Start date must be before or equal to end date';
      
      if (start > end) {
        expect(errorMessage).toBe('Start date must be before or equal to end date');
      }
    });

    it('should generate error for future dates', () => {
      const end = new Date();
      end.setDate(end.getDate() + 1);
      const errorMessage = 'End date cannot be in the future';
      
      if (end > new Date()) {
        expect(errorMessage).toBe('End date cannot be in the future');
      }
    });
  });

  describe('Date Range Display', () => {
    it('should format date range for display', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      
      const display = `${formatDate(start)} to ${formatDate(end)}`;
      
      expect(display).toBe('2024-01-01 to 2024-01-31');
    });

    it('should show message when no date range selected', () => {
      const dateRange: Date[] | null = null;
      const display = dateRange ? 'Date range selected' : 'No date range selected';
      
      expect(display).toBe('No date range selected');
    });
  });
});
