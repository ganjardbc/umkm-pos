export type HealthStatus = 'ok' | 'degraded';

export interface ServiceHealth {
  service: 'web' | 'api';
  status: HealthStatus;
}
