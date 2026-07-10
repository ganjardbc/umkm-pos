import { SetMetadata } from '@nestjs/common';

export const SCOPE_BY_OUTLET_KEY = 'scopeByOutlet';

/**
 * Decorator to validate outlet ownership via ScopeByOutletGuard.
 * @param fieldPath dot-notation path to outlet_id in request: 'body.outlet_id' | 'params.outlet_id' | 'query.outlet_id'
 */
export const ScopeByOutlet = (fieldPath: string) =>
  SetMetadata(SCOPE_BY_OUTLET_KEY, fieldPath);
