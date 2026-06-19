# Layouts — WisataPOS

## Layout System

Layout ditentukan oleh route meta:

```ts
meta: {
  layout: 'default' | 'auth' | 'public'
}
```

---

## Default Layout (Dashboard)

Digunakan oleh: semua halaman dashboard (POS, produk, transaksi, laporan, dll)

Struktur:

```txt
┌─────────────────────────────────────┐
│  Header (top bar)                   │
│  - Logo/merchant name               │
│  - User avatar + dropdown           │
│  - Notifikasi                       │
├──────────┬──────────────────────────┤
│ Sidebar  │  Content Area            │
│ (nav)    │  - Breadcrumb            │
│          │  - Page content          │
│          │                          │
└──────────┴──────────────────────────┘
```

Sidebar navigasi:

```txt
Dashboard
POS Terminal
Transaksi
Produk
  └── Kategori
Stok
Shift
Laporan
Pengaturan
  └── Outlet
  └── User
  └── Role
  └── Permission
  └── Meja
```

---

## Auth Layout

Digunakan oleh: login page

Struktur:

```txt
┌─────────────────────────────────────┐
│                                     │
│         [Logo WisataPOS]            │
│                                     │
│    ┌─────────────────────────┐      │
│    │      Login Card         │      │
│    │                         │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

---

## Public Layout

Digunakan oleh: customer self-order page, landing

Struktur:

```txt
┌─────────────────────────────────────┐
│  [Outlet Logo + Name]               │
├─────────────────────────────────────┤
│                                     │
│  Content (menu, order form, dll)    │
│                                     │
└─────────────────────────────────────┘
```

Tidak ada sidebar, tidak ada authentication header.

---

## Layout Files

```txt
apps/web/src/layouts/
  DefaultLayout.vue   — dashboard layout
  AuthLayout.vue      — auth layout
  PublicLayout.vue    — public layout
```

---

## Route Meta

```ts
{
  path: '/products',
  name: 'products',
  component: () => import('../pages/index.vue'),
  meta: {
    title: 'Products',
    layout: 'default',       // 'default' | 'auth' | 'public'
    permission: ['products.read'],
    breadcrumbs: [
      { label: 'Home', route: '/landing', isActive: false },
      { label: 'Products', route: '/products', isActive: true },
    ],
  },
}
```
