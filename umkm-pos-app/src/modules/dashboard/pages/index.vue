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

    <!-- Validation Error Message -->
    <Message 
      v-if="dateRangeError" 
      severity="error" 
      size="small"
      variant="simple"
    >
      {{ dateRangeError }}
    </Message>

    <!-- Sales Summary Chart -->
    <SalesSummaryChart
      :data="salesSummaryData"
      :loading="salesSummaryLoading"
      :error="salesSummaryError"
      title="Sales Summary"
      @retry="retrySalesSummary"
    />

    <!-- Daily Reports Chart - Wider -->
    <DailyReportsChart
      :data="dailyReportsData"
      :loading="dailyReportsLoading"
      :error="dailyReportsError"
      title="Daily Sales Trends"
      @retry="retryDailyReports"
    />

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <!-- Top Products Chart -->
      <TopProductsChart
        :data="topProductsData"
        :loading="topProductsLoading"
        :error="topProductsError"
        title="Top Products"
        @retry="retryTopProducts"
      />

      <!-- Outlet Comparison Chart -->
      <OutletComparisonChart
        :data="outletComparisonData"
        :loading="outletComparisonLoading"
        :error="outletComparisonError"
        title="Outlet Comparison"
        @retry="retryOutletComparison"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  SalesSummaryResponse,
  DailyReportsResponse,
  TopProductsResponse,
  OutletComparisonResponse,
} from '@/modules/dashboard/types/reports.ts';
import { ref, computed, onMounted, watch } from 'vue';
import { getOutlet } from '@/helpers/auth.ts';
import {
  getSalesSummary,
  getDailyReports,
  getTopProducts,
  getOutletComparison,
} from '@/modules/dashboard/services/api.ts';
import SalesSummaryChart from '@/modules/dashboard/components/SalesSummaryChart.vue';
import DailyReportsChart from '@/modules/dashboard/components/DailyReportsChart.vue';
import TopProductsChart from '@/modules/dashboard/components/TopProductsChart.vue';
import OutletComparisonChart from '@/modules/dashboard/components/OutletComparisonChart.vue';

// Date range state
const dateRange = ref<Date[] | null>(null);
const dateRangeError = ref<string | null>(null);

// Chart data states
const salesSummaryData = ref<SalesSummaryResponse['data'] | null>(null);
const dailyReportsData = ref<DailyReportsResponse['data'] | null>(null);
const topProductsData = ref<TopProductsResponse['data'] | null>(null);
const outletComparisonData = ref<OutletComparisonResponse['data'] | null>(null);
// const dashboardOverviewData = ref<DashboardResponse['data'] | null>(null);

// Loading states
const salesSummaryLoading = ref<boolean>(false);
const dailyReportsLoading = ref<boolean>(false);
const topProductsLoading = ref<boolean>(false);
const outletComparisonLoading = ref<boolean>(false);
const dashboardOverviewLoading = ref<boolean>(false);

// Error states
const salesSummaryError = ref<string | null>(null);
const dailyReportsError = ref<string | null>(null);
const topProductsError = ref<string | null>(null);
const outletComparisonError = ref<string | null>(null);
const dashboardOverviewError = ref<string | null>(null);

const outlet = getOutlet();

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
 * Returns true if valid, false otherwise and sets error message
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
 * Fetch all reports data from API endpoints
 * Each endpoint is called independently with individual error handling
 * All requests are made in parallel for better performance
 */
