# .ai/skills/vue-module.md

## Purpose

Gunakan skill ini ketika membuat module Vue di `apps/web`.

---

# Stack

```txt
Vue 3
Composition API (<script setup>)
Pinia (split-file stores)
Vue Router
PrimeVue
Tailwind CSS v4
```

---

# Module Structure

```txt
modules/module-name/
├── pages/
│   ├── index.vue
│   ├── create.vue
│   └── edit.vue
├── components/
│   ├── ModuleTable.vue
│   └── ModuleForm.vue
├── stores/
│   ├── state.ts
│   ├── getters.ts
│   ├── actions.ts
│   └── index.ts
├── services/
│   ├── module.service.ts
│   ├── constants.ts
│   └── rbac.ts
└── router/
    └── index.ts
```

---

# Component Rules

Gunakan:

```txt
Composition API
<script setup>
```

File naming: PascalCase untuk component, kebab-case untuk pages.

---

# Page Rules

Page hanya untuk:

```txt
Layout
Container
Page Composition
```

Jangan meletakkan complex business logic atau API call langsung di page.

---

# Service Rules

API call harus berada di:

```txt
services/module.service.ts
```

Gunakan axios dari `@/plugins/axios`.

Service tidak boleh memanipulasi UI.

---

# Store Rules

Split-file pattern wajib:

```ts
// state.ts
export const state = () => ({
  items: [],
  loading: false,
  pagination: { page: 1, limit: 10, total: 0 },
});

// getters.ts
export const getters = (state) => ({
  isEmpty: () => state.items.length === 0,
});

// actions.ts
export const actions = (state) => ({
  async fetchAll() { ... }
});

// index.ts
export const useModuleStore = defineStore('module', {
  state,
  getters,
  actions,
});
```

---

# Route Rules

Route berada di `router/index.ts`:

```ts
import { PREFIX_ROUTE_PATH, PREFIX_ROUTE_NAME } from '../services/constants';
import { READ } from '../services/rbac';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('../pages/index.vue'),
    meta: {
      title: 'Module Title',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        { label: 'Home', route: '/landing', isActive: false },
        { label: 'Module', route: PREFIX_ROUTE_PATH, isActive: true },
      ],
    },
  },
];
```

---

# Constants & RBAC Pattern

```ts
// constants.ts
export const PREFIX_ROUTE_PATH = '/products';
export const PREFIX_ROUTE_NAME = 'products';
export const API_PATH = '/products';

// rbac.ts
export const READ = 'products.read';
export const WRITE = 'products.write';
```

---

# UI Rules

Gunakan PrimeVue components + Tailwind.

Auth helpers dari `@/helpers/auth.ts`.

Alias `@` → `src` tersedia.

---

# Output Checklist

Pastikan:

```txt
Pages dibuat
Components dibuat
Store (split-file) dibuat
Service dibuat
constants.ts dan rbac.ts dibuat
Route dibuat dengan meta yang benar
```
