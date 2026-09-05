## Status: SUCCESS

## Agent: Frontend (apps/web)

## Changes Made

- **File modified:** `apps/web/src/modules/user/pages/index.vue`
  - Removed `<UiCard class="p-0! gap-0! overflow-hidden!">` wrapper and all `<DataTable>` + `<Column>` elements
  - Added `<UiLoading v-if="loading" message="Loading users..." />` loading state
  - Added empty state block with `pi pi-users` icon and "Users are empty." text
  - Added responsive card grid `<div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">` with `<UiCard>` per user
  - Each card includes: avatar/fallback, name, status `<Tag>`, `<Divider>`, metadata (Email/Merchant/Created At), `<Divider>`, action buttons (view/edit/delete) with RBAC guards
  - `<UiPagination>` with `v-model="pagination"` and `@page="onPageChange"` intact and `class="px-0!"` added
  - Removed `getNoTable` from imports (no longer used)
  - Added `import UiLoading from '@/components/UiLoading.vue';` to script
  - Fixed `users` ref type annotation from `ref([])` to `ref<any[]>([])` to resolve TypeScript `never[]` errors in card template

## Verify Checklist

- [x] Zero `<DataTable>` occurrences in file (grep confirmed)
- [x] Zero `<Column>` occurrences in file (grep confirmed)
- [x] Zero `getNoTable` references in file (grep confirmed)
- [x] Grid layout classes present: `grid gap-4 lg:grid-cols-2 xl:grid-cols-3`
- [x] `UiLoading` loading state wired to `v-if="loading"`
- [x] Empty state renders with `v-else-if="users.length === 0"`
- [x] All three action buttons (view/edit/delete) present with correct RBAC `:disabled` bindings
- [x] `UiPagination` binding `v-model="pagination"` and `@page="onPageChange"` intact
- [x] `UiLoading` imported in `<script setup>`
- [x] `getNoTable` import removed (unused)
- [x] All existing script logic preserved: `fetchUser`, `onPageChange`, `onAddUser`, `onDetailUser`, `onEditUser`, `onDeleteUser`, `deleteUser`, `showConfirm`, `search`, `onMounted`
- [x] `npm run build` — **BUILD SUCCEEDED** (vue-tsc type check passed + vite build completed with 834 modules transformed, no errors)

## Build Output Summary

Build ran successfully after installing dependencies in CI-equivalent manner:
- `vue-tsc -b` — TypeScript check passed (zero errors)
- `vite build` — 834 modules transformed, dist output generated successfully
- No TypeScript errors related to the card view changes
