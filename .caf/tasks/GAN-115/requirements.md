## Status: PLAN

## Ticket
GAN-115 — Convert Users list to card view

## Problem
`apps/web/src/modules/user/pages/index.vue` renders its list via PrimeVue `<DataTable>` with
`tableStyle="min-width: 50rem"`, which forces horizontal scroll on tablet and mobile viewports.
Other modules (transaction, notification) already use a responsive card grid, creating an
inconsistent UX across the back office.

## Goal
Replace the `<DataTable>` in the Users list page with a responsive card grid that matches the
pattern established in `apps/web/src/modules/transaction/pages/index.vue`. The rest of the page
(search bar, pagination, RBAC-gated actions, loading/empty states) must remain functionally
identical.

## Requirements

### Functional
1. Remove `<DataTable>` and all `<Column>` elements from `index.vue`.
2. Add a loading state using `<UiLoading>` (already available globally), triggered by the
   existing `loading` ref — matching the transaction page pattern.
3. Add an empty state (`v-else-if="users.length === 0"`) with `pi pi-users` icon and
   "Users are empty." text — matching the transaction page pattern.
4. Render a card grid (`v-else`) using `<UiCard>` per user, with the following card structure:
   - **Header row**: avatar (circular, `w-10 h-10`; fallback to `pi pi-user` icon in
     `bg-gray-100` circle), user name (truncated, `font-semibold`), and status `<Tag>`
     (`Active`/`Inactive`, `severity="success"`/`"danger"`).
   - `<Divider class="my-0!" />` separator.
   - **Metadata grid** (`grid grid-cols-2 gap-y-2 text-xs`): Email, Merchant, Created At.
   - `<Divider class="my-0!" />` separator.
   - **Footer row**: action buttons — view (`pi-eye`), edit (`pi-pencil`), delete
     (`pi-trash`) — matching current RBAC gating (`isCanUpdate`, `isCanDelete`,
     `!user.is_active` guard on delete).
5. Grid layout: `grid gap-4` (1 col mobile) → `lg:grid-cols-2` → `xl:grid-cols-3`.
6. `<UiPagination>` remains in place, unchanged.
7. Search bar and "Add User" button remain unchanged.
8. All existing script logic (fetch, pagination, actions, RBAC, search) remains unchanged.

### Non-functional
- No horizontal scroll at 375 px viewport (no fixed `min-width` on any element).
- No new shared component needed; card markup lives inline in `index.vue` (implementer's
  call — follow transaction module precedent).
- No changes to `<script setup>` logic other than adding `UiLoading` import.

## Data Fields on Each Card
| Field | Source | Notes |
|---|---|---|
| Avatar | `user.avatar` (URL) | Fallback: `pi pi-user` icon circle |
| Name | `user.name` | Truncated (`truncate`) |
| Status | `user.is_active` | `<Tag>` Active/Inactive |
| Email | `user.email` | Metadata row |
| Merchant | `user.merchants.name` | Metadata row |
| Created At | `user.created_at` | via `formatDateTime()` |

## RBAC Gating (unchanged)
| Action | Guard |
|---|---|
| View (eye) | always enabled |
| Edit (pencil) | `:disabled="!isCanUpdate"` |
| Delete (trash) | `:disabled="!isCanDelete \|\| !user.is_active"` |

## Out of Scope
- Any module other than `apps/web/src/modules/user/pages/index.vue`
- `create.vue`, `edit.vue`, `detail.vue`
- Backend API, pagination contract, or RBAC permission codes
- New shared `UiListCard` component

## Success Metric
- Zero `<DataTable>` occurrences remain in `apps/web/src/modules/user/pages/index.vue`
- Search / filter / pagination / actions remain functional
- No horizontal scroll at 375 px viewport

## References
- Design reference: `apps/web/src/modules/transaction/pages/index.vue`
- Components: `apps/web/src/components/UiCard.vue`, `UiPagination.vue`, `UiLoading.vue`
- RBAC constants: `apps/web/src/modules/user/services/rbac.ts`
