# Requirements: GAN-125

## Ticket
- **ID:** GAN-125
- **Title:** Wording ID — Produk & Stok/Inventori (apps/web)
- **Status:** PLAN

## Summary
Standardize all user-facing interface text in `apps/web` for Product (`/product/**`, `product-lists`, `product-categories`) and Stock (`/stock`) modules to Bahasa Indonesia. Strings are hardcoded directly in Vue components/router definitions without adding an i18n library.

## Scope
1. **Modules Affected (apps/web):**
   - `apps/web/src/modules/product/` (main product container & tabs router/page)
   - `apps/web/src/modules/product-lists/` (product catalog CRUD, adjustments, modals)
   - `apps/web/src/modules/product-categories/` (category CRUD and details)
   - `apps/web/src/modules/stock/` (stock movement history & logs)

2. **Elements to Translate per Page / Component:**
   - Page and section titles, breadcrumbs, tab labels
   - Form field labels, placeholders, helper texts
   - Action buttons and button labels (e.g. "Add Product" -> "Tambah Produk", "Save" -> "Simpan", "Cancel" -> "Batal")
   - Toast messages (success, failure, info notifications)
   - Confirmation modal dialogs (headers, messages, confirm/cancel buttons)
   - Zod validation messages displayed to users
   - Empty state messages and loading state messages
   - Status badges and tags (e.g. "Active" -> "Aktif", "Inactive" -> "Tidak Aktif")
   - Stock adjustment reasons and types in `AdjustStockModal.vue`

3. **Glossary & Exception Rules:**
   - Terms that **remain in English** (do NOT translate): `invoice`, `barcode`, `QR code`, `export`, `import`, `upload`, `download`.
   - Technical symbols / currency formatting remain intact (`Rp`, formatters).
   - Backend API error response data/keys remain untouched.
   - Route paths, route names, variable names, and RBAC permission codes remain unchanged.

## Non-Functional & Quality Requirements
- No runtime errors or regressions in functionality.
- TypeScript check and build (`pnpm --filter umkm-pos-app build`) must pass cleanly.
- Consistent translation conventions across product, category, and stock modules.
