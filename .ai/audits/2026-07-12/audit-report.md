# Audit Report: Product, Product Categories, Product Lists

## Temuan Prioritas

### 1. Kategori: DEBT
**Judul**: Store Pinia Boilerplate Kosong di Modul Kategori dan Produk
* **Lokasi**:
  * `apps/web/src/modules/product-categories/stores/`
  * `apps/web/src/modules/product-lists/stores/`
* **Masalah**: Kedua modul ini memiliki file store Pinia lengkap (`state.ts`, `actions.ts`, `getters.ts`, `index.ts`) namun isinya hanya boilerplate kosong "Hello World". Logika data fetching dilakukan langsung di level component menggunakan Axios.
* **Dampak**: Menimbulkan kebingungan bagi developer baru karena struktur store ada tetapi tidak digunakan, serta menyisakan dead code boilerplate.
* **Usulan**: Hapus direktori `stores/` di kedua modul jika state management global memang tidak diperlukan, atau migrasikan fetch logic ke store untuk standarisasi.

### 2. Kategori: CONVENTION
**Judul**: Pencarian Kategori Tidak Berfungsi di Halaman Index Kategori
* **Lokasi**: `apps/web/src/modules/product-categories/pages/index.vue:223`
* **Masalah**: Fungsi `search()` pada komponen `UiSearch` hanya mengeksekusi `console.log(form.value)` tanpa memperbarui query pagination atau memicu fetch ulang data dari API.
* **Dampak**: Fitur pencarian kategori tidak dapat digunakan oleh pengguna.
* **Usulan**: Implementasikan debounce timer dan perbarui pemanggilan `getListCategories` dengan menyisipkan parameter `search` dari model input.

### 3. Kategori: CONVENTION
**Judul**: Isu Rute Breadcrumb Pada Detail/Edit Kategori dan Edit Produk
* **Lokasi**:
  * `apps/web/src/modules/product-categories/router/index.ts:87,114`
  * `apps/web/src/modules/product-lists/router/index.ts:87`
* **Masalah**: Breadcrumb untuk edit/detail kategori salah mengarah ke `/product/product-categories/create`. Breadcrumb edit produk mengarah ke `/product/product-lists/edit` tanpa parameter ID produk, menyebabkan error 404 jika di-klik.
* **Dampak**: Navigasi breadcrumb rusak dan membingungkan pengguna.
* **Usulan**: Sesuaikan breadcrumb kategori agar kembali ke tab kategori (`/product?tab=categories`), dan hapus parameter `route` pada breadcrumb halaman edit aktif (set `isActive: true` saja).

## Temuan Non-Prioritas

### 1. Kategori: STYLE
**Judul**: Duplikasi Deklarasi Variabel Pagination
* **Lokasi**: `apps/web/src/modules/product-lists/pages/create.vue:320`
* **Masalah**: Terdapat inisialisasi variabel `pagination` lokal di halaman create untuk fetch categories, namun data categories sebenarnya tidak membutuhkan pagination lokal yang rumit.
* **Dampak**: Kode kurang clean tetapi tidak mempengaruhi fungsi utama.
* **Usulan**: Refactor inisialisasi variabel pagination yang tidak perlu.
