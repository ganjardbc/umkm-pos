<template>
  <div class="w-full space-y-4">
    <!-- Page Header -->
    <DatePicker
      v-model="dateRange"
      selection-mode="range"
      :max-date="new Date()"
      date-format="yy-mm-dd"
      show-button-bar
      :manual-input="false"
      placeholder="Pilih rentang tanggal"
      showIcon
      class="w-full"
    />
    <!-- <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
      <h1 class="flex-1 text-lg font-bold">Reports</h1>

      <div class="flex flex-col lg:flex-row gap-4">
      </div>
    </div> -->

    <!-- Validation Error Message -->
    <Message
      v-if="dateRangeError"
      severity="error"
      size="small"
      variant="simple"
    >
      {{ dateRangeError }}
    </Message>

    <!-- Report Cards Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Sales Summary Card -->
      <ReportCard
        title="Ringkasan Penjualan"
        description="Total pendapatan, transaksi, dan rata-rata nilai pesanan"
        :loading="summaryLoading"
        :error="summaryError"
        @download="downloadSummary"
      />

      <!-- Daily Reports Card -->
      <ReportCard
        title="Laporan Harian"
        description="Tren penjualan harian dan data transaksi"
        :loading="dailyLoading"
        :error="dailyError"
        @download="downloadDaily"
      />

      <!-- Top Products Card -->
      <ReportCard
        title="Produk Terlaris"
        description="Produk terlaris berdasarkan pendapatan (10 Teratas)"
        :loading="productsLoading"
        :error="productsError"
        @download="downloadTopProducts"
      />

      <!-- Outlet Comparison Card -->
      <ReportCard
        title="Perbandingan Outlet"
        description="Pendapatan dan jumlah transaksi per outlet"
        :loading="outletsLoading"
        :error="outletsError"
        @download="downloadOutletComparison"
      />

      <!-- Transaction Report Card -->
      <ReportCard
        title="Laporan Transaksi"
        description="Riwayat transaksi detail dengan metode pembayaran dan status"
        :loading="transactionsLoading"
        :error="transactionsError"
        @download="downloadTransactions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import ReportCard from '@/modules/reports/components/ReportCard.vue';
import {
  exportSummary,
  exportDailyReports,
  exportTopProducts,
  exportOutletComparison,
  exportTransactionsCsv,
} from '@/modules/reports/services/api.ts';
import { downloadFile } from '@umkm-pos/ui/helpers/download';
import { useDateRange } from '@/modules/reports/composables/useDateRange.ts';

const { dateRange, dateRangeError, params } = useDateRange();

// Loading states
const summaryLoading = ref(false);
const dailyLoading = ref(false);
const productsLoading = ref(false);
const outletsLoading = ref(false);
const transactionsLoading = ref(false);

// Error states
const summaryError = ref<string | null>(null);
const dailyError = ref<string | null>(null);
const productsError = ref<string | null>(null);
const outletsError = ref<string | null>(null);
const transactionsError = ref<string | null>(null);

/**
 * Download handlers
 */
const downloadSummary = async () => {
  if (!params.value) return;

  try {
    summaryLoading.value = true;
    summaryError.value = null;
    const blob = await exportSummary(params.value);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(blob, `Sales_Summary_${timestamp}.xlsx`);
  } catch (error) {
    summaryError.value = error instanceof Error ? error.message : 'Gagal mengunduh';
  } finally {
    summaryLoading.value = false;
  }
};

const downloadDaily = async () => {
  if (!params.value) return;

  try {
    dailyLoading.value = true;
    dailyError.value = null;
    const blob = await exportDailyReports(params.value);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(blob, `Daily_Reports_${timestamp}.xlsx`);
  } catch (error) {
    dailyError.value = error instanceof Error ? error.message : 'Gagal mengunduh';
  } finally {
    dailyLoading.value = false;
  }
};

const downloadTopProducts = async () => {
  if (!params.value) return;

  try {
    productsLoading.value = true;
    productsError.value = null;
    const blob = await exportTopProducts({ ...params.value, limit: 10 });
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(blob, `Top_Products_${timestamp}.xlsx`);
  } catch (error) {
    productsError.value = error instanceof Error ? error.message : 'Gagal mengunduh';
  } finally {
    productsLoading.value = false;
  }
};

const downloadOutletComparison = async () => {
  if (!params.value) return;

  try {
    outletsLoading.value = true;
    outletsError.value = null;
    const blob = await exportOutletComparison(params.value);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(blob, `Outlet_Comparison_${timestamp}.xlsx`);
  } catch (error) {
    outletsError.value = error instanceof Error ? error.message : 'Gagal mengunduh';
  } finally {
    outletsLoading.value = false;
  }
};

const downloadTransactions = async () => {
  if (!params.value) return;

  try {
    transactionsLoading.value = true;
    transactionsError.value = null;
    const blob = await exportTransactionsCsv(params.value);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(blob, `Transaction_Report_${timestamp}.csv`);
  } catch (error) {
    transactionsError.value = error instanceof Error ? error.message : 'Gagal mengunduh';
  } finally {
    transactionsLoading.value = false;
  }
};
</script>

<style scoped></style>
