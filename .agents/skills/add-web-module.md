---
name: add-web-module
description: Scaffold a new Vue 3 frontend module following project conventions. Pass the module name (e.g. "invoices").
---

# Skill: Add Web Module

## Trigger

Use when asked to create/scaffold a new frontend module:
- "add web module invoices"
- "scaffold frontend module for X"
- "/add-web-module <name>"

## Module Name Convention

Input: any form
Normalize to: `kebab-case` for folder, `camelCase` for store/service names

Example: `store-tables` → folder `modules/store-tables/`

## Directory Structure

Create at `apps/web/src/modules/<module-name>/`:

```
<module-name>/
├── pages/
│   └── index.vue
├── components/           # (create if needed)
├── router/
│   └── index.ts
├── services/
│   ├── constants.ts
│   ├── rbac.ts
│   └── <module>.service.ts
├── stores/
│   ├── state.ts
│   ├── getters.ts
│   ├── actions.ts
│   └── index.ts
└── README.md
```

## File Templates

### `services/constants.ts`
```ts
export const PREFIX_ROUTE_PATH = '/<module-name>';
export const PREFIX_ROUTE_NAME = '<module-name>';
export const API_BASE = '/<module-name>';
```

### `services/rbac.ts`
```ts
export const READ = '<module-name>.read';
export const WRITE = '<module-name>.write';
```

### `services/<module>.service.ts`
```ts
import http from '@/plugins/axios';
import { API_BASE } from './constants';

export const get<Items> = (params?: Record<string, any>) =>
  http.get(API_BASE, { params });

export const get<Item> = (id: string) =>
  http.get(`${API_BASE}/${id}`);

export const create<Item> = (data: any) =>
  http.post(API_BASE, data);

export const update<Item> = (id: string, data: any) =>
  http.patch(`${API_BASE}/${id}`, data);

export const delete<Item> = (id: string) =>
  http.delete(`${API_BASE}/${id}`);
```

### `stores/state.ts`
```ts
export function state() {
  return {
    items: [] as any[],
    item: null as any,
    loading: false,
    error: '',
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      total_pages: 0,
    },
  };
}
```

### `stores/getters.ts`
```ts
import type { State } from './index';

export const getters = {
  items: (state: State) => state.items,
  item: (state: State) => state.item,
  loading: (state: State) => state.loading,
  pagination: (state: State) => state.pagination,
};
```

### `stores/actions.ts`
```ts
import * as Service from '../services/<module>.service';

export const actions = {
  async fetchItems(this: any, params?: Record<string, any>) {
    this.loading = true;
    try {
      const res = await Service.get<Items>(params);
      this.items = res.data.data;
      if (res.data.meta) this.pagination = res.data.meta;
    } catch (e: any) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  },
};
```

### `stores/index.ts`
```ts
import { defineStore } from 'pinia';
import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';

export type State = ReturnType<typeof state>;

export const use<Module>Store = defineStore('<module-name>', {
  state,
  getters,
  actions,
});
```

### `router/index.ts`
```ts
import { PREFIX_ROUTE_PATH, PREFIX_ROUTE_NAME } from '../services/constants';
import { READ } from '../services/rbac';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('../pages/index.vue'),
    meta: {
      title: '<Module Title>',
      layout: 'default',
      breadcrumbs: [
        { label: 'Home', route: '/landing', isActive: false },
        { label: '<Module Title>', route: PREFIX_ROUTE_PATH, isActive: true },
      ],
      permission: [READ],
    },
  },
];
```

### `pages/index.vue`
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { use<Module>Store } from '../stores';

const store = use<Module>Store();

onMounted(() => {
  store.fetchItems();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4"><Module Title></h1>
    <!-- content -->
  </div>
</template>
```

## Auto-Registration

Routes auto-load via `import.meta.glob` — no manual registration needed after creating `router/index.ts`.

## Checklist After Scaffolding

- [ ] All files created in correct paths
- [ ] `router/index.ts` has correct `meta.permission` using rbac constants
- [ ] Store files compose correctly in `index.ts`
- [ ] Service uses `@/plugins/axios` (not raw fetch)
- [ ] `pnpm typecheck` passes
- [ ] Route accessible in dev server
