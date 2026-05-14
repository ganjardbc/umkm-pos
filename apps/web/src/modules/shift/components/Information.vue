<template>
  <UiCard>
    <div class="w-full flex gap-4 items-center justify-between">
      <h1 class="text-lg font-semibold">
        Shift Information
      </h1>
    </div>

    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Outlet Information -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Outlet</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ currentShift.outlet?.name || 'N/A' }}
          </div>
        </div>

        <!-- Shift Owner -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Shift Owner</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ currentShift.shift_owner?.name || 'N/A' }}
          </div>
        </div>

        <!-- Created At -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ currentShift.created_at ? formatDateTime(currentShift.created_at) : 'N/A' }}
          </div>
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
          <div>
            <Tag
              :value="currentShift.status?.toUpperCase() || 'N/A'"
              :severity="currentShift.status === 'open' ? 'success' : 'secondary'"
            />
          </div>
        </div>
      </div>

      <Divider />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <!-- Participant Count -->
        <div class="p-4 flex flex-row xl:flex-col gap-2 justify-between items-center rounded-lg bg-gray-50 dark:bg-dark">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Participants</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ currentShift.participant_count || 0 }}
          </div>
        </div>

        <!-- Total Transactions -->
        <div class="p-4 flex flex-row xl:flex-col gap-2 justify-between items-center rounded-lg bg-gray-50 dark:bg-dark">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ currentShift.total_transactions || 0 }}
          </div>
        </div>

        <!-- Shift Time -->
        <div class="p-4 flex flex-row xl:flex-col gap-2 justify-between items-center rounded-lg bg-gray-50 dark:bg-dark">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Shift Time</label>
          <div class="text-base font-semibold text-gray-900 dark:text-white">
            {{ formatRangeTime(currentShift.start_time, currentShift.end_time) }}
          </div>
        </div>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import UiCard from '@/components/UiCard.vue';
import { formatDateTime, formatRangeTime } from '@/helpers/utils.ts';

defineProps({
  currentShift: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
@import "tailwindcss";
@import "@/assets/styles/themes.css";
</style>
