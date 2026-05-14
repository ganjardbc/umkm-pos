import type { ApiResponse as SharedApiResponse, PaginationMeta } from '@umkm-pos/shared-types';

/**
 * Standard API Response Interface
 * All API responses should follow this format
 */
export type ApiResponse<T = unknown> = SharedApiResponse<T>;

/**
 * Paginated Response Interface
 */
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

/**
 * Error Response Interface
 */
export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: unknown[];
}
