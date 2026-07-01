# ADR-001: Multi-Tenant Data Scoping via Auth-Derived merchant_id

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Engineering team  

---

## Context

WisataPOS is a multi-tenant SaaS POS where each tenant is a **merchant**. Multiple merchants share the same database. Without explicit per-query scoping, any authenticated user could—accidentally or deliberately—read or mutate another merchant's data.

The question was: where does the tenant boundary come from, and how is it enforced?

Options considered:

| Option | Approach | Risk |
|---|---|---|
| A | Client sends `merchantId` in request body | Client-controlled — trivially bypassable |
| B | Derive `merchant_id` from JWT, enforce in service | Auth-controlled — tamper-proof |
| C | Row-level security at the DB level | Not supported in MySQL without third-party tooling |

---

## Decision

**Option B.** Every database query that reads or writes tenant-scoped data must scope by `merchant_id` extracted from the authenticated JWT via `@CurrentUser()`. The `merchant_id` is never accepted from request body, query params, or DTO fields.

---

## Consequences

### Positive

- Data isolation is enforced in one layer (service), not scattered across client code.
- Adding a new module correctly scoped is the path of least resistance — the auth object is always available.
- Audit trail (`created_by`, `updated_by`) records the authenticated user, not a client-supplied identity.

### Negative

- Every service method must explicitly extract and thread `merchantId` — it cannot be implicit.
- Super-admin operations (cross-tenant queries) require a separate mechanism (e.g., admin-scoped JWT claim or a dedicated service layer with elevated access).

### If Violated

A missing `merchant_id` scope in a DB query is a **critical security hole**: it allows any authenticated user to read or mutate any other merchant's data. Severity: 🔴.

---

## Implementation

### Correct — derive from auth user

```ts
// In any service method
async findAll(currentUser: AuthUser) {
  const merchantId = currentUser.merchantId;
  return this.prisma.products.findMany({
    where: { merchant_id: merchantId },
  });
}
```

### Wrong — accept from client

```ts
// FORBIDDEN — client controls the tenant boundary
async findAll(dto: FindProductsDto) {
  return this.prisma.products.findMany({
    where: { merchant_id: dto.merchantId }, // 🔴 bypass
  });
}
```

### DB schema side

All tenant-scoped tables carry:

```sql
merchant_id CHAR(36) NOT NULL
INDEX idx_<table>_merchant (merchant_id)
FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
```

---

## Related Rules

- `AGENTS.md` → "Multi-Tenant Rules" and "Forbidden Actions"
- `apps/api/CLAUDE.md` → "Multi-Tenant Enforcement"
- `docs/database/database-design.md` → "Multi-Tenant Scoping"
- ADR-002 — DB schema conventions that support this scoping (UUID FK, mandatory indexes)
