<template>
  <div class="overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-lg bg-white dark:bg-dark-secondary">
    <div class="relative p-3 grid grid-cols-[68px_1fr] md:grid-cols-1 gap-4">
      <div class="relative aspect-square md:aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-dark flex items-center justify-center">
        <img
          v-if="product.thumbnail"
          :src="product.thumbnail"
          :alt="product.name"
          class="h-full w-full object-cover"
        >
        <i
          v-else
          class="pi pi-image text-xl! text-slate-300 dark:text-slate-600"
        />
      </div>

      <Tag
        v-if="product.stock_qty <= product.min_stock"
        severity="warn"
        value="Stok Kosong"
        class="absolute right-3 top-3 text-xs!"
      />

      <div class="flex-1 text-left space-y-1">
        <div class="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
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
        <div class="text-left text-sm font-bold text-primary dark:text-primary-400">
          {{ getCurrency(product.price) }}
        </div>
      </div>
    </div>

    <div class="px-3 pb-4">
      <Button
        size="small"
        label="Tambah ke Keranjang"
        icon="pi pi-cart-plus"
        variant="outlined"
        class="w-full!"
        :disabled="disabled || product.stock_qty <= 0 || product.stock_qty <= product.min_stock"
        @click.stop="$emit('add', product)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrency } from '@/helpers/utils.ts';

defineProps<{
  product: any;
  disabled?: boolean;
}>();

defineEmits<{
  add: [product: any];
}>();
</script>
