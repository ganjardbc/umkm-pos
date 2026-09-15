/**
 * Slug of the platform-operator merchant.
 * Users belonging to this merchant are platform admins and may access the
 * cross-merchant `/admin/*` endpoints.
 */
export const ADMIN_MERCHANT_SLUG = 'merchant-admin';

export const isPlatformAdminMerchant = (slug?: string | null): boolean =>
  slug === ADMIN_MERCHANT_SLUG;
