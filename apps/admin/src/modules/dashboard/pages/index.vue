<template>
  <div class="w-full space-y-4">
    <UiLoading
      v-if="loading"
      message="Memuat statistik..."
    />

    <template v-else-if="stats">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <UiCard
          v-for="card in summaryCards"
          :key="card.label"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs text-slate-400">{{ card.label }}</p>
              <p class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {{ card.value }}
              </p>
              <p class="mt-1 text-xs text-slate-500">{{ card.caption }}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <i :class="[card.icon, 'text-gray-500']" />
            </div>
          </div>
        </UiCard>
      </div>

      <UiCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">
              Merchant Terbaru
            </h2>
            <Button
              label="Lihat Semua"
              size="small"
              severity="secondary"
              variant="outlined"
              @click="onViewMerchants"
            />
          </div>
        </template>

        <div
          v-if="!stats.recent_merchants.length"
          class="py-8 text-center text-sm text-gray-400"
        >
          Belum ada merchant.
        </div>
        <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
          <div
            v-for="merchant in stats.recent_merchants"
            :key="merchant.id"
            class="flex items-center justify-between gap-3 py-3 cursor-pointer"
            @click="onDetailMerchant(merchant.id)"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                {{ merchant.name }}
              </p>
              <p class="text-xs text-slate-400">
                {{ formatDateTime(merchant.created_at) }}
              </p>
            </div>
            <div class="flex gap-2 shrink-0">
              <Tag
                severity="secondary"
                :value="`${merchant._count.outlets} outlet`"
                class="text-xs!"
              />
              <Tag
                severity="secondary"
                :value="`${merchant._count.users} pengguna`"
                class="text-xs!"
              />
            </div>
          </div>
        </div>
      </UiCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats } from '@/modules/dashboard/services/types.ts';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage, formatDateTime } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import { getDashboardStats } from '@/modules/dashboard/services/api.ts';
import {
  PREFIX_ROUTE_PATH as PRP_MERCHANTS,
  PREFIX_ROUTE_NAME as PRN_MERCHANTS,
} from '@/modules/merchants/services/constants.ts';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';

const router = useRouter();

// Fetch Data
const loading = ref(false);
const stats = ref<DashboardStats | null>(null);

const fetchStats = async () => {
  try {
    loading.value = true;
    const response = await getDashboardStats();
    const { data } = response?.data || {};

    stats.value = data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat statistik.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    loading.value = false;
  }
};

const summaryCards = computed(() => {
  if (!stats.value) return [];

  const { merchants, outlets, users, window_days } = stats.value;

  return [
    {
      label: 'Total Merchant',
      value: merchants.total,
      caption: `${merchants.new} baru dalam ${window_days} hari`,
      icon: 'pi pi-shop',
    },
    {
      label: 'Merchant Aktif',
      value: merchants.active,
      caption: `Bertransaksi dalam ${window_days} hari`,
      icon: 'pi pi-chart-line',
    },
    {
      label: 'Total Outlet',
      value: outlets.total,
      caption: `${outlets.active} outlet aktif`,
      icon: 'pi pi-sitemap',
    },
    {
      label: 'Total Pengguna',
      value: users.total,
      caption: `${users.active} pengguna aktif`,
      icon: 'pi pi-users',
    },
  ];
});

// Actions
const onViewMerchants = () => {
  router.push(PRP_MERCHANTS);
};

const onDetailMerchant = (id: string) => {
  router.push({
    name: `${PRN_MERCHANTS}-detail`,
    params: { id },
  });
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
</style>
