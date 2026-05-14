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
    <ChartEmptyState v-else class="py-28" />
  </UiCard>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import type { DailyReportItem } from '../types/reports';
import UiCard from '@/components/UiCard.vue';
import ChartLoadingState from './ChartLoadingState.vue';
import ChartErrorState from './ChartErrorState.vue';
import ChartEmptyState from './ChartEmptyState.vue';
import { exportDailyReports } from '@/modules/reports/services/api.ts';
import { downloadFile } from '@/helpers/download.ts';
import { getOutlet } from '@/helpers/auth.ts';

// Register Chart.js components
Chart.register(...registerables);

// Props
interface Props {
  data: DailyReportItem[] | null;
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

const handleExport = async () => {
  if (!props.data || props.data.length === 0) return;
  
  try {
    isExporting.value = true;
    
    // Get date range from data
    const dates = props.data.map(d => new Date(d.report_date)).sort((a, b) => a.getTime() - b.getTime());
    const start = dates[0];
    const end = dates[dates.length - 1];
    
    const params = {
      date_from: start.toISOString().split('T')[0],
      date_to: end.toISOString().split('T')[0],
      outlet_id: outlet?.id,
    };
    
    const blob = await exportDailyReports(params);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(blob, `Daily_Reports_${timestamp}.xlsx`);
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
      const date = new Date(item.report_date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const revenueData = props.data.map(item => Number(item.total_sales));
    const transactionsData = props.data.map(item => Number(item.total_transactions));

    // Determine aspect ratio based on viewport width (square on mobile, wider on desktop)
    const isMobile = window.innerWidth < 768;

    // Create new chart
    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: false,
            pointRadius: isMobile ? 2 : 3,
            pointHoverRadius: isMobile ? 4 : 5,
            yAxisID: 'y',
          },
          {
            label: 'Transactions',
            data: transactionsData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: false,
            pointRadius: isMobile ? 2 : 3,
            pointHoverRadius: isMobile ? 4 : 5,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
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
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  if (context.datasetIndex === 0) {
                    // Revenue - format as currency
                    label += new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(context.parsed.y);
                  } else {
                    // Transactions - format as number
                    label += new Intl.NumberFormat('id-ID').format(context.parsed.y);
                  }
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: !isMobile,
              text: 'Date',
              font: {
                size: 12,
              },
            },
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: isMobile ? 9 : 11,
              },
              maxRotation: isMobile ? 45 : 0,
              minRotation: isMobile ? 45 : 0,
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: !isMobile,
              text: 'Revenue (IDR)',
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
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: !isMobile,
              text: 'Transactions',
              font: {
                size: 12,
              },
            },
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              font: {
                size: isMobile ? 9 : 11,
              },
              callback: function(value) {
                return new Intl.NumberFormat('id-ID').format(value as number);
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
