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

    <!-- Summary Stats -->
    <SummaryStats
      :sales-today="salesToday"
      :transactions-today="transactionsToday"
      :low-stock-count="lowStockCount"
      :active-shifts-count="activeShiftsCount"
      :loading="statsLoading"
    />

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
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { showToast } from '@/helpers/toast.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import { 
  getSalesSummary,
  getDailyReports,
  getTopProducts,
  getOutletComparison,
} from '@/modules/dashboard/services/api.ts';
import { getListInventory } from '@/modules/stock/services/api.ts';
import { getListShift } from '@/modules/shift/services/api.ts';
import SalesSummaryChart from '@/modules/dashboard/components/SalesSummaryChart.vue';
import DailyReportsChart from '@/modules/dashboard/components/DailyReportsChart.vue';
import TopProductsChart from '@/modules/dashboard/components/TopProductsChart.vue';
import OutletComparisonChart from '@/modules/dashboard/components/OutletComparisonChart.vue';
import SummaryStats from '@/modules/dashboard/components/SummaryStats.vue';

// Date range state
const dateRange = ref<Date[] | null>(null);
const dateRangeError = ref<string | null>(null);

// Summary stats states
const salesToday = ref<number>(0);
const transactionsToday = ref<number>(0);
const lowStockCount = ref<number>(0);
const activeShiftsCount = ref<number>(0);
const statsLoading = ref<boolean>(false);

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

// Error states
const salesSummaryError = ref<string | null>(null);
const dailyReportsError = ref<string | null>(null);
const topProductsError = ref<string | null>(null);
const outletComparisonError = ref<string | null>(null);

const outlet = getOutlet();

let fetchReportsRequestId = 0;
let activeReportsRequests = 0;

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

  const [start, end] = dateRange.value ?? [];

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
 * Fetch summary stats (Sales Today, Transactions Today, Low Stock Items, Active Shifts)
 */
const fetchSummaryStats = async () => {
  statsLoading.value = true;
  showLoading();
  try {
    const todayStr = formatDate(new Date());
    
    // Fetch sales summary for today
    const summaryParams = {
      date_from: todayStr,
      date_to: todayStr,
      outlet_id: outlet?.id,
    };

    // Fetch low stock inventory count
    const inventoryParams = {
      outlet_id: outlet?.id,
      low_stock_only: 'true',
      limit: 1, // We only need the total count from metadata
    };

    // Fetch active shifts
    const shiftParams = {
      outlet_id: outlet?.id,
      status: 'open',
      limit: 1, // We only need the total count from metadata
    };

    const [summaryRes, inventoryRes, shiftsRes] = await Promise.allSettled([
      getSalesSummary(summaryParams),
      getListInventory(inventoryParams),
      getListShift(shiftParams),
    ]);

    if (summaryRes.status === 'fulfilled') {
      salesToday.value = summaryRes.value.total_sales;
      transactionsToday.value = summaryRes.value.total_transactions;
    } else {
      console.error('Failed to fetch today\'s sales summary:', summaryRes.reason);
      showToast({
        type: 'error',
        title: 'Error.',
        message: getErrorMessage(summaryRes.reason) || 'Failed to fetch today\'s sales summary',
      });
      salesToday.value = 0;
      transactionsToday.value = 0;
    }

    if (inventoryRes.status === 'fulfilled') {
      lowStockCount.value = inventoryRes.value.data?.data?.meta?.total ?? 0;
    } else {
      console.error('Failed to fetch low stock count:', inventoryRes.reason);
      showToast({
        type: 'error',
        title: 'Error.',
        message: getErrorMessage(inventoryRes.reason) || 'Failed to fetch low stock count',
      });
      lowStockCount.value = 0;
    }

    if (shiftsRes.status === 'fulfilled') {
      activeShiftsCount.value = shiftsRes.value.data?.data?.meta?.total ?? 0;
    } else {
      console.error('Failed to fetch active shifts count:', shiftsRes.reason);
      showToast({
        type: 'error',
        title: 'Error.',
        message: getErrorMessage(shiftsRes.reason) || 'Failed to fetch active shifts count',
      });
      activeShiftsCount.value = 0;
    }
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    showToast({
      type: 'error',
      title: 'Error.',
      message: getErrorMessage(error) || 'Error fetching summary stats',
    });
  } finally {
    statsLoading.value = false;
    hideLoading();
  } 
};

/**
 * Fetch all reports data from API endpoints
 * Each endpoint is called independently with individual error handling
 * All requests are made in parallel for better performance
 */
