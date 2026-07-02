# ADR-003: Merchant Access Control via Admin-Slug Identity

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Engineering team  
**Source:** `docs/decisions/_archive-kiro-reports/MERCHANT_ACCESS_CONTROL.md`

---

## Context

The `/merchants` resource is unique: unlike products or transactions, which are owned by a merchant and scoped to it, the `merchants` table itself is what defines the tenant boundary. This creates a bootstrapping problem for access control:

- Regular users should only see and operate on their own merchant.
- A platform-level admin must be able to manage all merchants (create, list, update, delete).

Options considered:

| Option | Approach | Risk |
|---|---|---|
| A | Separate admin-only JWT issuer / admin flag in the token | Requires changes to auth service and token schema |
| B | Dedicated `is_super_admin` column on `users` table | Schema change; adds a special-case that bypasses the RBAC model |
| C | Designate a reserved merchant slug (`merchant-admin`); users belonging to it are platform admins | No schema change; works within the existing tenant model |

---

## Decision

**Option C.** Platform admin identity is determined by the user's `merchant_id` resolving to the merchant with slug `merchant-admin`. This check is performed inside `MerchantsService`, not in guards or middleware.

Users are classified as:

| Type | Condition | Capabilities |
|---|---|---|
| **Admin** | `currentUser.merchantId` → merchant with `slug = 'merchant-admin'` | Full CRUD on all merchants |
| **Regular** | All other authenticated users | Read/update own merchant only |

The slug constant lives in `merchants.service.ts`:

```ts
const ADMIN_MERCHANT_SLUG = 'merchant-admin';
```

---

## Consequences

### Positive

- No new columns, no schema migration required.
- Admin identity is still derived from the auth token (JWT `merchant_id`) — not from client input — so it inherits the same tamper-proof guarantee as ADR-001.
- Works alongside, not instead of, the existing `@RequirePermission` RBAC system.

### Negative

- Platform admin logic is encoded as a magic slug constant. If the `merchant-admin` tenant is accidentally renamed or deleted, admin access breaks silently.
- The `isAdminUser()` check requires a DB lookup (`SELECT slug FROM merchants WHERE id = ?`) on every admin-path operation.
- Cannot easily grant platform-admin access to users in non-`merchant-admin` merchants without a code change.

### If Violated

A regular user who can read or mutate another merchant's data via `/merchants/:id` is a critical tenant-isolation breach. Severity: 🔴.

---

## Implementation

```ts
// merchants.service.ts

private readonly ADMIN_MERCHANT_SLUG = 'merchant-admin';

private async isAdminUser(merchantId: string): Promise<boolean> {
  const merchant = await this.prisma.merchants.findUnique({
    where: { id: merchantId },
    select: { slug: true },
  });
  return merchant?.slug === this.ADMIN_MERCHANT_SLUG;
}

private async validateMerchantAccess(currentMerchantId: string, targetMerchantId: string) {
  const isAdmin = await this.isAdminUser(currentMerchantId);
  if (!isAdmin && currentMerchantId !== targetMerchantId) {
    throw new ForbiddenException('You do not have access to this merchant');
  }
}

async findAll(currentUser: AuthUser) {
  const isAdmin = await this.isAdminUser(currentUser.merchantId);
  if (isAdmin) {
    return this.prisma.merchants.findMany();
  }
  return this.prisma.merchants.findMany({
    where: { id: currentUser.merchantId },
  });
}
```

---

## Related Rules

- `AGENTS.md` → "Multi-Tenant Rules", "Security Rules"
- ADR-001 — Establishes that `merchant_id` is always derived from the JWT, never from client input
- ADR-002 — DB conventions (`slug` column, UUID primary keys) used in this lookup
