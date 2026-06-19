# Product Requirements — WisataPOS

## Overview

WisataPOS adalah SaaS POS (Point of Sale) untuk UMKM wisata di Indonesia.

Target bisnis: kafe, toko suvenir, agrowisata, merchant multi-booth kecil.

---

# Core Value Proposition

* POS yang cepat dan bisa dipakai secara offline.
* Manajemen stok otomatis dari setiap transaksi.
* Multi-outlet dalam satu akun merchant.
* RBAC per outlet — kasir hanya akses outlet-nya sendiri.
* Laporan penjualan harian yang simpel.
* Customer bisa self-order via QR code meja.

---

# Actors

## Merchant Owner

* Register merchant.
* Kelola outlet.
* Kelola user dan role.
* Lihat laporan semua outlet.
* Kelola produk.

## Kasir (Cashier)

* Buka shift.
* Proses transaksi POS.
* Lihat riwayat transaksi shift-nya.
* Tutup shift.

## Customer (Self-Order)

* Scan QR meja.
* Browse menu produk.
* Tambah ke keranjang dan pesan.
* Tidak perlu login.

---

# Core Modules

## Authentication

* Register merchant pertama kali.
* Login dengan email + password.
* JWT-based session.
* Logout.

## Merchant Management

* Satu merchant = satu tenant.
* Merchant punya nama, slug unik, logo, alamat, telepon.

## Outlet Management

* Merchant bisa punya banyak outlet.
* Setiap outlet punya nama, slug (unik per merchant), lokasi.
* Outlet bisa diaktifkan/dinonaktifkan.

## User Management

* User terikat ke merchant.
* User bisa punya role berbeda di outlet berbeda.
* RBAC per outlet.

## Product Management

* Produk terikat ke merchant (shared across outlets).
* Produk punya nama, harga, biaya, stok, kategori, foto.
* Stok di-track per produk per outlet (outlet_product_inventory).
* Kategori produk untuk pengelompokan.

## POS Terminal

* Kasir pilih produk, tambah ke cart.
* Proses pembayaran (cash, transfer, dll).
* Commit transaksi secara atomik (transaction + items + stock + log).
* Dukungan offline mode dengan sync.

## Shift Management

* Kasir buka shift sebelum transaksi.
* Shift bisa multi-cashier (shift participants).
* Shift punya owner.
* Shift ditutup dengan rekap.

## Stock Management

* stock_qty di produk = current stock.
* stock_logs = audit trail semua perubahan.
* Setiap adjustment harus menulis log.

## Transaction History

* List transaksi per outlet.
* Filter: tanggal, kasir, metode bayar, status.
* Detail transaksi + items.

## Reports

* Laporan harian per outlet.
* Aggregat: total penjualan, total transaksi.
* daily_reports di-generate dari transaksi.

## Customer Self-Order (QR Table)

* Meja punya QR code.
* Customer scan → pilih meja → input nama → browse menu → pesan.
* Order masuk ke sistem sebagai order_source: `customer`.
* Kasir bisa approve/process order.

## Store Tables

* Merchant kelola meja per outlet.
* Meja punya kode dan nama.
* Meja bisa aktif/nonaktif.

## Notifications

* Notifikasi in-app untuk user.
* Contoh: order baru masuk dari customer.

---

# Non-Goals (MVP)

```txt
Loyalty Program / Poin Customer
CRM
Supplier & Purchasing Management
Multi-Warehouse Inventory
Tax Engine
Accounting System
WhatsApp / Email Integration
Custom Domain
White Label
Marketplace
```

---

# Technical Constraints

* Multi-tenant: data merchant tidak boleh bocor ke merchant lain.
* Offline support: transaksi bisa dilakukan tanpa koneksi, sync saat online.
* Transaksi atomik: create transaction + items + update stock + write log harus satu DB transaction.
* Price snapshot: harga di transaction_items tidak boleh berubah walau harga produk berubah.
