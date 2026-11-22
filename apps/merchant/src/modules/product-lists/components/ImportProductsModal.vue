<template>
  <Dialog
    v-model:visible="visibility"
    modal
    header="Impor Produk"
    class="w-full max-w-2xl"
  >
    <div class="space-y-4">
      <p class="text-sm text-gray-500">
        Unggah file CSV atau Excel dengan kolom <b>nama</b> dan <b>harga</b>. Kolom opsional:
        modal, kategori, stok, stok minimum. Stok masuk ke outlet yang sedang aktif.
        Kategori yang belum ada dibuat otomatis. Bila ada satu baris bermasalah, tidak ada produk yang diimpor.
      </p>

      <div class="flex flex-wrap gap-2">
        <FileUpload
          mode="basic"
          accept=".csv,.xlsx,.xls"
          choose-label="Pilih File"
          custom-upload
          auto
          @select="onSelect"
        />
        <Button
          label="Unduh Template"
          icon="pi pi-download"
          severity="secondary"
          variant="outlined"
          @click="downloadTemplate"
        />
      </div>

      <div
        v-if="fileName"
        class="text-sm"
      >
        <b>{{ fileName }}</b>: {{ rows.length }} produk terbaca.
      </div>

      <ul
        v-if="errors.length"
        class="max-h-48 overflow-auto rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300 space-y-1"
      >
        <li
          v-for="message in errors"
          :key="message"
        >
          {{ message }}
        </li>
      </ul>

      <div
        v-else-if="rows.length"
        class="max-h-48 overflow-auto text-sm"
      >
        <table class="w-full text-left">
          <thead class="text-xs text-gray-500">
            <tr>
              <th>Nama</th>
              <th>Harga</th>
              <th>Kategori</th>
              <th>Stok</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in rows.slice(0, 5)"
              :key="index"
            >
              <td>{{ row.name }}</td>
              <td>{{ getCurrency(row.price) }}</td>
              <td>{{ row.category || '-' }}</td>
              <td>{{ row.stock_qty ?? 0 }}</td>
            </tr>
          </tbody>
        </table>
        <p
          v-if="rows.length > 5"
          class="mt-1 text-xs text-gray-400"
        >
          dan {{ rows.length - 5 }} produk lainnya
        </p>
      </div>
    </div>

    <template #footer>
      <div class="w-full flex gap-4">
        <Button
          label="Batal"
          severity="secondary"
          variant="outlined"
          class="w-full"
          @click="visibility = false"
        />
        <Button
          :label="`Impor ${rows.length || ''} Produk`"
          class="w-full"
          :disabled="!canImport"
          :loading="isImporting"
          @click="onImport"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getCurrency } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import { getOutlet } from '@/helpers/auth.ts';
import { postImportProducts } from '@/modules/product-lists/services/api.ts';
import {
  downloadTemplate,
  parseProductFile,
  type ImportRow,
} from '@/modules/product-lists/helpers/import.ts';

const visibility = defineModel<boolean>('visibility', { required: true });
const emit = defineEmits<{ imported: [] }>();

const fileName = ref('');
const rows = ref<ImportRow[]>([]);
const errors = ref<string[]>([]);
const isImporting = ref(false);

const canImport = computed(() => rows.value.length > 0 && errors.value.length === 0 && !isImporting.value);

watch(visibility, (open) => {
  if (open) {
    fileName.value = '';
    rows.value = [];
    errors.value = [];
  }
});

const onSelect = async (event: any) => {
  const file: File | undefined = event.files?.[0];
  if (!file) return;
  fileName.value = file.name;
  try {
    ({ rows: rows.value, errors: errors.value } = await parseProductFile(file));
  } catch {
    rows.value = [];
    errors.value = ['File tidak bisa dibaca. Gunakan CSV atau Excel (.xlsx).'];
  }
};

const onImport = async () => {
  try {
    isImporting.value = true;
    const response = await postImportProducts({ outlet_id: getOutlet()?.id, rows: rows.value });
    const { created, categories_created } = response?.data?.data || {};
    showToast({
      type: 'success',
      title: 'Impor Berhasil',
      message: `${created} produk ditambahkan${categories_created ? `, ${categories_created} kategori baru` : ''}.`,
    });
    visibility.value = false;
    emit('imported');
  } catch (error: any) {
    // Server rejects the whole file and lists every bad row.
    const list = error?.response?.data?.errors;
    errors.value = Array.isArray(list) && list.length ? list : [error?.response?.data?.message || 'Impor gagal.'];
  } finally {
    isImporting.value = false;
  }
};
</script>
