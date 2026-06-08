<template>
  <div
    class="fixed inset-x-0 z-10 px-4 pb-4"
    :class="withBottomMenu ? 'bottom-16' : 'bottom-0'"
  >
    <div class="mx-auto max-w-4xl">
      <div class="rounded-lg bg-white p-4 shadow-xl dark:bg-dark-secondary">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-dark">
              <i class="pi pi-shopping-cart text-primary" />
            </div>
            <div class="min-w-0">
              <div class="text-sm text-gray-500">Keranjang</div>
              <div class="flex items-center gap-2">
                <span class="text-base font-semibold">{{ itemCount }} item</span>
                <span class="text-gray-300">|</span>
                <span class="text-base font-semibold text-primary">{{ getCurrency(total) }}</span>
              </div>
            </div>
          </div>
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-arrow-right"
            size="small"
            @click="$emit('open')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getCurrency } from '@/helpers/utils.ts';

const props = defineProps<{
  items: any[];
  total: number;
  withBottomMenu?: boolean;
}>();

defineEmits<{
  open: [];
}>();

const itemCount = computed(() =>
  props.items.reduce((count, item) => count + item.quantity, 0),
);
</script>
