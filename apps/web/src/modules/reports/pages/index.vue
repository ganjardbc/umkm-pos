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
      placeholder="Select date range"
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
        title="Sales Summary"
        description="Total revenue, transactions, and average order value"
        :loading="summaryLoading"
        :error="summaryError"
        @download="downloadSummary"
      />

      <!-- Daily Reports Card -->
      <ReportCard
        title="Daily Reports"
        description="Daily sales trends and transaction data"
        :loading="dailyLoading"
        :error="dailyError"
        @download="downloadDaily"
      />

      <!-- Top Products Card -->
      <ReportCard
        title="Top Products"
        description="Best-selling products by revenue (Top 10)"
        :loading="productsLoading"
        :error="productsError"
        @download="downloadTopProducts"
      />

      <!-- Outlet Comparison Card -->
      <ReportCard
        title="Outlet Comparison"
        description="Revenue and transaction count per outlet"
        :loading="outletsLoading"
        :error="outletsError"
        @download="downloadOutletComparison"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import ReportCard from '@/modules/reports/components/ReportCard.vue';
import {
  exportSummary,
  exportDailyReports,
  exportTopProducts,
  exportOutletComparison,
} from '@/modules/reports/services/api.ts';
import { downloadFile } from '@/helpers/download.ts';
import { getOutlet } from '@/helpers/auth.ts';

const outlet = getOutlet();

// Date range state
const dateRange = ref<Date[] | null>(null);
const dateRangeError = ref<string | null>(null);

// Loading states
const summaryLoading = ref(false);
const dailyLoading = ref(false);
const productsLoading = ref(false);
const outletsLoading = ref(false);

// Error states
const summaryError = ref<string | null>(null);
const dailyError = ref<string | null>(null);
const productsError = ref<string | null>(null);
const outletsError = ref<string | null>(null);

/**
 * Format a Date object to YYYY-MM-DD format for API calls
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Initialize date range to last 30 days
 */
const initializeDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  dateRange.value = [start, end];
};

/**
 * Validate date range
 */
const validateDateRange = (): boolean => {
  dateRangeError.value = null;

  if (!dateRange.value || dateRange.value.length !== 2) {
    dateRangeError.value = 'Please select both start and end dates';
    return false;
  }

  const [start, end] = dateRange.value;

  if (!start || !end) {
    dateRangeError.value = 'Please select both start and end dates';
    return false;
  }

  if (start > end) {
    dateRangeError.value = 'Start date must be before or equal to end date';
    return false;
  }

  if (end > new Date()) {
    dateRangeError.value = 'End date cannot be in the future';
    return false;
  }

  return true;
};

/**
 * Computed property for formatted date range
 */
const formattedDateRange = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return null;
  }

  const [start, end] = dateRange.value;

  if (!start || !end) {
    return null;
  }

  return {
    date_from: formatDate(start),
    date_to: formatDate(end),
  };
});

/**
 * Build query parameters
 */
const params = computed(() => {
  if (!formattedDateRange.value) {
    return null;
  }

  return {
    ...formattedDateRange.value,
    outlet_id: outlet?.id,
  };
});

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
    summaryError.value = error instanceof Error ? error.message : 'Download failed';
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
    dailyError.value = error instanceof Error ? error.message : 'Download failed';
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
    productsError.value = error instanceof Error ? error.message : 'Download failed';
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
    outletsError.value = error instanceof Error ? error.message : 'Download failed';
  } finally {
    outletsLoading.value = false;
  }
};

/**
 * Watch for date range changes
 */
watch(dateRange, () => {
  if (dateRange.value && dateRange.value.length === 2) {
    validateDateRange();
  }
}, { deep: true });

/**
 * Initialize on component mount
 */
onMounted(() => {
  initializeDateRange();
});
</script>

<style scoped></style>
