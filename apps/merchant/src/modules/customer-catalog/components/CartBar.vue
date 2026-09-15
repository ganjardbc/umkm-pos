<template>
  <div
    class="fixed inset-x-0 bottom-0 z-10 px-4 pb-4"
  >
    <div class="mx-auto max-w-6xl">
      <div class="rounded-2xl bg-white p-4 shadow-xl backdrop-blur dark:bg-dark">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/40">
              <i class="pi pi-shopping-cart text-amber-600 dark:text-amber-400" />
            </div>
            <div class="space-y-0.5">
              <div class="text-sm text-slate-500 dark:text-slate-400">Keranjang</div>
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-slate-900 dark:text-slate-50">{{ items.length }} item</span>
                <span class="text-slate-300 dark:text-slate-600">|</span>
                <span class="text-base font-bold text-amber-700 dark:text-amber-400">{{ getCurrency(total) }}</span>
              </div>
            </div>
          </div>
          <Button
            severity="contrast"
            size="medium"
            icon="pi pi-arrow-right"
            @click="showCartModal = true"
          />
        </div>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="showCartModal"
    modal
    header="Keranjang"
    class="w-full max-w-lg"
  >
    <div class="flex flex-col gap-4">
      <div v-if="items.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
        <i class="pi pi-shopping-cart mb-3 text-4xl" />
        <p class="text-sm">Keranjang kosong</p>
      </div>

      <template v-else>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-500 dark:text-slate-400">{{ items.length }} item</span>
          <Button severity="danger" variant="outlined" size="small" label="Kosongkan" @click="$emit('clear')" />
        </div>

        <div class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50 dark:ring-1 dark:ring-white/10"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-slate-900 dark:text-slate-50">{{ item.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-300">{{ getCurrency(item.price) }} x {{ item.quantity }}</p>
              </div>
              <Button icon="pi pi-trash" severity="danger" text rounded @click="$emit('remove', item.id)" />
            </div>
            <div class="mt-2 flex items-center gap-2">
              <Button icon="pi pi-minus" size="small" outlined rounded @click="$emit('decrement', item.id)" />
              <span class="w-6 text-center text-sm font-semibold dark:text-slate-50">{{ item.quantity }}</span>
              <Button icon="pi pi-plus" size="small" outlined rounded :disabled="item.quantity >= item.stock_qty" @click="$emit('increment', item.id)" />
            </div>
            <Textarea v-model="item.customer_note" class="mt-2 w-full" rows="2" placeholder="Catatan untuk item ini..." />
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-300">Total</p>
            <p class="text-xl font-bold text-slate-900 dark:text-slate-50">{{ getCurrency(total) }}</p>
          </div>
          <Button label="Lanjut pilih meja" @click="onCheckout" />
        </div>
      </template>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getCurrency } from '@/helpers/utils.ts';

defineProps<{
  items: any[];
  total: number;
}>();

const emit = defineEmits<{
  remove: [id: string];
  increment: [id: string];
  decrement: [id: string];
  clear: [];
  checkout: [];
}>();

const showCartModal = ref(false);

const onCheckout = () => {
  showCartModal.value = false;
  emit('checkout');
};
</script>
