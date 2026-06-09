<template>
  <div class="w-full space-y-4 pb-24">
    <UiCard>
      <div class="flex items-start gap-3">
        <img
          v-if="outlet?.logo"
          :src="outlet.logo"
          :alt="outlet?.name"
          class="h-14 w-14 rounded object-cover"
        >
        <div
          v-else
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-gray-100 text-lg font-semibold text-primary dark:bg-dark"
        >
          {{ outletInitial }}
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-base font-semibold">{{ outlet?.name || '-' }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ outlet?.location || '-' }}</p>
            </div>
            <Tag :value="getCustomerCatalogStatusLabel(catalogStore.sessionStatus)" severity="info" />
          </div>
        </div>
      </div>
    </UiCard>

    <UiCard>
      <div class="flex items-center justify-between gap-3">
        <div class="flex-1 flex items-center gap-3">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-700 dark:bg-dark dark:text-slate-50">
            {{ customerInitial }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-base font-semibold">{{ catalogStore.session?.customer_name || '-' }}</p>
            <p class="mt-1 text-sm text-gray-500">{{ catalogStore.session?.customer_phone || '-' }}</p>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-500">Sesi Berlaku</label>
          <p class="mt-1 text-sm">{{ formatDateTime(catalogStore.session?.expires_at) }}</p>
        </div>
      </div>
    </UiCard>

    <UiCard>
      <h1 class="text-lg font-semibold">Daftar Pesanan</h1>

      <div v-if="latestOrder" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <div class="mt-1">
              <Tag :value="getCustomerCatalogStatusLabel(latestOrder.order_status)" severity="warning" />
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Meja</label>
            <p class="mt-1 text-base">{{ latestOrder.store_tables?.name || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Items</label>
            <p class="mt-1 text-base">{{ latestOrder.transaction_items?.length || 0 }} item</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Total</label>
            <p class="mt-1 text-base">{{ getCurrency(latestOrder.total_amount) }}</p>
          </div>
        </div>
        <div class="w-full space-y-4">
          <Button label="Lihat Order" icon="pi pi-receipt" size="small" fluid @click="goToOrder" />
          <Button label="Buat Pesanan Baru" icon="pi pi-plus" size="small" severity="secondary" variant="outlined" fluid @click="goToBrowse" />
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-8 text-center text-gray-500">
        <i class="pi pi-receipt mb-3 text-4xl!" />
        <p class="mb-4 text-sm">Belum ada pesanan. Pilih menu untuk membuat pesanan pertama.</p>
        <Button label="Buat Pesanan" icon="pi pi-plus" size="small" @click="goToBrowse" />
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UiCard from '@/components/UiCard.vue';
import { formatDateTime, getCurrency } from '@/helpers/utils.ts';
import { useCatalogStore } from '../stores/index.ts';
import { getCustomerCatalogStatusLabel } from '../services/status-labels.ts';

const route = useRoute();
const router = useRouter();
const catalogStore = useCatalogStore();

const outlet = computed(() => catalogStore.session?.outlets || null);
const outletInitial = computed(() => outlet.value?.name?.charAt(0)?.toUpperCase() || 'S');
const customerInitial = computed(() =>
  catalogStore.session?.customer_name?.charAt(0)?.toUpperCase() || 'C',
);
const latestOrder = computed(() => catalogStore.latestOrder);

const goToBrowse = () => {
  router.push({ name: 'customer-catalog-browse', params: { outletId: route.params.outletId } });
};

const goToOrder = () => {
  router.push({ name: 'customer-catalog-order', params: { outletId: route.params.outletId } });
};
</script>
