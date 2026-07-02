<template>
  <div class="w-full space-y-4" :class="{ 'pb-14': catalogStore.cartItems.length > 0 }">
    <UiCard v-if="catalogStore.cartItems.length === 0">
      <div class="flex flex-col items-center justify-center py-8 text-center text-gray-500">
        <i class="pi pi-shopping-cart mb-3 text-3xl" />
        <p class="mb-4 text-sm">Keranjang masih kosong.</p>
        <Button label="Pilih Menu" icon="pi pi-plus" size="small" @click="goToBrowse" />
      </div>
    </UiCard>

    <template v-else>
      <UiCard>
        <div class="flex items-center justify-between gap-3">
          <div>
            <h1 class="text-lg font-semibold">Menu Dipilih</h1>
            <p class="text-sm text-gray-500">{{ catalogStore.cartItemCount }} item dalam keranjang</p>
          </div>
          <div class="flex gap-2">
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-plus"
              size="small"
              @click="goToBrowse"
            />
            <Button
              severity="danger"
              variant="outlined"
              icon="pi pi-trash"
              size="small"
              @click="onClearCart"
            />
          </div>
        </div>
      </UiCard>

      <UiCard>
        <div class="space-y-3">
          <div
            v-for="item in catalogStore.cartItems"
            :key="item.id"
            :class="{
              'mb-6 pb-4 border-b border-gray-200 dark:border-white/10': item !== catalogStore.cartItems[catalogStore.cartItems.length - 1],
            }"
            class="rounded bg-gray-50 dark:bg-dark-secondary space-y-4"
          >
            <div class="flex gap-3">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-white dark:bg-dark">
                <img
                  v-if="item.thumbnail"
                  :src="item.thumbnail"
                  :alt="item.name"
                  class="h-full w-full object-cover"
                >
                <i v-else class="pi pi-image text-2xl text-gray-300" />
              </div>

              <div class="min-w-0 flex-1 space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate font-semibold">{{ item.name }}</p>
                    <p class="mt-1 text-sm text-gray-500">{{ getCurrency(item.price) }}</p>
                  </div>
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    rounded
                    size="small"
                    @click="catalogStore.removeFromCart(item.id)"
                  />
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <Button
                  icon="pi pi-minus"
                  size="small"
                  severity="secondary"
                  variant="outlined"
                  @click="catalogStore.decrementQuantity(item.id)"
                />
                <span class="w-8 text-center text-sm font-semibold">{{ item.quantity }}</span>
                <Button
                  icon="pi pi-plus"
                  size="small"
                  severity="secondary"
                  variant="outlined"
                  :disabled="item.quantity >= item.stock_qty"
                  @click="catalogStore.incrementQuantity(item.id)"
                />
              </div>
              <p class="text-sm font-semibold">{{ getCurrency(Number(item.price) * item.quantity) }}</p>
            </div>

            <Textarea v-model="item.customer_note" class="w-full" rows="2" placeholder="Catatan untuk item ini..." />
          </div>
        </div>
      </UiCard>

      <UiCard>
        <div class="space-y-4">
          <div>
            <h1 class="text-lg font-semibold">Checkout</h1>
            <p class="text-sm text-gray-500">Pilih meja sebelum membuat pesanan.</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">Meja</label>
            <Select
              v-model="selectedTableId"
              :options="tables"
              option-label="name"
              option-value="id"
              placeholder="Pilih meja"
              class="mt-1 w-full"
            />
          </div>

          <div class="space-y-2 rounded bg-gray-50 dark:bg-dark-secondary">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Jumlah Item</span>
              <span class="text-sm font-semibold">{{ catalogStore.cartItemCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Total</span>
              <span class="text-base font-semibold">{{ getCurrency(catalogStore.cartTotal) }}</span>
            </div>
          </div>
        </div>
      </UiCard>

      <div class="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-dark">
        <div class="mx-auto flex max-w-4xl items-center gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-xs text-gray-500">Total</p>
            <p class="truncate text-base font-semibold">{{ getCurrency(catalogStore.cartTotal) }}</p>
          </div>
          <Button
            label="Buat Pesanan"
            icon="pi pi-check"
            :loading="isSubmitting"
            :disabled="!catalogStore.isShiftOpen"
            @click="confirmSubmitOrder"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UiCard from '@/components/UiCard.vue';
import { getCurrency, getErrorMessage } from '@/helpers/utils.ts';
import { showConfirm, showToast } from '@/helpers/toast.ts';
import { useCatalogStore } from '../stores/index.ts';
import { getCatalogTables } from '../services/api.ts';

const route = useRoute();
const router = useRouter();
const outletId = route.params.outletId as string;
const catalogStore = useCatalogStore();

const tables = ref<any[]>([]);
const selectedTableId = ref('');
const isSubmitting = ref(false);

const goToBrowse = () => {
  router.push({ name: 'customer-catalog-browse', params: { outletId } });
};

const onClearCart = () => {
  showConfirm({
    header: 'Kosongkan Keranjang',
    message: 'Yakin ingin mengosongkan keranjang?',
    rejectLabel: 'Batal',
    acceptLabel: 'Kosongkan',
    type: 'warn',
    accept: () => {
      catalogStore.clearCart();
      showToast({
        type: 'success',
        title: 'Keranjang dikosongkan',
        message: 'Semua item telah dihapus dari keranjang.',
      });
    },
  });
};

const confirmSubmitOrder = () => {
  if (isSubmitting.value) return;

  if (!catalogStore.isShiftOpen) {
    showToast({
      type: 'warn',
      title: 'Shift belum dibuka',
      message: 'Outlet belum menerima pesanan saat ini.',
    });
    return;
  }

  if (!selectedTableId.value) {
    showToast({ type: 'warn', title: 'Pilih meja dulu.', message: 'Meja wajib dipilih.' });
    return;
  }

  showConfirm({
    header: 'Buat Pesanan',
    message: 'Pastikan menu dan meja sudah benar. Lanjut membuat pesanan?',
    rejectLabel: 'Cek Lagi',
    acceptLabel: 'Buat Pesanan',
    type: 'info',
    accept: submitOrder,
  });
};

const submitOrder = async () => {
  try {
    isSubmitting.value = true;
    await catalogStore.refreshShiftStatus(outletId);
    if (!catalogStore.isShiftOpen) {
      showToast({
        type: 'warn',
        title: 'Shift belum dibuka',
        message: 'Outlet belum menerima pesanan saat ini.',
      });
      return;
    }

    await catalogStore.submitOrder({
      outlet_id: outletId,
      table_id: selectedTableId.value,
      payment_method: 'pending',
      items: catalogStore.cartItems.map((item) => ({
        product_id: item.id,
        qty: item.quantity,
        customer_note: item.customer_note,
      })),
    });
    showToast({
      type: 'success',
      title: 'Pesanan dibuat.',
      message: 'Tunggu konfirmasi dari kasir ya.',
    });
    router.push({ name: 'customer-catalog-home', params: { outletId: outletId } });
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal membuat pesanan.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  try {
    const response = await getCatalogTables(outletId);
    tables.value = response.data?.data || [];
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat meja.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
});
</script>
