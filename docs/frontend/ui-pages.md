# UI Pages — WisataPOS

## Auth Pages

### Login

```txt
Route: /auth/login
Layout: auth
Components:
  - Email input
  - Password input
  - Login button
  - Error message
Actions:
  - POST /auth/login
  - Store token → localStorage
  - Redirect ke /landing
```

---

## Dashboard

### Home / Landing

```txt
Route: /landing
Layout: default
Components:
  - Stats cards (total sales hari ini, total transaksi, dll)
  - Chart penjualan (opsional)
  - Quick links (POS, Shift, dll)
Data: GET /reports/summary
```

---

## POS Terminal

### Cashier Interface

```txt
Route: /pos
Layout: default
Components:
  - Product grid (filter by category)
  - Cart panel (kanan)
  - Payment modal
  - Shift status check
Actions:
  - GET /products (load menu)
  - POST /transactions (commit order)
  - Shift open check sebelum order
```

---

## Transaksi

### Transaction List

```txt
Route: /transactions
Layout: default
Components:
  - Filter bar (date range, status, outlet)
  - DataTable dengan pagination
  - Status badge per row
Data: GET /transactions
```

### Transaction Detail

```txt
Route: /transactions/:id
Layout: default
Components:
  - Transaction info (tanggal, kasir, outlet, metode bayar)
  - Items table (nama, qty, harga snapshot, subtotal)
  - Total summary
  - Cancel button (jika masih bisa dibatalkan)
Data: GET /transactions/:id
```

---

## Produk

### Product List

```txt
Route: /products
Layout: default
Components:
  - Search + filter (category, status)
  - DataTable (nama, harga, stok, kategori, status)
  - Tombol tambah produk
Data: GET /products
```

### Create / Edit Product

```txt
Route: /products/create, /products/:id/edit
Layout: default
Components:
  - Form (nama, harga, cost, stok awal, kategori, foto)
  - Image uploader
Actions:
  - POST /products | PATCH /products/:id
  - POST /uploads (untuk foto)
```

---

## Stok

### Stock Overview

```txt
Route: /stock
Layout: default
Components:
  - Product list dengan current stock
  - Low stock alert
  - Manual adjustment form
Data: GET /stock/inventory
```

### Stock Log

```txt
Route: /stock/logs
Layout: default
Components:
  - Filter (produk, reason, date range)
  - DataTable (produk, perubahan, reason, ref, tanggal)
Data: GET /stock/logs
```

---

## Shift

### Shift List

```txt
Route: /shifts
Layout: default
Components:
  - DataTable (tanggal, owner, status, outlet)
  - Open/close shift action
Data: GET /shifts
```

### Shift Detail

```txt
Route: /shifts/:id
Layout: default
Components:
  - Shift info (owner, outlet, waktu buka/tutup)
  - Participants list
  - Transaksi dalam shift
  - Rekap penjualan shift
Data: GET /shifts/:id
```

---

## Laporan

### Reports

```txt
Route: /reports
Layout: default
Components:
  - Date range picker
  - Outlet selector
  - Summary stats (total sales, total transaksi)
  - Daily breakdown table/chart
Data: GET /reports/daily
```

---

## Pengaturan

### Outlet Management

```txt
Route: /outlets
Layout: default
Components: List + CRUD modal/page
Data: GET /outlets
```

### User Management

```txt
Route: /users
Layout: default
Components: List + CRUD + assign role
Data: GET /users
```

### Role Management

```txt
Route: /roles
Layout: default
Components: List + CRUD + assign permissions
Data: GET /rbac/roles
```

### Store Tables

```txt
Route: /store-tables
Layout: default
Components: List + CRUD meja
Data: GET /store-tables
```

---

## Customer Self-Order

### Catalog Page

```txt
Route: /catalog/:outletSlug
Layout: public
Components:
  - Category filter tabs
  - Product grid
  - Cart icon
  - Session form (nama, nomor meja)
Data: GET /public/outlets/:slug/menu
```
