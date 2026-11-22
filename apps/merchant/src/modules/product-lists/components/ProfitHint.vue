<template>
  <div
    v-if="margin"
    class="rounded-lg px-3 py-2 text-sm"
    :class="margin.amount >= 0
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
      : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'"
  >
    <template v-if="margin.amount >= 0">
      Laba per item {{ getCurrency(margin.amount) }}<span v-if="margin.percent !== null"> ({{ margin.percent }}% dari harga jual)</span>
    </template>
    <template v-else>
      Modal lebih besar dari harga jual, rugi {{ getCurrency(-margin.amount) }} per item.
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getCurrency } from '@umkm-pos/ui/helpers/utils';

const props = defineProps<{ price?: number | null; cost?: number | null }>();

// Nothing to show until both a price and a non-zero cost are entered.
const margin = computed(() => {
  if (props.price == null || !props.cost) return null;
  const amount = props.price - props.cost;
  return {
    amount,
    percent: props.price > 0 ? Math.round((amount / props.price) * 100) : null,
  };
});
</script>
