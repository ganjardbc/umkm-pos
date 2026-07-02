# .ai/tasks/PROD-101/requirements.md

## Ticket: PROD-101
## Title: Fix warna indikator stok di halaman produk

## Deskripsi

Warna indikator "Qty" di list produk salah — semua produk yang punya
Min Stock diisi (lebih dari 0) selalu tampil warna primary di kolom Qty,
padahal harusnya cuma warning kalau stoknya udah di bawah/sama dengan
Min Stock.

Halaman detail produk juga belum ada tanda visual sama sekali kalau
stok lagi kritis (di bawah minimum).

## Reported by
QA internal

## Module
product-lists

## Acceptance Criteria

- Kolom Qty di halaman list cuma warning kalau stok <= min stock
- Halaman detail produk kasih tanda "Low Stock" kalau stok di bawah minimum
- Produk dengan stok aman gak nampilin warning apapun

## Priority
Medium