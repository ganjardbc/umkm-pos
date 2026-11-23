<template>
  <div class="w-full space-y-4">
    <DatePicker
      v-model="dateRange"
      selection-mode="range"
      :max-date="new Date()"
      date-format="yy-mm-dd"
      show-button-bar
      :manual-input="false"
      placeholder="Pilih rentang tanggal"
      show-icon
      class="w-full"
    />
    <Message v-if="dateRangeError" severity="error" size="small" variant="simple">{{ dateRangeError }}</Message>

    <UiLoading v-if="loading" message="Memuat laporan..." />

    <UiCard v-else>
      <h2 class="text-lg font-semibold">Perbandingan Outlet</h2>
      <DataTable :value="rows" size="small" scrollable>
        <template #empty>Belum ada transaksi pada rentang ini.</template>
        <Column header="Outlet" field="outlet_name" />
        <Column header="Transaksi" field="total_transactions" />
        <Column header="Pendapatan"><template #body="{ data }">{{ formatPrice(data.total_revenue) }}</template></Column>
      </DataTable>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDateRange } from '@/modules/reports/composables/useDateRange.ts';
import { getOutletComparison } from '@/modules/reports/services/api.ts';
import { formatPrice, getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';

const { dateRange, dateRangeError, params } = useDateRange();
const loading = ref(false);
const rows = ref<any[]>([]);

watch(params, async (p) => {
  if (!p || dateRangeError.value) return;
  try {
    loading.value = true;
    rows.value = await getOutletComparison(p);
  } catch (error) {
    showToast({ type: 'error', title: 'Gagal', message: getErrorMessage(error) || 'Terjadi kesalahan saat memuat laporan.' });
  } finally {
    loading.value = false;
  }
});
</script>
