<template>
  <Dialog
    v-model:visible="visibility"
    modal
    :header="detail?.name || 'Pelanggan'"
    class="w-full max-w-lg"
  >
    <UiLoading
      v-if="loading"
      message="Memuat riwayat..."
    />

    <div
      v-else-if="detail"
      class="space-y-4"
    >
      <div class="text-sm text-gray-500 space-y-1">
        <div v-if="detail.phone">WhatsApp: {{ detail.phone }}</div>
        <div v-if="detail.note">{{ detail.note }}</div>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-lg bg-gray-50 dark:bg-dark! p-3">
          <div class="text-lg font-bold">{{ detail.stats.transaction_count }}</div>
          <div class="text-xs text-gray-400">Transaksi</div>
        </div>
        <div class="rounded-lg bg-gray-50 dark:bg-dark! p-3">
          <div class="text-lg font-bold">{{ getCurrency(detail.stats.total_spent) }}</div>
          <div class="text-xs text-gray-400">Total belanja</div>
        </div>
        <div class="rounded-lg bg-gray-50 dark:bg-dark! p-3">
          <div class="text-sm font-bold">{{ detail.stats.last_visit ? formatDateTime(detail.stats.last_visit) : '-' }}</div>
          <div class="text-xs text-gray-400">Terakhir datang</div>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-semibold mb-2">
          Transaksi terakhir
        </h3>
        <p
          v-if="detail.recent_transactions.length === 0"
          class="text-sm text-gray-400"
        >
          Belum ada transaksi.
        </p>
        <ul
          v-else
          class="divide-y divide-gray-100 dark:divide-gray-800 text-sm"
        >
          <li
            v-for="trx in detail.recent_transactions"
            :key="trx.id"
            class="flex items-center justify-between py-2"
          >
            <div>
              <div>{{ formatDateTime(trx.created_at) }}</div>
              <div class="text-xs text-gray-400">
                {{ trx.outlets?.name }}
              </div>
            </div>
            <div class="text-right">
              <div :class="trx.is_cancelled ? 'line-through text-gray-400' : 'font-semibold'">
                {{ getCurrency(trx.total_amount) }}
              </div>
              <div
                v-if="trx.is_cancelled"
                class="text-xs text-red-500"
              >
                Dibatalkan
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getCurrency, getErrorMessage, formatDateTime } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';
import { getDetailCustomer } from '@/modules/customers/services/api.ts';

const props = defineProps<{ customerId: string | null }>();
const visibility = defineModel<boolean>('visibility', { required: true });

const detail = ref<any>(null);
const loading = ref(false);

watch(visibility, async (open) => {
  if (!open || !props.customerId) return;
  detail.value = null;
  try {
    loading.value = true;
    detail.value = (await getDetailCustomer(props.customerId))?.data?.data;
  } catch (error) {
    showToast({ type: 'error', title: 'Gagal', message: getErrorMessage(error) || 'Gagal memuat pelanggan.' });
    visibility.value = false;
  } finally {
    loading.value = false;
  }
});
</script>
