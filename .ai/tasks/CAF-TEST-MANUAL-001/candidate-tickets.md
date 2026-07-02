# CAF-TEST-MANUAL-001: Candidate Tickets for Pipeline Test

**Module dipilih:** `product-lists`  
**Alasan pilih module ini:** Paling lengkap (4 pages + 1 modal component + store + service), punya interaksi nyata (CRUD + stock adjust), dan ada beberapa gap kecil yang jelas — search stub, field hilang, color condition salah. Ideal untuk menguji pola yang sudah didokumentasikan di frontend.md tanpa perlu backend baru.

---

## Ticket A — [product-lists] Add missing `note` field to AdjustStockModal + display in stock history

### Deskripsi masalah

`AdjustStock` type di `services/types.ts` sudah mendefinisikan field `note`. Field ini ada di `initialValues`, masuk ke payload yang dikirim ke API, dan ada di Zod schema (sebagai `optional`). Tapi di template `AdjustStockModal.vue` **tidak ada input untuk `note`** — user tidak bisa mengisi catatan. Akibatnya `note` selalu string kosong.

Di sisi history (`detail.vue`), tabel Stock History juga tidak menampilkan kolom Note, sehingga data catatan yang mungkin sudah ada di DB tidak pernah terlihat.

### Files yang terdampak

| File | Perubahan |
|------|-----------|
| `components/AdjustStockModal.vue` | Tambah `<Textarea>` untuk field `note` di bawah field Reason |
| `pages/detail.vue` | Tambah kolom "Note" di DataTable stock history |

### Acceptance Criteria

- [ ] AdjustStockModal menampilkan field "Note (optional)" berupa Textarea setelah field Reason
- [ ] Value note dikirim dalam payload `emits('submit', payload)` (sudah ada, hanya perlu UI-nya)
- [ ] Kolom "Note" muncul di tabel Stock History pada halaman detail produk
- [ ] Kolom Note menampilkan `-` jika kosong

### Estimasi kompleksitas

**Small**

### Kenapa kandidat bagus

- Jelas scope-nya: 2 file, tidak ada ambiguitas
- Menguji pola: "form field pakai PrimeVue Form + Zod" (sudah terdokumentasi) + "DataTable column template"
- Tidak ada backend baru — field `note` sudah ada di API
- Error yang mudah diverifikasi: tanpa fix, note selalu kosong walau diisi user

---

## Ticket B — [product-lists] Fix low-stock visual warning di list page dan detail page

### Deskripsi masalah

Di `pages/index.vue` kolom "Min Stock" dan kolom "Qty" keduanya pakai kondisi yang sama:

```vue
:class="slotProps.data.min_stock && 'text-primary-600'"
```

Kondisi ini salah untuk kolom Qty. Seharusnya Qty mendapat warna peringatan (merah/oranye) ketika `stock_qty <= min_stock` — bukan sekadar ketika `min_stock` truthy. Akibatnya: semua produk yang punya `min_stock > 0` menampilkan Qty berwarna primary, tidak peduli apakah stok aman atau kritis.

Di `pages/detail.vue`, halaman detail produk tidak menampilkan indikasi visual apapun ketika stok di bawah minimum.

### Files yang terdampak

| File | Perubahan |
|------|-----------|
| `pages/index.vue` | Perbaiki kondisi `:class` pada kolom Qty; tambah `<Tag>` warning ketika low stock |
| `pages/detail.vue` | Tambah `<Tag severity="warn">Low Stock</Tag>` di samping nilai Stock Quantity ketika `stock_qty <= min_stock` |

### Acceptance Criteria

- [ ] Kolom "Qty" di list page hanya berwarna warning ketika `stock_qty <= min_stock` (dan `min_stock > 0`)
- [ ] Kolom "Min Stock" tetap berwarna primary hanya sebagai referensi (atau dihilangkan colornya — terserah agent)
- [ ] Halaman detail produk menampilkan Tag "Low Stock" di baris Stock Quantity bila kondisi terpenuhi
- [ ] Produk dengan stok aman (qty > min_stock) tidak menampilkan warning apapun

### Estimasi kompleksitas

**Small**

### Kenapa kandidat bagus

- Ada bug konkret yang bisa diverifikasi dengan mata: warna salah di list
- Menguji pola: conditional class binding + PrimeVue Tag severity
- Dua halaman terpisah dengan konteks berbeda (list vs detail) — menguji apakah agent memahami konteks per-page
- Tidak butuh state baru, hanya logika template

---

## Ticket C — [product-lists] Wire product search + tambah category filter di list page

### Deskripsi masalah

Fungsi `search()` di `pages/index.vue` adalah stub:

```ts
const search = () => {
  console.log(form.value);  // tidak melakukan apa-apa
};
```

Search input sudah ada di UI tapi tidak berfungsi. Tidak ada filter kategori meski API `/api/v1/products` sudah mendukung parameter `search` dan `category_id`. Pembanding: `pages/create.vue` sudah `fetchCategories()` dari `product-categories/services/api.ts` — polanya sudah ada di module yang sama.

### Files yang terdampak

| File | Perubahan |
|------|-----------|
| `pages/index.vue` | Wire `form.search` ke `fetchProduct`, reset pagination ke page 1 pada search, tambah `Select` dropdown filter kategori, fetch categories on mount, pass `category_id` ke API payload |

> Note: file `product-categories/services/api.ts` dipakai via import (sudah ada, tidak dimodifikasi). Secara file yang diubah hanya 1, tapi scope logis mencakup: state baru (categoryFilter, listOfCategories), lifecycle baru (fetchCategories di onMounted), template baru (Select komponen), dan modifikasi API payload — representatif untuk pola "list page with filters".

### Acceptance Criteria

- [ ] Mengetik di search input memfilter produk (memanggil API dengan param `search`)
- [ ] Setiap perubahan search me-reset pagination ke page 1 sebelum fetch
- [ ] Dropdown filter kategori tersedia di samping search input
- [ ] Memilih kategori memfilter produk berdasarkan `category_id`
- [ ] Loading state untuk dropdown kategori ditangani (menggunakan `:loading` prop seperti di create.vue)

### Estimasi kompleksitas

**Medium**

### Kenapa kandidat bagus

- Menguji pola "feature addition" paling umum: wiring UI input ke API call
- Pattern fetch-on-mount untuk populate dropdown sudah ada di `create.vue` — agent harus mengenali dan menerapkan pola yang sama
- Cross-module import (`product-categories`) menguji apakah agent memahami module boundaries tanpa melanggarnya
- Scope cukup besar untuk medium ticket tapi tidak butuh backend baru

---

## Rekomendasi untuk test run

Untuk test pertama pipeline (planner + frontend agent), **Ticket B** paling direkomendasikan:

- Bug konkret, dua file, logika sederhana → hasil verifikasi visual langsung jelas
- Menguji kemampuan agent membaca bug di template dan memperbaikinya di 2 tempat berbeda
- Tidak ada ambiguitas requirement

Jika ingin menguji feature addition (bukan bug fix), pilih **Ticket C** karena representasi pola terbesar.
