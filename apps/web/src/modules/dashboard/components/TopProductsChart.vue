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
import type { TopProductItem } from '../types/reports';
import UiCard from '@/components/UiCard.vue';
import ChartLoadingState from './ChartLoadingState.vue';
import ChartErrorState from './ChartErrorState.vue';
import ChartEmptyState from './ChartEmptyState.vue';
import { exportTopProducts } from '@/modules/reports/services/api.ts';
import { downloadFile } from '@/helpers/download.ts';
import { getOutlet } from '@/helpers/auth.ts';

// Register Chart.js components
Chart.register(...registerables);

// Props
interface Props {
  data: TopProductItem[] | null;
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
    
    // Use default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    const params = {
      date_from: start.toISOString().split('T')[0],
      date_to: end.toISOString().split('T')[0],
      outlet_id: outlet?.id,
      limit: 10,
    };
    
    const blob = await exportTopProducts(params);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(blob, `Top_Products_${timestamp}.xlsx`);
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
    // Sort products in descending order by quantity sold
    const sortedData = [...props.data].sort((a, b) => b.total_qty - a.total_qty);

    // Prepare data for Chart.js
    const labels = sortedData.map(item => {
      // Truncate long product names
      const maxLength = 30;
      return item.product_name.length > maxLength
        ? item.product_name.substring(0, maxLength) + '...'
        : item.product_name;
    });

    const quantityData = sortedData.map(item => item.total_qty);
    const revenueData = sortedData.map(item => item.total_revenue);

    // Generate color gradient for bars
    const colors = sortedData.map((_, index) => {
      const hue = 210 - (index * 15); // Blue gradient
      return `hsl(${hue}, 70%, 55%)`;
    });

    // Determine if mobile for responsive settings
    const isMobile = window.innerWidth < 768;

    // Create new chart
    chartInstance = new Chart(chartCanvas.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Quantity Sold',
            data: quantityData,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('55%', '45%')),
            borderWidth: 1,
            barThickness: isMobile ? 15 : 20,
            maxBarThickness: isMobile ? 20 : 30,
          },
        ],
      },
      options: {
        indexAxis: 'y', // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // Hide legend for single dataset
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
              label: function(context) {
                const index = context.dataIndex;
                const quantity = quantityData[index];
                const revenue = revenueData[index];
                
                return [
                  `Quantity Sold: ${new Intl.NumberFormat('id-ID').format(quantity)}`,
                  `Revenue: ${new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(revenue)}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: !isMobile,
              text: 'Quantity Sold',
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
          y: {
            display: true,
            title: {
              display: false, // Hide y-axis title to save space
            },
            ticks: {
              font: {
                size: isMobile ? 9 : 11,
              },
            },
            grid: {
              display: false,
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
