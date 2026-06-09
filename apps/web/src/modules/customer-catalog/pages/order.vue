<template>
  <div class="w-full space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-lg font-semibold">Detail Pesanan</h1>
      <Button
        severity="secondary"
        variant="outlined"
        icon="pi pi-plus"
        label="Pesan Lagi"
        size="small"
        @click="goToBrowse"
      />
    </div>

    <UiCard v-if="!order">
      <div class="flex flex-col items-center justify-center py-8 text-center text-gray-500">
        <i class="pi pi-receipt mb-3 text-3xl" />
        <p class="mb-4 text-sm">Belum ada pesanan.</p>
        <Button label="Buat Pesanan" icon="pi pi-plus" size="small" @click="goToBrowse" />
      </div>
    </UiCard>

    <template v-else>
      <UiCard>
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-lg font-semibold">Informasi Pesanan</h1>
          <Tag :value="getCustomerCatalogStatusLabel(order.order_status)" severity="warning" />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="text-sm font-medium text-gray-500">Order ID</label>
            <p class="mt-1 font-mono text-base">{{ order.id }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Meja</label>
            <p class="mt-1 text-base">{{ order.store_tables?.name || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Customer</label>
            <p class="mt-1 text-base">{{ order.customer_name_snapshot || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Waktu Order</label>
            <p class="mt-1 text-base">{{ formatDateTime(order.ordered_at || order.created_at) }}</p>
          </div>
        </div>
      </UiCard>

      <UiCard>
        <h1 class="text-lg font-semibold">Items</h1>

        <DataTable :value="order.transaction_items || []" tableStyle="min-width: 48rem">
          <template #empty>
            <span class="flex w-full justify-center text-center">No items in this order.</span>
          </template>
          <Column field="no" header="NO" class="w-18">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>
          <Column field="product_name_snapshot" header="Product Name" />
          <Column field="price_snapshot" header="Price">
            <template #body="slotProps">
              {{ getCurrency(slotProps.data.price_snapshot) }}
            </template>
          </Column>
          <Column field="qty" header="Qty" />
          <Column field="subtotal" header="Subtotal">
            <template #body="slotProps">
              {{ getCurrency(slotProps.data.subtotal) }}
            </template>
          </Column>
          <Column field="customer_note" header="Note">
            <template #body="slotProps">
              {{ slotProps.data.customer_note || '-' }}
            </template>
          </Column>
        </DataTable>

        <div class="w-full bg-gray-50 dark:bg-dark-secondary">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-500">Total Amount</label>
            <div class="text-base font-semibold">{{ getCurrency(order.total_amount) }}</div>
          </div>
        </div>
      </UiCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UiCard from '@/components/UiCard.vue';
import { formatDateTime, getCurrency, getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { useCatalogStore } from '../stores/index.ts';
import { getCatalogOrder } from '../services/api.ts';
import { getCustomerCatalogStatusLabel } from '../services/status-labels.ts';

const route = useRoute();
const router = useRouter();
const outletId = route.params.outletId as string;
const catalogStore = useCatalogStore();

const order = computed(() => catalogStore.latestOrder);

const goToBrowse = () => {
  router.push({ name: 'customer-catalog-browse', params: { outletId } });
};

onMounted(async () => {
  try {
    if (!catalogStore.latestOrder) {
      await catalogStore.loadSession();
    }

    if (catalogStore.latestOrder?.id) {
      const response = await getCatalogOrder(catalogStore.latestOrder.id);
      catalogStore.latestOrder = response.data?.data || catalogStore.latestOrder;
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat pesanan.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
});
</script>
