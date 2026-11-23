<template>
  <div class="w-full space-y-4">
    <!-- Tabs -->
    <Tabs v-model:value="activeTab">
      <TabList class="bg-transparent!">
        <Tab value="current-shift">Hari Ini</Tab>
        <Tab value="shift-histories">Riwayat</Tab>
        <Tab value="daily-report">Laporan Harian</Tab>
      </TabList>
    </Tabs>

    <CurrentShift v-if="activeTab === 'current-shift'" />
    <HistoryShift v-if="activeTab === 'shift-histories'" />
    <DailyReport v-if="activeTab === 'daily-report'" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CurrentShift from './CurrentShift.vue';
import HistoryShift from './HistoryShift.vue';
import DailyReport from './DailyReport.vue';

const route = useRoute();
const router = useRouter();

const activeTab = computed({
  get: () => (route.query.tab as string) || 'current-shift',
  set: (value: string) => {
    router.push({ query: { ...route.query, tab: value } });
  },
});
</script>

<style scoped>
</style>
