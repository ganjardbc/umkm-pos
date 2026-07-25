<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total Sales Today -->
    <UiCard class="bg-white dark:bg-dark-secondary! rounded-lg shadow">
      <div class="flex justify-between">
        <div class="space-y-1">
          <p class="text-sm text-gray-400 font-medium">Sales Today</p>
          <div v-if="loading" class="h-7 w-28 bg-gray-200 dark:bg-dark animate-pulse rounded"></div>
          <p v-else class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ formatCurrency(salesToday) }}
          </p>
        </div>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-600 dark:text-blue-400">
          <i class="pi pi-shopping-cart text-xl"></i>
        </div>
      </div>
    </UiCard>

    <!-- Total Transactions Today -->
    <UiCard class="bg-white dark:bg-dark-secondary! rounded-lg shadow">
      <div class="flex justify-between">
        <div class="space-y-1">
          <p class="text-sm text-gray-400 font-medium">Transactions Today</p>
          <div v-if="loading" class="h-7 w-20 bg-gray-200 dark:bg-dark animate-pulse rounded"></div>
          <p v-else class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ formatNumber(transactionsToday) }}
          </p>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-green-600 dark:text-green-400">
          <i class="pi pi-ticket text-xl"></i>
        </div>
      </div>
    </UiCard>

    <!-- Low Stock Products -->
    <UiCard class="bg-white dark:bg-dark-secondary! rounded-lg shadow">
      <div class="flex justify-between">
        <div class="space-y-1">
          <p class="text-sm text-gray-400 font-medium">Low Stock Items</p>
          <div v-if="loading" class="h-7 w-16 bg-gray-200 dark:bg-dark animate-pulse rounded"></div>
          <p v-else class="text-2xl font-bold" :class="lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'">
            {{ formatNumber(lowStockCount) }}
          </p>
        </div>
        <div class="p-3 rounded-lg" :class="lowStockCount > 0 ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-dark text-gray-400'">
          <i class="pi pi-box text-xl"></i>
        </div>
      </div>
    </UiCard>

    <!-- Active Shifts -->
    <UiCard class="bg-white dark:bg-dark-secondary! rounded-lg shadow">
      <div class="flex justify-between">
        <div class="space-y-1">
          <p class="text-sm text-gray-400 font-medium">Active Shifts</p>
          <div v-if="loading" class="h-7 w-16 bg-gray-200 dark:bg-dark animate-pulse rounded"></div>
          <p v-else class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ formatNumber(activeShiftsCount) }}
          </p>
        </div>
        <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-purple-600 dark:text-purple-400">
          <i class="pi pi-users text-xl"></i>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import UiCard from '@/components/UiCard.vue';

interface Props {
  salesToday: number;
  transactionsToday: number;
  lowStockCount: number;
  activeShiftsCount: number;
  loading: boolean;
}

defineProps<Props>();

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
</script>
