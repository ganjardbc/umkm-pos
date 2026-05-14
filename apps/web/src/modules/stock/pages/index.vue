<template>
  <div class="w-full space-y-4">
    <h1 class="text-lg font-semibold">
      Stock
    </h1>

    <div class="flex flex-col md:flex-row gap-4">
      <UiSearch
        v-model="form.search"
        type="search"
        class="w-full"
        @input="search"
      />
    </div>

    <UiCard class="p-0! gap-0! overflow-hidden!">
      <DataTable :value="stocks" tableStyle="min-width: 50rem">
        <template #empty>
          <span class="w-full text-center flex justify-center">
            Stocks are empty.
          </span>
        </template>
        <Column field="no" header="NO" class="w-18">
          <template #body="slotProps">
            {{ getNoTable(slotProps.index, pagination.page, pagination.rows) }}
          </template>
        </Column>
        <Column field="product" header="Product">
          <template #body="slotProps">
            {{ slotProps.data?.products?.name }}
          </template>
        </Column>
        <Column field="stock_qty" header="Stock Qty">
          <template #body="slotProps">
            {{ slotProps.data?.products?.stock_qty }}
          </template>
        </Column>
        <Column field="change_qty" header="Change Qty">
          <template #body="slotProps">
            <span :class="slotProps.data?.change_qty > 0 ? 'text-green-600' : 'text-red-600'">
              {{ slotProps.data?.change_qty }}
            </span>
          </template>
        </Column>
        <Column field="reason" header="Reason">
          <template #body="slotProps">
            {{ slotProps.data.reason }}
          </template>
        </Column>
        <Column field="created_at" header="Created At">
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.created_at) }}
          </template>
        </Column>
      </DataTable>
      <UiPagination
        v-model="pagination"
        @page="onPageChange"
      />
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getNoTable, getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { getListStock } from '@/modules/stock/services/api.ts';
import { showToast } from '@/helpers/toast.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';

// Fetch Data
const stocks = ref([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchStock = async () => {
  try {
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
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
