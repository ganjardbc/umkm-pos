<template>
  <UiCard class="metrics-display">
    <div class="metrics-display__header">
      <h3 class="metrics-display__title">Performance Metrics</h3>
    </div>

    <div class="metrics-display__content">
      <div v-if="loading" class="metrics-display__loading">
        <ProgressSpinner />
      </div>

      <div v-else-if="metrics.length === 0" class="metrics-display__empty">
        <p>No metrics available</p>
      </div>

      <div v-else class="space-y-8">
        <!-- Summary Chart -->
        <div class="metrics-display__chart-container">
          <div class="chart-wrapper">
            <h4 class="chart-title">Transactions & Revenue by Participant</h4>
            <canvas ref="summaryChartCanvas"></canvas>
          </div>
        </div>

        <!-- Individual Metrics -->
        <div class="metrics-display__chart-container">
          <h4 class="chart-title">Participant Details</h4>
          <DataTable :value="metrics" tableStyle="min-width: 50rem">
            <template #empty>
              <span class="w-full text-center flex justify-center">
                Metrics are empty.
              </span>
            </template>
            <Column field="no" header="NO" class="w-18">
              <template #body="slotProps">
                {{ slotProps.index + 1 }}
              </template>
            </Column>
            <Column field="user_name" header="Name" class="min-w-68">
              <template #body="slotProps">
                {{ slotProps.data.user_name }}
              </template>
            </Column>
            <Column field="transaction_count" header="Transaction">
              <template #body="slotProps">
                {{ slotProps.data.transaction_count }}x
              </template>
            </Column>
            <Column field="total_amount" header="Amount">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.total_amount) }}
              </template>
            </Column>
            <Column field="average_transaction_amount" header="Average">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.average_transaction_amount) }}
              </template>
            </Column>
            <Column field="participation_duration_minutes" header="Duration" class="min-w-30">
              <template #body="slotProps">
                {{ formatDuration(slotProps.data.participation_duration_minutes) }}
              </template>
            </Column>
            <Column field="participant_added_at" header="Added" class="min-w-54">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.participant_added_at) }}
              </template>
            </Column>
            <Column field="status" header="Status" class="min-w-38">
              <template #body="slotProps">
                <div class="flex justify-start gap-2">
                  <Tag
                    v-if="showOwnerStatus && slotProps.data.is_owner"
                    value="Shift Owner"
                    severity="info"
                  />
                  <Tag
                    v-if="showRemovedStatus && slotProps.data.participant_removed_at"
                    value="Removed"
                    severity="warning"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import { getParticipantMetrics } from '@/modules/shift/services/api';
import { showToast } from '@/helpers/toast';
import { getErrorMessage, formatDuration } from '@/helpers/utils';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import UiCard from '@/components/UiCard.vue';

// Register Chart.js components
Chart.register(...registerables);

interface Metric {
  user_id: string;
  user_name: string;
  transaction_count: number;
  total_amount: number;
  average_transaction_amount: number;
  participation_duration_minutes: number;
  participant_added_at: string;
  participant_removed_at?: string;
  is_owner?: false;
}

interface Participant {
  user_id: string;
  user_name: string;
  is_owner: boolean;
  participant_added_at: string;
  participant_removed_at?: string;
  transaction_count: number;
}

const props = defineProps({
  shiftId: {
    type: String,
    required: true,
  },
  participants: {
    type: Array as () => Array<Participant>,
    required: true,
  },
  showOwnerStatus: {
    type: Boolean,
    default: true,
  },
  showRemovedStatus: {
    type: Boolean,
    default: true,
  },
});

const metrics = ref<Metric[]>([]);
const loading = ref(false);
const summaryChartCanvas = ref<HTMLCanvasElement | null>(null);
let summaryChartInstance: Chart | null = null;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

const initializeSummaryChart = () => {
  if (!summaryChartCanvas.value || metrics.value.length === 0) return;

  // Destroy existing instance
  if (summaryChartInstance) {
    summaryChartInstance.destroy();
    summaryChartInstance = null;
  }

  try {
    const labels = metrics.value.map(m => m.user_name);
    const transactionData = metrics.value.map(m => m.transaction_count);
    const revenueData = metrics.value.map(m => m.total_amount);

    const isMobile = window.innerWidth < 768;

    summaryChartInstance = new Chart(summaryChartCanvas.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Transactions',
            data: transactionData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3B82F6',
            borderWidth: 1,
            yAxisID: 'y',
          },
          {
            label: 'Revenue (IDR)',
            data: revenueData,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10B981',
            borderWidth: 1,
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
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  if (context.datasetIndex === 1) {
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
              text: 'Transactions',
              font: {
                size: 12,
              },
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
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: !isMobile,
              text: 'Revenue (IDR)',
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
                return new Intl.NumberFormat('id-ID', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value as number);
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

const loadMetrics = async () => {
  loading.value = true;
  try {
    const metricsData: Metric[] = [];
    for (const participant of props.participants as Participant[]) {
      try {
        const response = await getParticipantMetrics(props.shiftId, participant.user_id);
        const { data, success } = response?.data || {};
        if (success) {
          metricsData.push({
            ...data,
            is_owner: participant.is_owner || false,
          });
        }
      } catch (error) {
        console.error(`Failed to load metrics for ${participant.user_name}:`, error);
      }
    }
    metrics.value = metricsData;
    
    // Initialize chart after metrics are loaded
    setTimeout(() => {
      initializeSummaryChart();
    }, 0);
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error',
      message: getErrorMessage(error) || 'Failed to load metrics',
    });
  } finally {
    loading.value = false;
  }
};

// Watch for changes in participants prop
watch(
  () => props.participants,
  () => {
    loadMetrics();
  },
  { deep: true }
);

onMounted(() => {
  loadMetrics();
});

onBeforeUnmount(() => {
  if (summaryChartInstance) {
    summaryChartInstance.destroy();
    summaryChartInstance = null;
  }
});
</script>

<style scoped>
@import "tailwindcss";
@import "@/assets/styles/themes.css";

.metrics-display__title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.metrics-display__content {
  @apply space-y-6;
}

.metrics-display__loading {
  @apply flex justify-center py-8;
}

.metrics-display__empty {
  @apply text-center py-8 text-gray-500 dark:text-gray-400;
}

.metrics-display__chart-container {
  @apply bg-gray-50 dark:bg-dark rounded-lg p-4 border border-gray-200 dark:border-dark;
}

.chart-wrapper {
  @apply relative w-full;
  height: 350px;
}

.chart-title {
  @apply text-sm font-semibold text-gray-900 dark:text-white mb-3;
}

.metric-row {
  @apply flex justify-between items-center text-sm;
}

.metric-label {
  @apply text-gray-600 dark:text-gray-400;
}

.metric-value {
  @apply font-medium text-gray-900 dark:text-white;
}
</style>
