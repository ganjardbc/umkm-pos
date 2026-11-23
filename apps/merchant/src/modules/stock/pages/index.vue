<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row gap-4">
      <UiSearch
        v-model="form.search"
        type="search"
        placeholder="Cari riwayat stok..."
        class="w-full"
        @input="search"
      />
      <Button
        v-if="isCanAdjust"
        icon="pi pi-list-check"
        label="Stok Opname"
        severity="secondary"
        variant="outlined"
        class="w-full md:w-[192px]"
        @click="router.push({ name: 'stock-opname' })"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Memuat riwayat stok..."
    />

    <div v-else-if="stocks.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Belum ada riwayat stok.</p>
    </div>

    <UiCard v-else>
      <DataTable :value="stocks" size="small" scrollable>
        <Column header="#">
          <template #body="{ index }">{{ getNoTable(index, pagination.page, pagination.rows) }}</template>
        </Column>
        <Column header="Produk">
          <template #body="{ data }">{{ data.products?.name || '-' }}</template>
        </Column>
        <Column header="Perubahan">
          <template #body="{ data }">
            <span :class="data.change_qty > 0 ? 'text-green-600' : 'text-red-600'" class="font-semibold">
              {{ data.change_qty > 0 ? `+${data.change_qty}` : (data.change_qty ?? '-') }}
            </span>
          </template>
        </Column>
        <Column header="Stok Setelahnya">
          <template #body="{ data }">{{ data.stock_after ?? '-' }}</template>
        </Column>
        <Column header="Alasan">
          <template #body="{ data }">{{ data.reason || '-' }}</template>
        </Column>
        <Column header="Dibuat Pada">
          <template #body="{ data }">{{ formatDateTime(data.created_at) }}</template>
        </Column>
      </DataTable>
    </UiCard>

    <UiPagination
      v-model="pagination"
      @page="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { isHasPermission } from '@/helpers/auth.ts';
import { ADJUST } from '@/modules/stock/services/rbac.ts';
import { getNoTable, getErrorMessage, formatDateTime } from '@umkm-pos/ui/helpers/utils';
import { getOutlet } from '@/helpers/auth.ts';
import { getListStock } from '@/modules/stock/services/api.ts';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiSearch from '@umkm-pos/ui/components/UiSearch.vue';
import UiPagination from '@umkm-pos/ui/components/UiPagination.vue';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';

const router = useRouter();
const isCanAdjust = computed(() => isHasPermission(ADJUST));

// Fetch Data
const loading = ref(false);
const stocks = ref<any[]>([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchStock = async () => {
  try {
    loading.value = true;
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
      outlet_id: getOutlet()?.id,
      ...(form.value.search?.trim() && { search: form.value.search.trim() }),
    }
    const response = await getListStock(payload);
    const { data, meta } = response?.data?.data || {};

    stocks.value = data || [];
    pagination.value.totalRecords = meta?.total || 0;
    pagination.value.pageCount = meta?.totalPages || 0;
  } catch (error) {
    console.log(error);
    showToast({
        type: 'error',
        title: 'Gagal.',
        message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event: any) => {
  pagination.value.page = event.page + 1;
  fetchStock();
};

// Search
const form = ref({
  search: '',
});

let searchDebounceTimer: ReturnType<typeof setTimeout>;
const search = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    pagination.value.page = 1;
    fetchStock();
  }, 300);
};

onMounted(() => {
  fetchStock();
});
</script>

<style scoped>
</style>
