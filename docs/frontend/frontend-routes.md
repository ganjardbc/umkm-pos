# Frontend Routes — WisataPOS

## Route Convention

Routes auto-registered dari:

```ts
import.meta.glob('../modules/**/router/index.ts', { eager: true })
```

Setiap module memiliki `router/index.ts` sendiri.

---

## Route List

### Auth

```txt
/auth/login      — Login page
/auth/register   — Register (jika ada)
```

### Dashboard

```txt
/landing         — Dashboard home / overview
```

### POS Terminal

```txt
/pos             — POS cashier interface
```

### Transaksi

```txt
/transactions        — Transaction list
/transactions/:id    — Transaction detail
```

### Produk

```txt
/product                             — Product dashboard (contains products/categories tabs)
/product/product-lists               — Product list
/product/product-lists/create        — Create product
/product/product-lists/edit/:id      — Edit product
/product/product-lists/detail/:id    — Detail product

/product/product-categories          — Category list
/product/product-categories/create   — Create category
/product/product-categories/edit/:id — Edit category
/product/product-categories/detail/:id — Detail category
```

### Stok

```txt
/stock               — Stock overview / adjustment
/stock/logs          — Stock log history
```

### Shift

```txt
/shifts              — Shift list
/shifts/:id          — Shift detail
```

### Laporan

```txt
/reports             — Reports page
```

### Pengaturan

```txt
/settings            — Settings overview

/outlets             — Outlet list
/outlets/create      — Create outlet
/outlets/:id/edit    — Edit outlet

/users               — User list
/users/create        — Create user
/users/:id/edit      — Edit user

/roles               — Role list
/roles/create        — Create role
/roles/:id/edit      — Edit role (+ assign permissions)

/permissions         — Permission list (read-only)

/store-tables        — Table list
/store-tables/create — Create table
```

### Profil

```txt
/profile             — User profile
```

### Customer Self-Order

```txt
/catalog/:outletSlug       — Customer catalog (public)
/catalog/:outletSlug/order — Customer order page (public)
```

### Error Pages

```txt
/403    — Forbidden
/404    — Not found
```

---

## Route Meta Format

```ts
meta: {
  title: string;           // page title (di browser tab)
  layout: 'default' | 'auth' | 'public';
  permission: string[];    // permission codes yang diperlukan
  breadcrumbs: Array<{
    label: string;
    route: string;
    isActive: boolean;
  }>;
}
```

---

## Permission Guard

Permission guard injected secara global di:

```txt
src/core/global-routes.ts
```

Jika user tidak punya permission → redirect ke route name `403`.
