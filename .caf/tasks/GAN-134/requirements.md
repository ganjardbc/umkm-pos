# Requirements: GAN-134

## Status: PLAN

## Overview
Fix the cashier product picker search in `apps/web/src/modules/transaction/components/Product.vue`. The current search function is a stub logging to console (`console.log(form.value)`), and `fetchProduct()` does not pass `form.value.search` in the request payload to `getListProduct()`.

## Problem Statement
In the POS cashier screen (`/cashier`), when a cashier types in the product search box, nothing happens. The product grid is not filtered because:
1. `search()` in `Product.vue` is a stub function logging to console without invoking `fetchProduct()`.
2. `fetchProduct()` in `Product.vue` does not pass `search` in the payload object.
3. The backend (`GET /api/v1/products`) already supports the `search` query param (`name: { contains: search }`), so this is entirely a frontend issue.

## Target User
Cashiers operating the POS screen (`/cashier`) who need to quickly search and filter products by name while serving customers.

## Scope of Work
1. **Update `fetchProduct()` in `Product.vue`**:
   - Include `...(form.value.search && { search: form.value.search })` in the request payload passed to `getListProduct()`.
2. **Implement Debounced `search()` in `Product.vue`**:
   - Verify `UiSearch.vue` has no built-in debounce (confirmed: plain input wrapper).
   - Implement `searchDebounceTimer` with 300ms debounce matching the reference pattern in `apps/web/src/modules/product-lists/pages/index.vue:366-373`.
   - On debounce trigger, reset `pagination.value.page` to 1 and call `fetchProduct()`.
3. **Keep Category Filter & Pagination Intact**:
   - Ensure combining category selection and search query continues to work seamlessly.

## Out of Scope
- Backend changes (endpoint already supports `search`).
- Product list page changes (already functioning correctly).
- Adding automated unit/e2e test framework to `Product.vue`.

## Acceptance Criteria
- [ ] Typing a query into `UiSearch` in the cashier product picker triggers a debounced (300ms) call to `fetchProduct()`.
- [ ] The API payload includes `search: form.value.search` when a search query is present.
- [ ] Pagination resets to page 1 upon searching.
- [ ] Product grid updates to display filtered search results or empty state when no products match.
- [ ] TypeScript check and build succeed without errors.
