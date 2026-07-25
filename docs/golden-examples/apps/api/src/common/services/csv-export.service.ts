import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

@Injectable()
export class CsvExportService {
  /**
   * Convert array of objects to CSV string
   */
  convertToCsv(data: Record<string, any>[]): string {
    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.map((h) => this.escapeCsvValue(h)).join(','));

    // Data rows
    for (const row of data) {
      const values = headers.map((header) => this.escapeCsvValue(row[header]));
      csvRows.push(values.join(','));
    }

    return csvRows.join('\r\n');
  }

  /**
   * Set headers and send CSV data
   */
  exportToCsv(data: Record<string, any>[], filename: string, res: Response) {
    const csvContent = this.convertToCsv(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}.csv"`,
    );
    res.send(csvContent);
  }

  private escapeCsvValue(val: any): string {
    if (val === null || val === undefined) {
      return '';
    }
    const str = String(val);
    if (
      str.includes('"') ||
      str.includes(',') ||
      str.includes('\n') ||
      str.includes('\r')
    ) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
