# QA Report: GAN-122 — Convert Merchants List to Card View (Superadmin)

Status: SUCCESS

## Summary of Verification
We performed a thorough code review and automated build verification for ticket GAN-122. All acceptance criteria and task checklist items have been met.

## Acceptance Criteria Validation

### 1. Responsive Card Grid Layout
- **Status:** PASS
- **Details:** PrimeVue `<DataTable>` component was removed completely. Merchants are rendered in a responsive grid (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3`) utilizing `<UiCard>` components.

### 2. Merchant Card Content
- **Status:** PASS
- **Details:**
  - Merchant logo is displayed with fallback placeholder icon (`<i class="pi pi-image" />`) when logo is missing.
  - Merchant name is displayed with clean truncation handling.
  - Item number `#...` is rendered using `getNoTable(index, pagination.page, pagination.rows)`.
  - Created date is formatted using `formatDateTime(merchant.created_at)`.

### 3. Action Buttons & RBAC
- **Status:** PASS
- **Details:**
  - "Add Merchant" header button is properly gated with `isCanCreate`.
  - Detail button (`pi-eye`) navigates to merchant detail route.
  - Edit button (`pi-pencil`) navigates to merchant edit route and is disabled if `!isCanUpdate`.
  - Delete button (`pi-trash`) triggers the confirmation dialog and is disabled if `!isCanDelete`.
  - RBAC helpers `CREATE`, `UPDATE`, and `DELETE` with `isHasPermission()` are preserved.

### 4. Loading & Empty States
- **Status:** PASS
- **Details:**
  - `<UiLoading>` is rendered when `loading` is true.
  - Empty state container with icon (`pi-inbox`) and message "Merchants are empty." is displayed when `merchants.length === 0` and not loading.

### 5. Search & Pagination Controls
- **Status:** PASS
- **Details:**
  - `<UiSearch>` input with 300ms debounce correctly passes search query and resets page to 1.
  - `<UiPagination>` component is wired to pagination state and handles page change events seamlessly.

## Automated Verification
- `npm --prefix apps/web run build` (`vue-tsc -b && vite build`): PASSED with 0 TypeScript/template errors.
