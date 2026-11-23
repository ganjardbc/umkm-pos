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

    <template v-else-if="summary">
      <ReportTotals :items="totals" />

      <UiCard>
        <h2 class="text-lg font-semibold">Penjualan Harian</h2>
        <DataTable :value="daily" size="small" scrollable>
          <template #empty>Belum ada transaksi pada rentang ini.</template>
          <Column header="Tanggal"><template #body="{ data }">{{ formatDate(data.report_date) }}</template></Column>
          <Column header="Transaksi" field="total_transactions" />
          <Column header="Penjualan"><template #body="{ data }">{{ formatPrice(data.total_sales) }}</template></Column>
        </DataTable>
      </UiCard>

      <UiCard>
        <h2 class="text-lg font-semibold">Produk Terlaris</h2>
        <DataTable :value="products" size="small" scrollable>
          <template #empty>Belum ada penjualan produk pada rentang ini.</template>
          <Column header="#"><template #body="{ index }">{{ index + 1 }}</template></Column>
          <Column header="Produk" field="product_name" />
          <Column header="Terjual" field="total_qty" />
          <Column header="Pendapatan"><template #body="{ data }">{{ formatPrice(data.total_revenue) }}</template></Column>
        </DataTable>
      </UiCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDateRange } from '@/modules/reports/composables/useDateRange.ts';
import { getSummary, getDailySales, getTopProducts } from '@/modules/reports/services/api.ts';
import ReportTotals from '@/modules/reports/components/ReportTotals.vue';
import { formatDate, formatPrice, getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';

const { dateRange, dateRangeError, params } = useDateRange();
const loading = ref(false);
const summary = ref<any>(null);
const daily = ref<any[]>([]);
const products = ref<any[]>([]);

const totals = computed(() => [
  { label: 'Total Penjualan', value: formatPrice(summary.value.total_sales) },
  { label: 'Total Transaksi', value: String(summary.value.total_transactions) },
  { label: 'Rata-rata Penjualan / Hari', value: formatPrice(summary.value.avg_daily_sales) },
  { label: 'Rata-rata Transaksi / Hari', value: summary.value.avg_daily_transactions.toFixed(1) },
]);

// Re-runs whenever a complete, valid range is picked (params is null while only the start date is set).
watch(params, async (p) => {
  if (!p || dateRangeError.value) return;
  try {
    loading.value = true;
    [summary.value, daily.value, products.value] = await Promise.all([
      getSummary(p),
      getDailySales(p),
      getTopProducts({ ...p, limit: 10 }),
    ]);
  } catch (error) {
    showToast({ type: 'error', title: 'Gagal', message: getErrorMessage(error) || 'Terjadi kesalahan saat memuat laporan.' });
  } finally {
    loading.value = false;
  }
});
</script>
