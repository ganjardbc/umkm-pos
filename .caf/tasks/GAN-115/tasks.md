## Ticket: GAN-115 — Convert Users list to card view

## Agent Order
1. **Frontend** — single file edit
2. **QA / Reviewer** — verify output

---

## Frontend Tasks

- [ ] In `apps/web/src/modules/user/pages/index.vue`, remove the `<DataTable>` block (lines 21–104 in the current file: the outer `<UiCard class="p-0! gap-0! overflow-hidden!">` wrapper plus all `<DataTable>` + `<Column>` elements).
- [ ] Add `UiLoading` import to `<script setup>`: `import UiLoading from '@/components/UiLoading.vue';`
- [ ] Replace the removed block with the following structure (keep `<UiPagination>` in place):

  ```html
  <!-- Loading state -->
  <UiLoading v-if="loading" message="Loading users..." />

  <!-- Empty state -->
  <div
    v-else-if="users.length === 0"
    class="flex flex-col items-center justify-center py-16 text-gray-400"
  >
    <i class="pi pi-users mb-3 text-4xl" />
    <p class="text-sm">Users are empty.</p>
  </div>

  <!-- Card grid -->
  <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
    <UiCard
      v-for="user in users"
      :key="user.id"
      class="relative overflow-hidden"
    >
      <!-- Header: avatar + name + status tag -->
      <div class="flex items-center gap-3">
        <img
          v-if="user.avatar"
          :src="user.avatar"
          alt=""
          class="w-10 h-10 rounded-full object-cover shrink-0"
        />
        <div
          v-else
          class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
        >
          <i class="pi pi-user text-sm text-gray-400" />
        </div>
        <p class="flex-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
          {{ user.name }}
        </p>
        <Tag
          :value="user.is_active ? 'Active' : 'Inactive'"
          :severity="user.is_active ? 'success' : 'danger'"
          class="capitalize text-xs! shrink-0"
        />
      </div>

      <Divider class="my-0!" />

      <!-- Metadata -->
      <div class="grid grid-cols-2 gap-y-2 text-xs">
        <span class="text-slate-400">Email</span>
        <span class="text-right text-slate-700 dark:text-slate-300 truncate">{{ user.email }}</span>

        <span class="text-slate-400">Merchant</span>
        <span class="text-right text-slate-700 dark:text-slate-300">{{ user.merchants?.name }}</span>

        <span class="text-slate-400">Created At</span>
        <span class="text-right text-slate-700 dark:text-slate-300">{{ formatDateTime(user.created_at) }}</span>
      </div>

      <Divider class="my-0!" />

      <!-- Actions -->
      <div class="flex gap-2 justify-end">
        <Button
          severity="secondary"
          variant="outlined"
          icon="pi pi-eye"
          size="small"
          @click="onDetailUser(user)"
        />
        <Button
          severity="secondary"
          variant="outlined"
          icon="pi pi-pencil"
          size="small"
          :disabled="!isCanUpdate"
          @click="onEditUser(user)"
        />
        <Button
          severity="secondary"
          variant="outlined"
          icon="pi pi-trash"
          size="small"
          :disabled="!isCanDelete || !user.is_active"
          @click="onDeleteUser(user)"
        />
      </div>
    </UiCard>
  </div>

  <!-- Pagination (unchanged) -->
  <UiPagination
    v-model="pagination"
    class="px-0!"
    @page="onPageChange"
  />
  ```

- [ ] Verify no `<DataTable>` or `<Column>` tags remain in the file after the edit.
- [ ] Verify the `getNoTable` import can be removed if it is no longer used (check — the card grid does not use row numbering, so remove unused import to keep the file clean).
- [ ] Confirm existing script logic is fully preserved: `fetchUser`, `onPageChange`, `onAddUser`, `onDetailUser`, `onEditUser`, `onDeleteUser`, `deleteUser`, `showConfirm`, `search`, `onMounted`.

---

## QA / Reviewer Tasks

- [ ] Confirm zero `<DataTable>` occurrences in `apps/web/src/modules/user/pages/index.vue`.
- [ ] Confirm grid layout classes are present: `grid gap-4 lg:grid-cols-2 xl:grid-cols-3`.
- [ ] Confirm `UiLoading` loading state is wired to `v-if="loading"`.
- [ ] Confirm empty state renders when `users.length === 0`.
- [ ] Confirm all three action buttons (view/edit/delete) are present with correct RBAC `:disabled` bindings.
- [ ] Confirm `UiPagination` binding (`v-model="pagination"`, `@page="onPageChange"`) is intact.
- [ ] Confirm `UiLoading` is imported in `<script setup>`.
- [ ] Confirm no unused imports remain (e.g. `getNoTable` if not referenced elsewhere).
