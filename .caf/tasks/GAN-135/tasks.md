# Tasks: GAN-135 Add search support to Transactions list

## Order of Execution
1. Backend Agent (`apps/api`)
2. Frontend Agent (`apps/web`)

---

## Backend Tasks
- [x] (apps/api) Add `@ApiPropertyOptional()`, `@IsOptional()`, `@IsString()` `search?: string` field to `apps/api/src/transactions/dto/find-all-transactions.dto.ts`.
- [x] (apps/api) Update `TransactionsService.findAll()` in `apps/api/src/transactions/transactions.service.ts` to accept `search?: string` (or query object) and add Prisma `OR` condition matching `id` contains `search` or `customer_name_snapshot` contains `search`.
- [x] (apps/api) Update `TransactionsController.findAll()` in `apps/api/src/transactions/transactions.controller.ts` to pass `query.search` to `transactionsService.findAll()`.
- [x] (apps/api) Verify API changes by checking DTO validation, endpoint response format, and multi-tenant scoping.

## Frontend Tasks
- [x] (apps/web) Update `fetchTransaction()` in `apps/web/src/modules/transaction/pages/index.vue` to include `search: form.value.search ? form.value.search.trim() : undefined` in the query payload sent to `getListTransaction()`.
- [x] (apps/web) Replace stub `search()` method in `apps/web/src/modules/transaction/pages/index.vue` with a debounced handler (300ms timeout) that sets `pagination.value.page = 1` and calls `fetchTransaction()`.
- [x] (apps/web) Ensure search input change/clearing properly resets pagination to page 1 and fetches updated list.
- [x] (apps/web) Verify interaction between search input, status filters (`listOfCancelFilters`, `orderStatusFilters`), and pagination.
