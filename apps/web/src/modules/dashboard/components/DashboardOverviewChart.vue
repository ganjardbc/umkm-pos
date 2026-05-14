<template>
  <UiCard>
    <template #header>
      <h3 class="text-lg md:text-xl font-semibold">{{ title }}</h3>
    </template>
    <div class="relative" style="min-height: 300px;">
      <!-- Loading State -->
      <ChartLoadingState v-if="loading" />

      <!-- Error State -->
      <ChartErrorState v-else-if="error" :error="error" @retry="$emit('retry')" />

      <!-- Dashboard Overview Content -->
      <div v-else-if="data">
        <!-- Summary Metrics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 md:p-4">
            <div class="text-xs md:text-sm text-blue-600 font-medium mb-1">Total Sales</div>
            <div class="text-lg md:text-2xl font-bold text-blue-900">
              {{ formatCurrency(data.summary.total_sales) }}
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 md:p-4">
            <div class="text-xs md:text-sm text-green-600 font-medium mb-1">Total Transactions</div>
            <div class="text-lg md:text-2xl font-bold text-green-900">
              {{ formatNumber(data.summary.total_transactions) }}
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 md:p-4">
            <div class="text-xs md:text-sm text-amber-600 font-medium mb-1">Avg Daily Sales</div>
            <div class="text-lg md:text-2xl font-bold text-amber-900">
              {{ formatCurrency(data.summary.avg_daily_sales) }}
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 md:p-4">
            <div class="text-xs md:text-sm text-purple-600 font-medium mb-1">Total Days</div>
            <div class="text-lg md:text-2xl font-bold text-purple-900">
              {{ formatNumber(data.summary.total_days) }}
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <!-- Top Products Mini Bar Chart -->
          <div v-if="data.topProducts && data.topProducts.length > 0">
            <h4 class="text-sm md:text-base font-semibold mb-2 text-gray-700">Top Products</h4>
            <div class="bg-gray-50 rounded-lg p-3">
              <canvas ref="productsChartCanvas"></canvas>
            </div>
          </div>

          <!-- Outlet Comparison Mini Bar Chart -->
          <div v-if="data.outletComparison && data.outletComparison.length > 0">
            <h4 class="text-sm md:text-base font-semibold mb-2 text-gray-700">Outlet Comparison</h4>
            <div class="bg-gray-50 rounded-lg p-3">
              <canvas ref="outletChartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <ChartEmptyState v-else />
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import type { DashboardResponse } from '../types/reports';
import UiCard from '@/components/UiCard.vue';
import ChartLoadingState from './ChartLoadingState.vue';
import ChartErrorState from './ChartErrorState.vue';
import ChartEmptyState from './ChartEmptyState.vue';

// Register Chart.js components
Chart.register(...registerables);

