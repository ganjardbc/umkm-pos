<template>
  <UiCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <Button
          severity="secondary"
          variant="outlined"
          icon="pi pi-download"
          :loading="isExporting"
          :disabled="isExporting"
          @click="handleExport"
        />
      </div>
    </template>

    <!-- Loading State -->
    <ChartLoadingState v-if="loading" />

    <!-- Error State -->
    <ChartErrorState v-else-if="error" :error="error" @retry="handleRetry" />

    <!-- Data Display -->
    <div v-else-if="data" class="relative grid grid-cols-1 lg:grid-cols-4 gap-4">
      <!-- Metrics Cards -->
      <div class="col-span-2 grid grid-cols-2 gap-4">
        <div class="bg-blue-50 dark:bg-dark! rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Total Sales</p>
          <p class="text-xl md:text-2xl font-bold text-blue-600">
            {{ formatCurrency(data?.total_sales) }}
          </p>
        </div>

        <div class="bg-green-50 dark:bg-dark! rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Total Transactions</p>
          <p class="text-xl md:text-2xl font-bold text-green-600">
            {{ formatNumber(data?.total_transactions) }}
          </p>
        </div>

        <div class="bg-amber-50 dark:bg-dark! rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Avg Daily Sales</p>
          <p class="text-xl md:text-2xl font-bold text-amber-600">
            {{ formatCurrency(data?.avg_daily_sales) }}
          </p>
        </div>

        <div class="bg-purple-50 dark:bg-dark! rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Avg Daily Transactions</p>
          <p class="text-xl md:text-2xl font-bold text-purple-600">
            {{ formatNumber(data?.avg_daily_transactions) }}
          </p>
        </div>
      </div>

      <!-- Chart -->
      <div class="relative col-span-2 flex justify-center mx-auto">
        <canvas v-if="isCanViewChart" ref="chartCanvas"></canvas>
        <ChartEmptyState v-else icon="pi-chart-pie" class="py-12" />
      </div>
    </div>
  </UiCard>
</template>
<script setup lang="ts">
import type { SalesSummaryResponse } from '../types/reports';
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { Chart, registerables } from 'chart.js';
import UiCard from '@/components/UiCard.vue';
import ChartLoadingState from './ChartLoadingState.vue';
import ChartErrorState from './ChartErrorState.vue';
import ChartEmptyState from './ChartEmptyState.vue';
import { exportSummary } from '@/modules/reports/services/api.ts';
import { downloadFile } from '@/helpers/download.ts';
import { getOutlet } from '@/helpers/auth.ts';

// Register Chart.js components
Chart.register(...registerables);

interface Props {
  data: SalesSummaryResponse['data'] | null;
  loading: boolean;
  error: string | null;
  title: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  retry: [];
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
const isExporting = ref(false);
const exportError = ref<string | null>(null);

const outlet = getOutlet();

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const handleExport = async () => {
  if (!props.data) return;
  
  try {
    isExporting.value = true;
    exportError.value = null;
    
    // Get date range from parent or use default
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    const params = {
      date_from: start.toISOString().split('T')[0],
      date_to: end.toISOString().split('T')[0],
      outlet_id: outlet?.id,
    };
    
    const blob = await exportSummary(params);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(blob, `Sales_Summary_${timestamp}.xlsx`);
  } catch (error) {
    exportError.value = error instanceof Error ? error.message : 'Export failed';
  } finally {
    isExporting.value = false;
  }
};

const isCanViewChart = computed(() => {
  if (!props.data) return false;

  return (
    props.data?.total_sales ||
    props.data?.avg_daily_sales ||
    props.data?.total_transactions
  ) ? true : false;
});

const initializeChart = () => {
  if (!chartCanvas.value || !props.data) return;

  // Destroy existing instance
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  try {
    // Create pie chart for breakdown visualization
    const isMobile = window.innerWidth < 768;
    const aspectRatio = isMobile ? 1 : 2;

    chartInstance = new Chart(chartCanvas.value, {
      type: 'pie',
      data: {
        labels: ['Total Sales', 'Avg Daily Sales', 'Total Transactions'],
        datasets: [
          {
            data: [
              props.data.total_sales,
              props.data.avg_daily_sales * 100, // Scale for visibility
              props.data.total_transactions * 10000, // Scale for visibility
            ],
            backgroundColor: [
              '#3B82F6', // Blue
              '#10B981', // Green
              '#F59E0B', // Amber
            ],
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: isMobile ? 10 : 15,
              font: {
                size: isMobile ? 10 : 12,
              },
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1,
            titleFont: {
              size: isMobile ? 11 : 13,
            },
            bodyFont: {
              size: isMobile ? 10 : 12,
            },
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                if (label === 'Total Sales' || label === 'Avg Daily Sales') {
                  const actualValue = label === 'Total Sales' ? props.data!.total_sales : props.data!.avg_daily_sales;
                  return `${label}: ${formatCurrency(actualValue)}`;
                }
                return `${label}: ${formatNumber(props.data!.total_transactions)}`;
              },
            },
          },
        },
        animation: {
          duration: 750,
          easing: 'easeInOutQuart',
        },
      },
    });
  } catch (error) {
    console.error('Chart rendering error:', error);
  }
};

const handleRetry = () => {
  emit('retry');
};

watch(
  () => [props.data, props.loading],
  () => {
    if (props.data && !props.loading) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        initializeChart();
      }, 0);
    }
  },
  { deep: true }
);

onMounted(() => {
  if (props.data && !props.loading) {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      initializeChart();
    }, 0);
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>
