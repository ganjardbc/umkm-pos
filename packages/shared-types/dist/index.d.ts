export type HealthStatus = 'ok' | 'degraded';
export interface ServiceHealth {
    service: 'web' | 'api';
    status: HealthStatus;
}
export type { ApiResponse, PaginationMeta } from './common/pagination';
export type { AuthMerchant, AuthUser } from './auth/auth.types';
export type { UserSummary } from './users/user.types';
export type { ProductSummary } from './products/product.types';