// Props
interface Props {
  data: DashboardResponse['data'] | null;
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
const productsChartCanvas = ref<HTMLCanvasElement | null>(null);
const outletChartCanvas = ref<HTMLCanvasElement | null>(null);
let productsChartInstance: Chart | null = null;
let outletChartInstance: Chart | null = null;

// Formatting functions
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

// Initialize products chart
const initializeProductsChart = () => {
  if (!productsChartCanvas.value || !props.data?.topProducts || props.data.topProducts.length === 0) return;

  // Destroy existing instance
  if (productsChartInstance) {
    productsChartInstance.destroy();
    productsChartInstance = null;
  }

  try {
    // Take top 5 products for compact display
    const topProducts = props.data.topProducts.slice(0, 5);
    
    // Prepare data for Chart.js
    const labels = topProducts.map(item => {
      // Truncate long product names
      const maxLength = 15;
      return item.product_name.length > maxLength
        ? item.product_name.substring(0, maxLength) + '...'
        : item.product_name;
    });

    const quantityData = topProducts.map(item => item.total_qty);

    // Generate color gradient for bars
    const colors = topProducts.map((_, index) => {
      const hue = 210 - (index * 15); // Blue gradient
      return `hsl(${hue}, 70%, 55%)`;
    });

    // Determine responsive settings based on viewport width
    const isMobile = window.innerWidth < 768;

    // Create new chart
    productsChartInstance = new Chart(productsChartCanvas.value, {
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
            barThickness: isMobile ? 12 : 15,
            maxBarThickness: isMobile ? 15 : 20,
          },
        ],
      },
      options: {
        indexAxis: 'y', // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1,
            titleFont: {
              size: isMobile ? 10 : 12,
            },
            bodyFont: {
              size: isMobile ? 9 : 11,
            },
            callbacks: {
              label: function(context) {
                const index = context.dataIndex;
                const product = topProducts[index];
                return [
                  `Quantity: ${formatNumber(product.total_qty)}`,
                  `Revenue: ${formatCurrency(product.total_revenue)}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              font: {
                size: isMobile ? 8 : 10,
              },
              callback: function(value) {
                return new Intl.NumberFormat('id-ID', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value as number);
              },
            },
          },
          y: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: isMobile ? 8 : 10,
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
    console.error('Products chart rendering error:', err);
  }
};

// Initialize outlet chart
const initializeOutletChart = () => {
  if (!outletChartCanvas.value || !props.data?.outletComparison || props.data.outletComparison.length === 0) return;

  // Destroy existing instance
  if (outletChartInstance) {
    outletChartInstance.destroy();
    outletChartInstance = null;
  }

  try {
    // Take top 5 outlets for compact display
    const topOutlets = props.data.outletComparison.slice(0, 5);
    
    // Prepare data for Chart.js
    const labels = topOutlets.map(item => {
      // Truncate long outlet names
      const maxLength = 15;
      return item.outlet_name.length > maxLength
        ? item.outlet_name.substring(0, maxLength) + '...'
        : item.outlet_name;
    });

    const revenueData = topOutlets.map(item => item.total_revenue);

    // Generate color gradient for bars
    const colors = topOutlets.map((_, index) => {
      const hue = 120 - (index * 15); // Green gradient
      return `hsl(${hue}, 70%, 55%)`;
    });

    // Determine responsive settings based on viewport width
    const isMobile = window.innerWidth < 768;

    // Create new chart
    outletChartInstance = new Chart(outletChartCanvas.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('55%', '45%')),
            borderWidth: 1,
            barThickness: isMobile ? 12 : 15,
            maxBarThickness: isMobile ? 15 : 20,
          },
        ],
      },
      options: {
        indexAxis: 'y', // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1,
            titleFont: {
              size: isMobile ? 10 : 12,
            },
            bodyFont: {
              size: isMobile ? 9 : 11,
            },
            callbacks: {
              label: function(context) {
                const index = context.dataIndex;
                const outlet = topOutlets[index];
                return [
                  `Revenue: ${formatCurrency(outlet.total_revenue)}`,
                  `Transactions: ${formatNumber(outlet.total_transactions)}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              font: {
                size: isMobile ? 8 : 10,
              },
              callback: function(value) {
                return new Intl.NumberFormat('id-ID', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value as number);
              },
            },
          },
          y: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: isMobile ? 8 : 10,
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
    console.error('Outlet chart rendering error:', err);
  }
};

// Initialize all charts
const initializeCharts = () => {
  if (!props.data || props.loading) return;
  
  // Use setTimeout to ensure DOM is updated
  setTimeout(() => {
    initializeProductsChart();
    initializeOutletChart();
  }, 0);
};

// Watch for data changes
watch(
  () => [props.data, props.loading],
  () => {
    if (props.data && !props.loading) {
      initializeCharts();
    }
  },
  { deep: true }
);

// Initialize on mount
onMounted(() => {
  if (props.data && !props.loading) {
    initializeCharts();
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  if (productsChartInstance) {
    productsChartInstance.destroy();
    productsChartInstance = null;
  }
  if (outletChartInstance) {
    outletChartInstance.destroy();
    outletChartInstance = null;
  }
});
</script>

<style scoped>
/* Additional styles if needed */
</style>
