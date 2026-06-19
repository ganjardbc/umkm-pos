# .ai/skills/pinia-store.md

## Purpose

Gunakan skill ini ketika membuat atau mengubah Pinia Store di `apps/web`.

---

# Store Responsibilities

Store hanya untuk:

```txt
Auth State
UI State (loading, filters, pagination)
Cached Module Data
```

---

# Split-File Pattern (Wajib)

Setiap store harus split ke 4 file:

```txt
stores/
  state.ts     — reactive state shape
  getters.ts   — computed values
  actions.ts   — mutations + async API calls
  index.ts     — compose & export store
```

---

# State Pattern

```ts
// state.ts
export interface ProductState {
  items: Product[];
  loading: boolean;
  currentItem: Product | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const state = (): ProductState => ({
  items: [],
  loading: false,
  currentItem: null,
  pagination: { page: 1, limit: 10, total: 0 },
});
```

---

# Getters Pattern

```ts
// getters.ts
import type { ProductState } from './state';

export const getters = {
  isEmpty: (state: ProductState) => state.items.length === 0,
  totalPages: (state: ProductState) =>
    Math.ceil(state.pagination.total / state.pagination.limit),
};
```

---

# Actions Pattern

```ts
// actions.ts
import { productService } from '../services/product.service';

export const actions = {
  async fetchAll(this: any) {
    this.loading = true;
    try {
      const res = await productService.getAll();
      this.items = res.data;
    } finally {
      this.loading = false;
    }
  },
};
```

---

# Index Composition

```ts
// index.ts
import { defineStore } from 'pinia';
import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';

export const useProductStore = defineStore('product', {
  state,
  getters,
  actions,
});
```

---

# Store Naming

```ts
useAuthStore
useProductStore
useTransactionStore
useShiftStore
useReportStore
useUserStore
useOutletStore
```

---

# Forbidden

Jangan di store:

```txt
Prisma Query
Complex Business Logic
DOM Manipulation
Direct API call tanpa service layer
```

---

# Output Checklist

Pastikan:

```txt
State typed (no any)
Getters typed
Actions typed
4 file split
Store name unique
```
