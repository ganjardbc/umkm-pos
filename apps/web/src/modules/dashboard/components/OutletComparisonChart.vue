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
    <ChartErrorState v-else-if="error" :error="error" @retry="$emit('retry')" />

    <!-- Chart Canvas -->
    <div v-else-if="data && data.length > 0" class="relative w-full" style="height: 320px;">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- No Data State -->
    <ChartEmptyState v-else icon="pi-chart-bar" class="py-28" />
  </UiCard>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import type { OutletComparisonItem } from '../types/reports';
import UiCard from '@/components/UiCard.vue';
import ChartLoadingState from './ChartLoadingState.vue';
import ChartErrorState from './ChartErrorState.vue';
import ChartEmptyState from './ChartEmptyState.vue';
import { exportOutletComparison } from '@/modules/reports/services/api.ts';
import { downloadFile } from '@/helpers/download.ts';
import { getOutlet } from '@/helpers/auth.ts';

// Register Chart.js components
Chart.register(...registerables);

// Props
interface Props {
  data: OutletComparisonItem[] | null;
  loading: boolean;
  error: string | null;
  title: string;
}

const props = defineProps<Props>();

// Emits
defineEmits<{
  retry: [];
}>();

// Refs
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
const isExporting = ref(false);

const outlet = getOutlet();

// Chart colors for different metrics
const CHART_COLORS = {
  revenue: '#3B82F6',      // Blue
  transactions: '#10B981', // Green
  items: '#F59E0B',        // Amber
};

const handleExport = async () => {
  if (!props.data || props.data.length === 0) return;
  
  try {
    isExporting.value = true;
    
    // Use default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    const params = {
      date_from: start.toISOString().split('T')[0],
      date_to: end.toISOString().split('T')[0],
      outlet_id: outlet?.id,
    };
    
    const blob = await exportOutletComparison(params);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(blob, `Outlet_Comparison_${timestamp}.xlsx`);
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    isExporting.value = false;
  }
};

// Chart initialization
const initializeChart = () => {
  if (!chartCanvas.value || !props.data || props.data.length === 0) return;

  // Destroy existing instance
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  try {
    // Prepare data for Chart.js
    const labels = props.data.map(item => {
      // Truncate long outlet names
      const maxLength = 20;
      return item.outlet_name.length > maxLength
        ? item.outlet_name.substring(0, maxLength) + '...'
        : item.outlet_name;
    });

    const revenueData = props.data.map(item => item.total_revenue);
    const transactionsData = props.data.map(item => item.total_transactions);

    // Determine if mobile for responsive settings
    const isMobile = window.innerWidth < 768;

    // Create new chart
    chartInstance = new Chart(chartCanvas.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue (IDR)',
            data: revenueData,
            backgroundColor: CHART_COLORS.revenue,
            borderColor: CHART_COLORS.revenue,
            borderWidth: 1,
          },
          {
            label: 'Transactions',
            data: transactionsData,
            backgroundColor: CHART_COLORS.transactions,
            borderColor: CHART_COLORS.transactions,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
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
            mode: 'index',
            intersect: false,
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
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y ?? 0;
                
                if (label.includes('Revenue')) {
                  return `${label}: ${new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(value)}`;
                }
                
                return `${label}: ${new Intl.NumberFormat('id-ID').format(value)}`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: !isMobile,
              text: 'Outlet Name',
              font: {
                size: 12,
              },
            },
            ticks: {
              font: {
                size: isMobile ? 9 : 11,
              },
              maxRotation: isMobile ? 45 : 0,
              minRotation: isMobile ? 45 : 0,
            },
            grid: {
              display: false,
            },
          },
          y: {
            display: true,
            title: {
              display: !isMobile,
              text: 'Value',
              font: {
                size: 12,
              },
            },
            ticks: {
              font: {
                size: isMobile ? 9 : 11,
              },
              callback: function(value) {
                return new Intl.NumberFormat('id-ID', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value as number);
              },
            },
            grid: {
              display: true,
            },
          },
        },
        animation: {
          duration: 750,
          easing: 'easeInOutQuart',
        },
      },
    });
  } catch (err) {
    console.error('Chart rendering error:', err);
  }
};

// Watch for data changes
watch(
  () => [props.data, props.loading],
  () => {
    if (props.data && !props.loading) {
      // Use nextTick to ensure DOM is updated
      setTimeout(() => {
        initializeChart();
      }, 0);
    }
  },
  { deep: true }
);

// Initialize on mount
onMounted(() => {
  if (props.data && !props.loading) {
    initializeChart();
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
/* Additional styles if needed */
</style>
