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
            <label class="text-sm font-medium text-gray-500">ID Pesanan</label>
            <p class="mt-1 font-mono text-base">{{ order.id }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Meja</label>
            <p class="mt-1 text-base">{{ order.store_tables?.name || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Pelanggan</label>
            <p class="mt-1 text-base">{{ order.customer_name_snapshot || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Waktu Pemesanan</label>
            <p class="mt-1 text-base">{{ formatDateTime(order.ordered_at || order.created_at) }}</p>
          </div>
        </div>
      </UiCard>

      <UiCard>
        <h1 class="text-lg font-semibold">Daftar Item</h1>

        <div class="space-y-2">
          <div
            v-if="!order.transaction_items?.length"
            class="w-full py-4 text-center text-gray-500"
          >
            Tidak ada item dalam pesanan ini.
          </div>
          <div
            v-for="(item, index) in order.transaction_items"
            :key="item.id || index"
            class="bg-gray-50 dark:bg-dark! rounded-lg p-3 flex flex-col gap-2"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 flex items-center gap-2">
                <span class="text-base font-medium text-gray-500">#{{ Number(index) + 1 }}</span>
                <p class="text-base font-semibold">{{ item.product_name_snapshot }}</p>
              </div>
            </div>
            <div v-if="item.customer_note">
              <p class="text-xs text-gray-500">Catatan</p>
              <p class="text-base text-right">{{ item.customer_note }}</p>
            </div>
            <div class="flex gap-4 items-center justify-between">
              <p class="text-xs text-gray-500">Jumlah</p>
              <p class="text-base text-right font-semibold">{{ item.qty }}</p>
            </div>
            <div class="flex gap-4 items-center justify-between">
              <p class="text-xs text-gray-500">Harga</p>
              <p class="text-base text-right">{{ getCurrency(item.price_snapshot) }}</p>
            </div>
            <div class="flex gap-4 items-center justify-between">
              <p class="text-xs text-gray-500">Subtotal</p>
              <p class="text-base text-right font-medium">{{ getCurrency(item.subtotal) }}</p>
            </div>
          </div>
        </div>

        <div class="w-full bg-gray-50 dark:bg-dark-secondary">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-500">Total Pembayaran</label>
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
