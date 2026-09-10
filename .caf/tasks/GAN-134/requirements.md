# Requirements: GAN-134 - Fix: Cashier product picker search does nothing (stub function)

## Status: PLAN

## Problem
In the cashier product picker (`apps/web/src/modules/transaction/components/Product.vue`), `UiSearch` is wired to a `search()` function that only executes `console.log(form.value)` without invoking `fetchProduct()`. As a result, typing in the search box does not filter the product grid during POS checkout. The backend API (`GET /api/v1/products`) already supports the `search` query parameter, so this is purely a frontend gap.

## Scope
- Modify `apps/web/src/modules/transaction/components/Product.vue`:
  - Include `search` in the query payload sent to `getListProduct` inside `fetchProduct()` when `form.value.search` is present: `...(form.value.search && { search: form.value.search })`.
  - Replace the `search()` stub with a debounced handler (300ms delay) that sets `pagination.value.page = 1` and calls `fetchProduct()`.
  - Confirm `UiSearch` `@input="search"` correctly triggers the search handler.
- Frontend-only change; no backend or shared package modifications required.

## Out of Scope
- Product list page (`apps/web/src/modules/product-lists/pages/index.vue`) which is already working correctly.
- Backend search logic / fuzzy search changes.
- Automated POS end-to-end test suite additions.

## Success Criteria
- Typing a search query into the cashier product search box triggers a debounced API request with the `search` parameter.
- Pagination resets to page 1 upon new search input.
- Filtered products render in the cashier product grid.
- No TypeScript or build errors in `apps/web`.
