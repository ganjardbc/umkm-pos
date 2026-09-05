<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row gap-4">
      <UiSearch
        v-model="form.search"
        type="search"
        class="w-full"
        @input="search"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Loading stock movements..."
    />

    <div v-else-if="stocks.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Stocks are empty.</p>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <UiCard
        v-for="(item, index) in stocks"
        :key="item.id"
        class="relative overflow-hidden"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
              {{ item.products?.name || '-' }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              #{{ getNoTable(index, pagination.page, pagination.rows) }}
            </p>
          </div>
          <span :class="item.change_qty > 0 ? 'text-green-600' : 'text-red-600'" class="text-sm font-semibold shrink-0">
            {{ item.change_qty || '-' }}
          </span>
        </div>

        <Divider class="my-0!" />

        <div class="grid grid-cols-2 gap-y-2 text-xs">
          <span class="text-slate-400">Stock After</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ item.stock_after || '-' }}</span>

          <span class="text-slate-400">Reason</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ item.reason || '-' }}</span>
        </div>

        <Divider class="my-0!" />

        <div class="flex items-center justify-between">
          <span class="text-slate-400 text-xs">Created At</span>
          <span class="text-xs text-slate-700 dark:text-slate-300">{{ formatDateTime(item.created_at) }}</span>
        </div>
      </UiCard>
    </div>

    <UiPagination
      v-model="pagination"
      @page="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getNoTable, getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { getOutlet } from '@/helpers/auth.ts';
import { getListStock } from '@/modules/stock/services/api.ts';
import { showToast } from '@/helpers/toast.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';
import UiLoading from '@/components/UiLoading.vue';

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
    }
    const response = await getListStock(payload);
    const { data, meta } = response?.data?.data || {};

    stocks.value = data;
    pagination.value.totalRecords = meta?.total;
    pagination.value.pageCount = meta?.totalPages;
  } catch (error) {
    console.log(error);
    showToast({
        type: 'error',
        title: 'Error.',
        message: getErrorMessage(error) || 'There was an error.',
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

const search = () => {
  console.log(form.value);
};

onMounted(() => {
  fetchStock();
});
</script>

<style scoped>
</style>