const fetchAllReports = async () => {
  if (!params.value) {
    return;
  }

  fetchReportsRequestId++;
  const requestId = fetchReportsRequestId;

  // Set all loading states to true
  salesSummaryLoading.value = true;
  dailyReportsLoading.value = true;
  topProductsLoading.value = true;
  outletComparisonLoading.value = true;

  // Clear all error states
  salesSummaryError.value = null;
  dailyReportsError.value = null;
  topProductsError.value = null;
  outletComparisonError.value = null;

  if (activeReportsRequests === 0) {
    showLoading();
  }
  activeReportsRequests++;

  try {
    const results = await Promise.allSettled([
      getSalesSummary(params.value),
      getDailyReports(params.value),
      getTopProducts({ ...params.value, limit: 10 }),
      getOutletComparison(params.value),
    ]);

    if (requestId !== fetchReportsRequestId) {
      return;
    }

    // Handle sales summary result
    if (results[0].status === 'fulfilled') {
      salesSummaryData.value = results[0].value;
    } else {
      salesSummaryError.value = getErrorMessage(results[0].reason) || 'Failed to fetch sales summary';
      salesSummaryData.value = null;
      showToast({
        type: 'error',
        title: 'Gagal memuat Sales Summary',
        message: getErrorMessage(results[0].reason) || 'Failed to fetch sales summary',
      });
    }
    salesSummaryLoading.value = false;

    // Handle daily reports result
    if (results[1].status === 'fulfilled') {
      dailyReportsData.value = results[1].value;
    } else {
      dailyReportsError.value = getErrorMessage(results[1].reason) || 'Failed to fetch daily reports';
      dailyReportsData.value = null;
      showToast({
        type: 'error',
        title: 'Gagal memuat Daily Sales Trends',
        message: getErrorMessage(results[1].reason) || 'Failed to fetch daily reports',
      });
    }
    dailyReportsLoading.value = false;

    // Handle top products result
    if (results[2].status === 'fulfilled') {
      topProductsData.value = results[2].value;
    } else {
      topProductsError.value = getErrorMessage(results[2].reason) || 'Failed to fetch top products';
      topProductsData.value = null;
      showToast({
        type: 'error',
        title: 'Gagal memuat Top Products',
        message: getErrorMessage(results[2].reason) || 'Failed to fetch top products',
      });
    }
    topProductsLoading.value = false;

    // Handle outlet comparison result
    if (results[3].status === 'fulfilled') {
      outletComparisonData.value = results[3].value;
    } else {
      outletComparisonError.value = getErrorMessage(results[3].reason) || 'Failed to fetch outlet comparison';
      outletComparisonData.value = null;
      showToast({
        type: 'error',
        title: 'Gagal memuat Outlet Comparison',
        message: getErrorMessage(results[3].reason) || 'Failed to fetch outlet comparison',
      });
    }
    outletComparisonLoading.value = false;
  } finally {
    activeReportsRequests--;
    if (activeReportsRequests === 0) {
      hideLoading();
    }
  }
};

/**
 * Retry functions for each chart
 */
const retrySalesSummary = async () => {
  if (!params.value) return;
  
  salesSummaryLoading.value = true;
  salesSummaryError.value = null;

  showLoading();
  try {
    salesSummaryData.value = await getSalesSummary(params.value);
  } catch (error) {
    salesSummaryError.value = getErrorMessage(error) || 'Failed to fetch sales summary';
    salesSummaryData.value = null;
    showToast({
      type: 'error',
      title: 'Gagal memuat Sales Summary',
      message: getErrorMessage(error) || 'Failed to fetch sales summary',
    });
  } finally {
    salesSummaryLoading.value = false;
    hideLoading();
  }
};

const retryDailyReports = async () => {
  if (!params.value) return;
  
  dailyReportsLoading.value = true;
  dailyReportsError.value = null;

  showLoading();
  try {
    dailyReportsData.value = await getDailyReports(params.value);
  } catch (error) {
    dailyReportsError.value = getErrorMessage(error) || 'Failed to fetch daily reports';
    dailyReportsData.value = null;
    showToast({
      type: 'error',
      title: 'Gagal memuat Daily Sales Trends',
      message: getErrorMessage(error) || 'Failed to fetch daily reports',
    });
  } finally {
    dailyReportsLoading.value = false;
    hideLoading();
  }
};

const retryTopProducts = async () => {
  if (!params.value) return;
  
  topProductsLoading.value = true;
  topProductsError.value = null;

  showLoading();
  try {
    topProductsData.value = await getTopProducts({
      ...params.value,
      limit: 10
    });
  } catch (error) {
    topProductsError.value = getErrorMessage(error) || 'Failed to fetch top products';
    topProductsData.value = null;
    showToast({
      type: 'error',
      title: 'Gagal memuat Top Products',
      message: getErrorMessage(error) || 'Failed to fetch top products',
    });
  } finally {
    topProductsLoading.value = false;
    hideLoading();
  }
};

const retryOutletComparison = async () => {
  if (!params.value) return;
  
  outletComparisonLoading.value = true;
  outletComparisonError.value = null;

  showLoading();
  try {
    outletComparisonData.value = await getOutletComparison(params.value);
  } catch (error) {
    outletComparisonError.value = getErrorMessage(error) || 'Failed to fetch outlet comparison';
    outletComparisonData.value = null;
    showToast({
      type: 'error',
      title: 'Gagal memuat Outlet Comparison',
      message: getErrorMessage(error) || 'Failed to fetch outlet comparison',
    });
  } finally {
    outletComparisonLoading.value = false;
    hideLoading();
  }
};

/**
 * Watch for date range changes and validate
 */
watch(dateRange, () => {
  if (dateRange.value && dateRange.value.length === 2) {
    const isValid = validateDateRange();
    if (isValid) {
      fetchAllReports();
    }
  }
});

onMounted(() => {
  initializeDateRange();
  fetchSummaryStats();
});
</script>

<style scoped></style>
