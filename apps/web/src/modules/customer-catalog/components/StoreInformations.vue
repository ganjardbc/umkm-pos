<template>
  <div class="rounded-xl bg-white p-4 shadow-sm dark:bg-dark">
    <div class="min-w-0 flex-1 space-y-4">
      <div class="flex items-start justify-between gap-3">
        <div class="mb-1 flex items-center gap-2">
          <template v-if="outlet?.logo">
            <img :src="outlet?.logo" :alt="outlet?.name" class="h-12 w-12 rounded-full object-cover" />
          </template>
          <template v-else>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              {{ outlet?.name?.charAt(0) || 'S' }}
            </div>
          </template>
          <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-slate-50">{{ outlet?.name }}</h1>
            <p v-if="outlet?.location" class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-64">{{ outlet?.location }}</p>
          </div>
        </div>
        <Button label="Logout" severity="secondary" variant="outlined" size="small" @click="$emit('reset')" />
      </div>

      <Divider />

      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <p class="text-sm text-slate-500 dark:text-slate-300">
            Halo, <span class="font-semibold text-slate-700 dark:text-slate-200">{{ session?.customer_name || 'Customer' }}</span>
          </p>
          <p v-if="session?.expires_at" class="text-xs text-slate-400 dark:text-slate-500">
            Sesi berlaku hingga {{ formatExpiry(session.expires_at) }}
          </p>
        </div>
        <div class="p-4 bg-slate-100 dark:bg-dark-secondary rounded-lg">
          <p class="text-xs text-slate-500 dark:text-slate-300">
            Status order:
            <span class="font-semibold" :class="orderStatusClass">{{ orderStatusText }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getCustomerCatalogStatusLabel } from '../services/status-labels.ts';

const props = defineProps<{
  session: any;
  latestOrder: any;
  sessionStatus: string;
}>();

defineEmits<{
  reset: [];
}>();

const outlet = computed(() => props.session?.outlets || null);

const orderStatusText = computed(() => {
  if (props.latestOrder?.order_status) {
    return getCustomerCatalogStatusLabel(props.latestOrder.order_status);
  }
  return 'belum ada order';
});

const orderStatusClass = computed(() => {
  if (!props.latestOrder?.order_status) return 'text-slate-400 dark:text-slate-500';
  if (props.latestOrder.order_status === 'selesai') return 'text-green-600 dark:text-green-400';
  return 'text-amber-700 dark:text-amber-400';
});

const formatExpiry = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};
</script>
