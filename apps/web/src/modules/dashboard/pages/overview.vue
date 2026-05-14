<template>
  <div class="w-full space-y-4">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <h1 class="flex-1 text-2xl font-bold">Overview</h1>

      <DatePicker
        v-model="dateRange"
        selection-mode="range"
        :max-date="new Date()"
        date-format="yy-mm-dd"
        show-button-bar
        :manual-input="false"
        placeholder="Select date range"
        showIcon
        class="w-full md:w-80"
      />
    </div>

    <!-- Validation Error Message -->
    <Message 
      v-if="dateRangeError" 
      severity="error" 
      size="small"
      variant="simple"
    >
      {{ dateRangeError }}
    </Message>

    <!-- Dashboard Overview Chart - Full Width -->
    <DashboardOverviewChart
      :data="dashboardOverviewData"
      :loading="dashboardOverviewLoading"
      :error="dashboardOverviewError"
      title="Dashboard Overview"
      @retry="retryDashboardOverview"
    />
  </div>
</template>

<script setup lang="ts">
import type { DashboardResponse } from '@/modules/dashboard/types/reports.ts';
import { ref, computed, onMounted, watch } from 'vue';
import { getOutlet } from '@/helpers/auth.ts';
import { getDashboardData } from '@/modules/dashboard/services/api';
import DashboardOverviewChart from '@/modules/dashboard/components/DashboardOverviewChart.vue';

// Date range state
const dateRange = ref<Date[] | null>(null);
const dateRangeError = ref<string | null>(null);

// Chart data states
const dashboardOverviewData = ref<DashboardResponse['data'] | null>(null);

// Loading states
const dashboardOverviewLoading = ref<boolean>(false);

// Error states
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

/**
 * Fetch all reports data from API endpoints
 * Each endpoint is called independently with individual error handling
 * All requests are made in parallel for better performance
 */
const fetchAllReports = async () => {
  if (!formattedDateRange.value) {
    return;
  }

  const params = {
    ...formattedDateRange.value,
    outlet_id: outlet?.id,
  };

  // Set all loading states to true
  dashboardOverviewLoading.value = true;

  // Clear all error states
  dashboardOverviewError.value = null;

  // Fetch all endpoints in parallel
  const results = await Promise.allSettled([
    getDashboardData({ ...params, limit: 10 }),
  ]);

  // Handle dashboard overview result
  if (results[0].status === 'fulfilled') {
    dashboardOverviewData.value = results[0].value;
  } else {
    dashboardOverviewError.value = results[0].reason instanceof Error 
      ? results[0].reason.message 
      : 'Failed to fetch dashboard overview';
    dashboardOverviewData.value = null;
  }
  dashboardOverviewLoading.value = false;
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

const retryDashboardOverview = async () => {
  if (!formattedDateRange.value) return;
  
  dashboardOverviewLoading.value = true;
  dashboardOverviewError.value = null;
  
  try {
    dashboardOverviewData.value = await getDashboardData({ 
      ...formattedDateRange.value, 
      limit: 10 
    });
  } catch (error) {
    dashboardOverviewError.value = error instanceof Error 
      ? error.message 
      : 'Failed to fetch dashboard overview';
    dashboardOverviewData.value = null;
  } finally {
    dashboardOverviewLoading.value = false;
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
