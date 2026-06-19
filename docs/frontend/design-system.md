# Design System — WisataPOS

## Stack

```txt
PrimeVue    — UI component library
Tailwind CSS v4 — utility-first CSS
```

---

## Theme

PrimeVue theme dikonfigurasi di:

```txt
apps/web/src/core/initiate.ts
```

Dark mode: `darkMode: 'selector'` (Tailwind v4 config).

---

## Layout Types

```txt
default   — dashboard layout: sidebar kiri + header atas + content area
auth      — centered card, untuk login/register
public    — full-width, no sidebar, untuk customer self-order
```

Layout component berada di:

```txt
apps/web/src/layouts/
```

---

## PrimeVue Components yang Digunakan

Komponen umum:

```txt
Button          — p-button, variasi: primary, secondary, outlined, text
DataTable       — p-datatable + p-column
Dialog          — p-dialog (modal)
InputText       — p-inputtext
Dropdown        — p-dropdown
Textarea        — p-textarea
Toast           — p-toast (notifikasi)
ConfirmDialog   — p-confirmdialog
Tag             — p-tag (status badge)
Card            — p-card
Paginator       — p-paginator
ProgressSpinner — p-progressspinner (loading)
Breadcrumb      — p-breadcrumb
Menu / TieredMenu — navigasi
FileUpload      — upload file
```

---

## Color Conventions

Gunakan PrimeVue severity:

```txt
success  — hijau (transaksi berhasil, shift open, stok cukup)
warning  — kuning (stok rendah, shift akan berakhir)
danger   — merah (error, stok habis, transaksi dibatalkan)
info     — biru (informasi umum)
```

Status Badge:

```txt
order_status: pending → warning, accepted → info, selesai → success, cancelled → danger
shift: open → success, closed → secondary
is_active: true → success, false → danger
```

---

## Typography

Gunakan Tailwind text utilities:

```txt
text-2xl font-bold  — page title
text-xl font-semibold — section heading
text-base           — body text
text-sm text-gray-500 — secondary/caption text
```

---

## Form Pattern

```vue
<form @submit.prevent="handleSubmit">
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <label for="name" class="text-sm font-medium">Nama Produk</label>
      <InputText id="name" v-model="form.name" placeholder="Nama produk" />
    </div>
    <div class="flex justify-end gap-2">
      <Button label="Batal" severity="secondary" @click="handleCancel" />
      <Button label="Simpan" type="submit" :loading="loading" />
    </div>
  </div>
</form>
```

---

## Table Pattern

```vue
<DataTable :value="items" :loading="loading" paginator :rows="10">
  <Column field="name" header="Nama" />
  <Column field="price" header="Harga">
    <template #body="{ data }">
      {{ formatCurrency(data.price) }}
    </template>
  </Column>
  <Column header="Aksi">
    <template #body="{ data }">
      <Button icon="pi pi-pencil" text @click="handleEdit(data)" />
      <Button icon="pi pi-trash" text severity="danger" @click="handleDelete(data)" />
    </template>
  </Column>
</DataTable>
```

---

## Breadcrumb

Gunakan breadcrumbs dari route meta:

```ts
meta: {
  breadcrumbs: [
    { label: 'Home', route: '/landing', isActive: false },
    { label: 'Produk', route: '/products', isActive: false },
    { label: 'Buat Produk', route: '/products/create', isActive: true },
  ],
}
```

---

## Icons

Gunakan PrimeIcons:

```txt
pi pi-plus      — tambah
pi pi-pencil    — edit
pi pi-trash     — hapus
pi pi-eye       — lihat detail
pi pi-search    — cari
pi pi-filter    — filter
pi pi-refresh   — refresh
pi pi-check     — konfirmasi
pi pi-times     — tutup/batal
pi pi-download  — download/export
```

---

## Responsive

Dashboard layout menggunakan sidebar yang collapsible pada mobile.

Gunakan Tailwind responsive prefix:

```txt
sm: md: lg: xl:
```
