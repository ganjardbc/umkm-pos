<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row gap-4">
      <UiSearch
        v-model="searchText"
        type="search"
        placeholder="Cari produk..."
        class="w-full"
      />
      <Button
        icon="pi pi-check"
        label="Simpan Opname"
        class="w-full md:w-[192px]"
        :disabled="countedRows.length === 0"
        :loading="saving"
        @click="onSave"
      />
    </div>

    <p class="text-sm text-gray-500">
      Isi jumlah hasil hitung fisik di rak. Produk yang dikosongkan tidak diubah.
      Stok produk yang berbeda akan disesuaikan dan tercatat sebagai penyesuaian opname.
    </p>

    <UiLoading
      v-if="loading"
      message="Memuat stok..."
    />

    <div
      v-else-if="filteredRows.length === 0"
      class="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Tidak ada produk.</p>
    </div>

    <div
      v-else
      class="space-y-2"
    >
      <UiCard
        v-for="row in filteredRows"
        :key="row.product_id"
      >
        <div class="flex items-center gap-3">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">
              {{ row.name }}
            </p>
            <p class="text-xs text-gray-400">
              Stok sistem: {{ row.system }}
            </p>
          </div>
          <span
            v-if="row.counted !== null && row.counted !== row.system"
            class="text-sm font-semibold shrink-0"
            :class="row.counted > row.system ? 'text-green-600' : 'text-red-600'"
          >
            {{ row.counted - row.system > 0 ? '+' : '' }}{{ row.counted - row.system }}
          </span>
          <InputNumber
            v-model="row.counted"
            :min="0"
            placeholder="Hitung"
            input-class="w-24 text-right"
          />
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast, showConfirm } from '@umkm-pos/ui/helpers/toast';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiSearch from '@umkm-pos/ui/components/UiSearch.vue';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';
import { getOutlet } from '@/helpers/auth.ts';
import { getListInventory, postStockOpname } from '@/modules/stock/services/api.ts';

interface Row {
  product_id: string;
  name: string;
  system: number;
  counted: number | null;
}

const loading = ref(false);
const saving = ref(false);
const rows = ref<Row[]>([]);
const searchText = ref('');

const filteredRows = computed(() => {
  const q = searchText.value.trim().toLowerCase();
  return q ? rows.value.filter((row) => row.name.toLowerCase().includes(q)) : rows.value;
});
const countedRows = computed(() => rows.value.filter((row) => row.counted !== null));

// The inventory endpoint caps a page at 100, so walk every page.
const fetchAll = async () => {
  try {
    loading.value = true;
    const all: Row[] = [];
    for (let page = 1; ; page++) {
      const response = await getListInventory({ outlet_id: getOutlet()?.id, page, limit: 100 });
      const { data, meta } = response?.data?.data || {};
      for (const item of data || []) {
        all.push({
          product_id: item.product_id,
          name: item.products?.name || '-',
          system: item.stock_qty,
          counted: null,
        });
      }
      if (!meta || page >= meta.totalPages) break;
    }
    rows.value = all.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    showToast({ type: 'error', title: 'Gagal', message: getErrorMessage(error) || 'Gagal memuat stok.' });
  } finally {
    loading.value = false;
  }
};

const onSave = () => {
  const differing = countedRows.value.filter((row) => row.counted !== row.system).length;
  showConfirm({
    header: 'Simpan Stok Opname',
    message: `${countedRows.value.length} produk dihitung, ${differing} berbeda dengan stok sistem dan akan disesuaikan. Lanjutkan?`,
    rejectLabel: 'Batal',
    acceptLabel: 'Simpan',
    type: 'info',
    accept: submit,
  });
};

const submit = async () => {
  try {
    saving.value = true;
    const response = await postStockOpname({
      outlet_id: getOutlet()?.id,
      counts: countedRows.value.map((row) => ({ product_id: row.product_id, counted_qty: row.counted })),
    });
    const { counted, adjusted } = response?.data?.data || {};
    showToast({
      type: 'success',
      title: 'Opname Tersimpan',
      message: `${counted} produk dihitung, ${adjusted} disesuaikan.`,
    });
    await fetchAll();
  } catch (error) {
    showToast({ type: 'error', title: 'Gagal', message: getErrorMessage(error) || 'Gagal menyimpan opname.' });
  } finally {
    saving.value = false;
  }
};

onMounted(fetchAll);
</script>
