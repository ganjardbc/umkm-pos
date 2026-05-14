/**
 * Standard API Response Interface
 * All API responses should follow this format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

/**
 * Paginated Response Interface
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Error Response Interface
 */
export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: any[];
}
