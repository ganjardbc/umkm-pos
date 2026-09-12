# Requirements: GAN-135 Add search support to Transactions list

## Status: PLAN

## Overview
Currently, the transactions list page in the web app (`apps/web/src/modules/transaction/pages/index.vue`) contains a search input stub (`search()`) that only prints to `console.log` without fetching or filtering data. On the backend, `TransactionsService.findAll()` and `FindAllTransactionsDto` (`apps/api`) do not accept or handle a `search` parameter.

This task implements end-to-end search functionality for the Transactions list, enabling cashiers and outlet admins to search and filter transactions by transaction ID and customer name snapshot.

## User Persona
- **Cashiers & Outlet Admins:** Reviewing transaction history on `/transaction` for daily/weekly reconciliation or looking up specific orders/customer purchases.

## Scope

### In Scope
1. **Backend (`apps/api`)**:
   - Add optional `search` string field to `FindAllTransactionsDto`.
   - Update `TransactionsController.findAll` to pass `search` to `TransactionsService.findAll`.
   - Update `TransactionsService.findAll` to apply `OR` filtering in Prisma `where` clause for `id` and `customer_name_snapshot` using case-insensitive/partial contains.
   - Maintain strict tenant/outlet scoping (`merchant_id` via JWT and allowed `outlet_id`s).

2. **Frontend (`apps/web`)**:
   - Update `apps/web/src/modules/transaction/pages/index.vue` to include `search` in the payload passed to `getListTransaction()`.
   - Implement debounce (300ms) on `search()` input to prevent request storms.
   - Reset pagination to page 1 whenever a search query is submitted or changed.
   - Ensure compatibility with existing filters (`is_cancelled`, `order_status`).

### Out of Scope
- Full-text / Elasticsearch or fuzzy typo-tolerant search.
- Cross-merchant or cross-module universal search.
- Global changes to `PaginationDto`.
- Automated test framework overhaul.

## Functional Requirements
1. **API Query Support**: `GET /api/v1/transactions?search={keyword}` must filter returned records where `id` contains `{keyword}` OR `customer_name_snapshot` contains `{keyword}`.
2. **Filter Integration**: Search must work cohesively with existing query parameters: `outlet_id`, `is_cancelled`, `order_status`, `order_source`, `table_id`, and pagination (`page`, `limit`).
3. **Pagination Calculation**: `meta.total`, `meta.page`, and `meta.totalPages` returned by backend must reflect the filtered count.
4. **Frontend Search Trigger**: Typing in `UiSearch` on `/transaction` must trigger a debounced fetch (`300ms`) with `page = 1`.
5. **Empty Search Handling**: Clearing the search input must re-fetch all transactions (respecting other active filters) with `page = 1`.

## Non-Functional Requirements
- **Security & Multi-Tenancy**: Scoping by `merchant_id` and outlet access must remain strictly enforced; search keyword must never bypass outlet authorization boundaries.
- **Performance**: Debounce user keystrokes to minimize backend load.

## Acceptance Criteria
- [ ] Passing `?search=TRX-123` or `?search=Budi` to `GET /api/v1/transactions` filters records matching `id` or `customer_name_snapshot`.
- [ ] Total count (`meta.total`) and pagination correctly update based on search matches.
- [ ] Existing filters (`is_cancelled`, `order_status`) continue to function alongside `search`.
- [ ] Typing in `UiSearch` on the transactions page debounces and updates the transaction card grid.
- [ ] Clearing the search bar restores full listing without full page refresh.
- [ ] Page resets to page 1 on new search keyword.
