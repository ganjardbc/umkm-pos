export type HealthStatus = 'ok' | 'degraded';

export interface WebHealth {
  service: 'web' | 'api';
  status: HealthStatus;
}
