<template>
  <button
    class="overflow-hidden rounded-2xl shadow-sm transition-all hover:shadow-lg bg-white dark:bg-dark cursor-pointer"
    @click="$emit('add', product)"
  >
    <div class="relative space-y-3 p-3">
      <div class="relative aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-dark-secondary flex items-center justify-center">
        <img
          v-if="product.thumbnail"
          :src="product.thumbnail"
          :alt="product.name"
          class="h-full w-full object-cover"
        >
        <i
          v-else
          class="pi pi-image text-4xl! text-slate-300 dark:text-slate-600"
        />
      </div>

      <Tag
        v-if="product.stock_qty <= product.min_stock"
        severity="warn"
        value="Low Stock"
        class="absolute right-3 top-3 text-xs!"
      />

      <div class="text-left space-y-1">
        <div class="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
          {{ product.name }}
        </div>
        <div class="flex items-center justify-between gap-4">
          <div class="truncate text-sm text-slate-400 dark:text-slate-500">
            {{ product.product_categories?.name || '-' }}
          </div>
          <div class="text-sm text-slate-400 dark:text-slate-500">
            {{ product.stock_qty }}x
          </div>
        </div>
      </div>

      <div class="text-left text-lg font-bold text-primary dark:text-primary-400">
        {{ getCurrency(product.price) }}
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { getCurrency } from '@/helpers/utils.ts';

defineProps<{
  product: any;
}>();

defineEmits<{
  add: [product: any];
}>();
</script>