const fetchAllReports = async () => {
  if (!params.value) {
    return;
  }

  // Set all loading states to true
  salesSummaryLoading.value = true;
  dailyReportsLoading.value = true;
  topProductsLoading.value = true;
  outletComparisonLoading.value = true;
  dashboardOverviewLoading.value = true;

  // Clear all error states
  salesSummaryError.value = null;
  dailyReportsError.value = null;
  topProductsError.value = null;
  outletComparisonError.value = null;
  dashboardOverviewError.value = null;

  // Fetch all endpoints in parallel
  const results = await Promise.allSettled([
    getSalesSummary(params.value),
    getDailyReports(params.value),
    getTopProducts({ ...params.value, limit: 10 }),
    getOutletComparison(params.value),
  ]);

  // Handle sales summary result
  if (results[0].status === 'fulfilled') {
    salesSummaryData.value = results[0].value;
  } else {
    salesSummaryError.value = results[0].reason instanceof Error 
      ? results[0].reason.message 
      : 'Failed to fetch sales summary';
    salesSummaryData.value = null;
  }
  salesSummaryLoading.value = false;

  // Handle daily reports result
  if (results[1].status === 'fulfilled') {
    dailyReportsData.value = results[1].value;
  } else {
    dailyReportsError.value = results[1].reason instanceof Error 
      ? results[1].reason.message 
      : 'Failed to fetch daily reports';
    dailyReportsData.value = null;
  }
  dailyReportsLoading.value = false;

  // Handle top products result
  if (results[2].status === 'fulfilled') {
    topProductsData.value = results[2].value;
  } else {
    topProductsError.value = results[2].reason instanceof Error 
      ? results[2].reason.message 
      : 'Failed to fetch top products';
    topProductsData.value = null;
  }
  topProductsLoading.value = false;

  // Handle outlet comparison result
  if (results[3].status === 'fulfilled') {
    outletComparisonData.value = results[3].value;
  } else {
    outletComparisonError.value = results[3].reason instanceof Error 
      ? results[3].reason.message 
      : 'Failed to fetch outlet comparison';
    outletComparisonData.value = null;
  }
  outletComparisonLoading.value = false;
};

/**
 * Computed property for formatted date range (for API calls)
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
 * Retry functions for each chart
 */
const retrySalesSummary = async () => {
  if (!params.value) return;
  
  salesSummaryLoading.value = true;
  salesSummaryError.value = null;
  
  try {
    salesSummaryData.value = await getSalesSummary(params.value);
  } catch (error) {
    salesSummaryError.value = error instanceof Error 
      ? error.message 
      : 'Failed to fetch sales summary';
    salesSummaryData.value = null;
  } finally {
    salesSummaryLoading.value = false;
  }
};

const retryDailyReports = async () => {
  if (!params.value) return;
  
  dailyReportsLoading.value = true;
  dailyReportsError.value = null;
  
  try {
    dailyReportsData.value = await getDailyReports(params.value);
  } catch (error) {
    dailyReportsError.value = error instanceof Error 
      ? error.message 
      : 'Failed to fetch daily reports';
    dailyReportsData.value = null;
  } finally {
    dailyReportsLoading.value = false;
  }
};

const retryTopProducts = async () => {
  if (!params.value) return;
  
  topProductsLoading.value = true;
  topProductsError.value = null;
  
  try {
    topProductsData.value = await getTopProducts({ 
      ...params.value, 
      limit: 10 
    });
  } catch (error) {
    topProductsError.value = error instanceof Error 
      ? error.message 
      : 'Failed to fetch top products';
    topProductsData.value = null;
  } finally {
    topProductsLoading.value = false;
  }
};

const retryOutletComparison = async () => {
  if (!params.value) return;
  
  outletComparisonLoading.value = true;
  outletComparisonError.value = null;
  
  try {
    outletComparisonData.value = await getOutletComparison(params.value);
  } catch (error) {
    outletComparisonError.value = error instanceof Error 
      ? error.message 
      : 'Failed to fetch outlet comparison';
    outletComparisonData.value = null;
  } finally {
    outletComparisonLoading.value = false;
  }
};

/**
 * Watch for date range changes and validate
 */
watch(dateRange, () => {
  if (dateRange.value && dateRange.value.length === 2) {
    const isValid = validateDateRange();
    
    if (isValid) {
      // Trigger API calls when date range is valid
      fetchAllReports();
    }
  }
}, { deep: true });

/**
 * Initialize on component mount
 */
onMounted(() => {
  initializeDateRange();
  // The watch will automatically trigger fetchAllReports when dateRange is set
});
</script>

<style scoped></style>
