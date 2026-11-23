<template>
  <UiCard>
    <div class="w-full flex gap-4 items-center justify-between">
      <h1 class="text-lg font-semibold">
        Informasi Kasir
      </h1>
    </div>

    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Outlet Information -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Outlet</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ currentShift.outlet?.name || '-' }}
          </div>
        </div>

        <!-- Shift Owner -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Penanggung Jawab</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ currentShift.shift_owner?.name || '-' }}
          </div>
        </div>

        <!-- Created At -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Waktu Dibuat</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ currentShift.created_at ? formatDateTime(currentShift.created_at) : '-' }}
          </div>
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
          <div>
            <Tag
              :value="currentShift.status === 'open' ? 'BUKA' : 'TUTUP'"
              :severity="currentShift.status === 'open' ? 'success' : 'secondary'"
            />
          </div>
        </div>
      </div>

      <Divider />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <!-- Participant Count -->
        <div class="p-4 flex flex-row xl:flex-col gap-2 justify-between items-center rounded-lg bg-gray-50 dark:bg-dark">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Kasir Bertugas</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ currentShift.participant_count || 0 }}
          </div>
        </div>

        <!-- Total Transactions -->
        <div class="p-4 flex flex-row xl:flex-col gap-2 justify-between items-center rounded-lg bg-gray-50 dark:bg-dark">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transaksi</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ currentShift.total_transactions || 0 }}
          </div>
        </div>

        <!-- Shift Time -->
        <div class="p-4 flex flex-row xl:flex-col gap-2 justify-between items-center rounded-lg bg-gray-50 dark:bg-dark">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Waktu Kasir Buka</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ formatRangeTime(currentShift.start_time, currentShift.end_time) }}
          </div>
        </div>
      </div>

      <Divider />

      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div v-for="item in cashItems" :key="item.label" class="space-y-1">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ item.label }}</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">{{ item.value }}</div>
        </div>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCash } from '@/modules/shift/services/cash.ts';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import { formatDateTime, formatRangeTime } from '@umkm-pos/ui/helpers/utils';

const props = defineProps({
  currentShift: {
    type: Object,
    required: true
  }
})

const cashItems = computed(() => [
  { label: 'Kas Awal', value: formatCash(props.currentShift.opening_cash) },
  { label: 'Kas Masuk', value: formatCash(props.currentShift.total_cash_in ?? 0) },
  { label: 'Kas Keluar', value: formatCash(props.currentShift.total_cash_out ?? 0) },
  { label: 'Kas Seharusnya', value: formatCash(props.currentShift.expected_cash) },
  { label: 'Kas Akhir', value: formatCash(props.currentShift.closing_cash) },
  { label: 'Selisih', value: formatCash(props.currentShift.cash_difference) },
]);
</script>

<style scoped>
@import "tailwindcss";
@import "@umkm-pos/ui/styles/themes.css";
</style>
