# Merchants Module

Lets a tenant view and edit **their own** merchant. Opened from the "Merchant" item in the profile popover (`UiSidebarProfile`).

| Route | Page | Permission |
|---|---|---|
| `/merchants` | `pages/detail.vue` | `merchants.read` |
| `/merchants/edit` | `pages/edit.vue` | `merchants.update` |

The merchant id comes from the logged-in session (`getMerchant()`), not the URL. The API (`GET`/`PATCH /api/v1/merchants/:id`) rejects any merchant other than the caller's own.

Listing, creating, and deleting merchants lives in `apps/admin`.
