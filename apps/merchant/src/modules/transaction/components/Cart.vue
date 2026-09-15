<template>
  <div
    class="pos-cart pos-cart--animation"
    :class="{
      'pos-cart--mobile': !isWeb,
      'pos-cart--desktop': isWeb,
      'pos-cart--open': showCartMobile
    }"
  >
    <div
      class="pos-cart__header"
      :class="{
        'pos-cart__header--mobile': !isWeb,
      }"
    >
      <h1 class="text-lg font-semibold">
        Keranjang ({{ posStore.cartItemCount }})
      </h1>
      <div class="flex gap-4">
        <Button
          severity="danger"
          variant="outlined"
          icon="pi pi-trash"
          label="Kosongkan"
          size="small"
          :disabled="posStore.cartItems.length === 0"
          @click="onClearCart"
        />
        <Button
          v-if="!isWeb"
          severity="secondary"
          variant="outlined"
          size="medium"
          icon="pi pi-times"
          @click="openCloseCart"
        />
      </div>
    </div>

    <Divider class="m-0!" />

    <div class="pos-cart__section pos-cart__section-item">
      <div
        v-if="posStore.cartItems.length === 0"
        class="h-full flex flex-col items-center justify-center"
      >
        <i class="pi pi-shopping-cart mb-4" style="font-size: 24px;" />
        <p class="text-sm text-gray-500">Keranjang masih kosong</p>
      </div>
      
      <div
        v-else
        class="space-y-3"
      >
        <UiCard
          v-for="item in posStore.cartItems"
          :key="item.id"
          class="dark:bg-dark!"
        >
          <div class="space-y-4">
            <div class="flex gap-3">
              <div
                v-if="item.thumbnail"
                class="w-16 h-16 bg-dark rounded-lg flex items-center justify-center shrink-0"
              >
                <img
                  v-if="item.thumbnail"
                  :src="item.thumbnail"
                  :alt="item.name"
                  class="w-full h-full object-cover rounded-lg"
                >
                <i
                  v-else
                  class="pi pi-image text-2xl text-gray-400"
                />
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="font-semibold truncate">
                  {{ item.name }}
                </div>
                <div class="text-sm text-gray-400">
                  {{ item.category }}
                </div>
                <div class="text-sm font-semibold text-primary dark:text-primary-400 mt-1">
                  {{ getCurrency(item.price) }}
                </div>
              </div>
              
              <div class="flex flex-col items-end justify-between">
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  size="small"
                  @click="removeItem(item.id)"
                />
                
                <div class="flex items-center gap-2">
                  <Button
                    icon="pi pi-minus"
                    size="small"
                    rounded
                    outlined
                    @click="decrementQuantity(item.id)"
                  />
                  <span class="w-8 text-center font-semibold">
                    {{ item.quantity }}
                  </span>
                  <Button
                    icon="pi pi-plus"
                    size="small"
                    rounded
                    outlined
                    :disabled="item.quantity >= item.stock_qty"
                    @click="incrementQuantity(item.id)"
                  />
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-800 dark:text-gray-400">Subtotal</span>
              <span class="font-semibold">
                {{ getCurrency(Number(item.price) * item.quantity) }}
              </span>
            </div>

            <Textarea
              v-model="item.customer_note"
              class="w-full"
              rows="2"
              placeholder="Catatan untuk item ini..."
            />
          </div>
        </UiCard>

        <Divider />

        <UiFormGroup label="Meja" variant="vertical">
          <div class="flex gap-2">
            <Dropdown
              v-model="transactionForm.table_id"
              :options="tableOptions"
              option-label="label"
              option-value="id"
              placeholder="Pilih meja"
              class="w-full"
              :loading="isLoadingTables"
              :disabled="!transactionForm.outlet_id || tableOptions.length === 0"
              show-clear
            />
            <Button
              v-if="transactionForm.table_id"
              severity="secondary"
              variant="outlined"
              icon="pi pi-times"
              aria-label="Hapus meja"
              @click="transactionForm.table_id = ''"
            />
          </div>
          <p
            v-if="!isLoadingTables && transactionForm.outlet_id && tableOptions.length === 0"
            class="text-xs text-gray-400"
          >
            Tidak ada meja aktif untuk outlet ini.
          </p>
        </UiFormGroup>
      </div>
    </div>

    <Divider class="m-0!" />

    <div
      v-if="isUserInShift"
      class="post-cart__footer"
      :class="{
        'post-cart__footer--mobile': isMobile,
      }"
    >
      <div class="pos-cart__section space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm">
            Total ({{ posStore.cartItemCount }})
          </span>
          <span class="text-sm text-primary dark:text-primary-400 font-semibold">
            {{ getCurrency(posStore.cartTotal) }}
          </span>
        </div>
        <div
          v-if="targetTransactionId"
          class="flex gap-2"
        >
          <Button
            label="Tambah ke Pesanan"
            size="medium"
            fluid
            :disabled="posStore.cartItems.length === 0 || isAddingItems"
            @click="onAddItemsToOrder"
          />
        </div>
        <div
          v-else
          class="flex flex-col gap-2"
        >
          <Button
            label="Buat Pesanan"
            size="medium"
            severity="secondary"
            variant="outlined"
            fluid
            :disabled="isCanCheckout || isCreatingOrder"
            @click="onCreateOrder"
          />
          <Button
            label="Lanjut ke Pembayaran"
            size="medium"
            fluid
            :disabled="isCanCheckout"
            @click="openPaymentModal"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Cart Trigger -->
  <div
    class="pos-cart__trigger pos-cart__trigger--sticky"
    :class="{
      // 'pos-cart__trigger--mobile': isMobile,
      // 'pos-cart__trigger--desktop': !isMobile,
      'pos-cart__trigger--open': !isWeb,
    }"
  >
    <UiCard class="pos-cart__trigger-content pos-cart__trigger-content--dark">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-primary-50 dark:bg-primary-900 flex flex-col justify-center items-center rounded-full">
            <i class="pi pi-shopping-cart text-primary-500 dark:text-primary-400" />
          </div>
          <div class="flex-1 space-y-1">
            <div class="text-sm text-gray-400">
              Keranjang Outlet
            </div>
            <div class="flex items-center">
              <span class="text-base font-bold">
                {{ posStore.cartItemCount || 0 }} Item
              </span>
              <Divider layout="vertical" />
              <span
                class="text-base font-bold"
                :class="{
                  'text-primary dark:text-primary-400': posStore.cartTotal,
                }"
              >
                {{ getCurrency(posStore.cartTotal) }}
              </span>
            </div>
          </div>
        </div>

        <Button
          severity="secondary"
          variant="outlined"
          size="medium"
          icon="pi pi-arrow-right"
          @click="openCloseCart"
        />
      </div>
    </UiCard>
  </div>

  <PaymentModal
    v-model:visibility="showPaymentModal"
    v-model:payment-method="transactionForm.payment_method"
    v-model:is-offline="transactionForm.is_offline"
    v-model:cash-amount="cashPaidAmount"
    :total-amount="posStore.cartTotal"
    @confirm="onCheckout"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/modules/auth/stores/index.ts';
import { usePosStore } from '@/modules/transaction/stores-pos';
import { getCurrency } from '@/helpers/utils.ts';
import { useGlobalLoading } from '@/composables/useGlobalLoading.ts';
import { showConfirm, showToast } from '@/helpers/toast.ts';
import { getOutletTables, postTransaction, patchTransactionItems } from '@/modules/transaction/services/api.ts';
import UiCard from '@/components/UiCard.vue';
import PaymentModal from '@/modules/transaction/components/PaymentModal.vue';

const props = defineProps({
  isUserInShift: {
    type: Boolean,
    default: false,
  },
  shiftId: {
    type: String,
    default: ''
  },
  outletId: {
    type: String,
    default: ''
  },
  targetTransactionId: {
    type: String,
    default: ''
  },
});

const emit = defineEmits(['checkout-success', 'add-items-success']);

const { show, hide } = useGlobalLoading();
const posStore = usePosStore();
const isCheckingOut = ref(false);
const isCreatingOrder = ref(false);
const isAddingItems = ref(false);

const transactionForm = ref({
  outlet_id: '',
  shift_id: '',
  table_id: '',
  payment_method: 'cash',
  is_offline: true,
  device_id: `device-${Date.now()}`,
});

const tableOptions = ref<any[]>([]);
const isLoadingTables = ref(false);
const cashPaidAmount = ref<number>(0);
const showPaymentModal = ref(false);
const isCashPayment = computed(() => transactionForm.value.payment_method === 'cash');
const hasInsufficientCash = computed(() => isCashPayment.value && cashPaidAmount.value < posStore.cartTotal);
const cashChangeAmount = computed(() =>
  isCashPayment.value ? Math.max(0, cashPaidAmount.value - posStore.cartTotal) : 0,
);

const fetchTables = async (outletId: string) => {
  if (!outletId) {
    tableOptions.value = [];
    transactionForm.value.table_id = '';
    return;
  }

  try {
    isLoadingTables.value = true;
    const response = await getOutletTables(outletId);
    tableOptions.value = (response?.data?.data || []).map((table: any) => ({
      ...table,
      label: table.code ? `${table.name} (${table.code})` : table.name,
    }));

    if (
      transactionForm.value.table_id &&
      !tableOptions.value.some((table) => table.id === transactionForm.value.table_id)
    ) {
      transactionForm.value.table_id = '';
    }
  } catch (error) {
    console.error('Failed to fetch outlet tables:', error);
    tableOptions.value = [];
  } finally {
    isLoadingTables.value = false;
  }
};

// Cart Items
const removeItem = (productId: string) => {
  posStore.removeFromCart(productId);
};

const incrementQuantity = (productId: string) => {
  posStore.incrementQuantity(productId);
};

const decrementQuantity = (productId: string) => {
  posStore.decrementQuantity(productId);
};

const onClearCart = () => {
  showConfirm({
    header: 'Kosongkan Keranjang',
    message: 'Apakah Anda yakin ingin mengosongkan keranjang?',
    rejectLabel: 'Batal',
    acceptLabel: 'Kosongkan',
    type: 'warn',
    accept: () => {
      posStore.clearCart();
      showToast({
        type: 'success',
        title: 'Keranjang Dikosongkan',
        message: 'Semua item telah dihapus dari keranjang',
      });
    },
  });
};

// Checkout Process
const isCanCheckout = computed(() => {
  return (
    posStore.cartItems.length === 0 ||
    isCheckingOut.value ||
    !transactionForm.value.shift_id ||
    !transactionForm.value.outlet_id ||
    !transactionForm.value.payment_method
  );
});

const openPaymentModal = () => {
  if (isCanCheckout.value) return;
  showPaymentModal.value = true;
};

const onCheckout = async () => {
  if (isCheckingOut.value) return;

  // Validate form
  if (!transactionForm.value.outlet_id) {
    showToast({
      type: 'error',
      title: 'Validasi Gagal',
      message: 'Silakan pilih outlet terlebih dahulu',
    });
    return;
  }

  if (!transactionForm.value.shift_id) {
    showToast({
      type: 'error',
      title: 'Validasi Gagal',
      message: 'Silakan pilih shift terlebih dahulu',
    });
    return;
  }

  if (!transactionForm.value.payment_method) {
    showToast({
      type: 'error',
      title: 'Validasi Gagal',
      message: 'Silakan pilih metode pembayaran',
    });
    return;
  }

  if (hasInsufficientCash.value) {
    showToast({
      type: 'error',
      title: 'Validasi Gagal',
      message: 'Jumlah uang tunai yang diterima kurang dari total pembayaran',
    });
    return;
  }

  try {
    isCheckingOut.value = true;
    show();

    // Prepare transaction payload
    const payload: any = {
      outlet_id: transactionForm.value.outlet_id,
      shift_id: transactionForm.value.shift_id,
      payment_method: transactionForm.value.payment_method,
      is_offline: transactionForm.value.is_offline,
      device_id: transactionForm.value.device_id,
      table_id: transactionForm.value.table_id || undefined,
      cash_received: isCashPayment.value ? cashPaidAmount.value : undefined,
      change_amount: isCashPayment.value ? cashChangeAmount.value : undefined,
      items: posStore.cartItems.map(item => ({
        product_id: item.id,
        qty: item.quantity,
        customer_note: item.customer_note || undefined
      }))
    };

    const response = await postTransaction(payload);

    if (response.data) {
      showToast({
        type: 'success',
        title: 'Transaksi Berhasil',
        message: 'Transaksi telah berhasil diproses',
      });

      posStore.clearCart();
      openCloseCart();
      showPaymentModal.value = false;

      // Emit event to parent to handle form clearing
      emit('checkout-success');
      cashPaidAmount.value = 0;
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    showToast({
      type: 'error',
      title: 'Transaksi Gagal',
      message: error.response?.data?.message || 'Gagal memproses transaksi',
    });
  } finally {
    isCheckingOut.value = false;
    hide();
  }
};

const onCreateOrder = () => {
  if (isCanCheckout.value || isCreatingOrder.value) return;

  showConfirm({
    header: 'Buat Pesanan',
    message: 'Apakah Anda yakin ingin membuat pesanan ini? Pesanan akan dibuat tanpa pembayaran dan bisa dibayar nanti.',
    rejectLabel: 'Batal',
    acceptLabel: 'Ya, Buat Pesanan',
    type: 'info',
    accept: () => {
      submitCreateOrder();
    },
  });
};

const submitCreateOrder = async () => {
  try {
    isCreatingOrder.value = true;
    show();

    const payload: any = {
      outlet_id: transactionForm.value.outlet_id,
      shift_id: transactionForm.value.shift_id,
      payment_method: 'pending',
      pay_now: false,
      is_offline: transactionForm.value.is_offline,
      device_id: transactionForm.value.device_id,
      table_id: transactionForm.value.table_id || undefined,
      items: posStore.cartItems.map(item => ({
        product_id: item.id,
        qty: item.quantity,
        customer_note: item.customer_note || undefined
      }))
    };

    const response = await postTransaction(payload);

    if (response.data) {
      showToast({
        type: 'success',
        title: 'Pesanan Dibuat',
        message: 'Pesanan berhasil dibuat, menunggu pembayaran',
      });

      posStore.clearCart();
      openCloseCart();

      emit('checkout-success');
    }
  } catch (error: any) {
    console.error('Create order error:', error);
    showToast({
      type: 'error',
      title: 'Gagal Membuat Pesanan',
      message: error.response?.data?.message || 'Gagal membuat pesanan',
    });
  } finally {
    isCreatingOrder.value = false;
    hide();
  }
};

const onAddItemsToOrder = async () => {
  if (posStore.cartItems.length === 0 || isAddingItems.value) return;

  try {
    isAddingItems.value = true;
    show();

    const payload = {
      items: posStore.cartItems.map(item => ({
        product_id: item.id,
        qty: item.quantity,
        customer_note: item.customer_note || undefined
      })),
    };

    const response = await patchTransactionItems(props.targetTransactionId, payload);

    if (response.data) {
      showToast({
        type: 'success',
        title: 'Item Ditambahkan',
        message: 'Item berhasil ditambahkan ke pesanan',
      });

      posStore.clearCart();
      emit('add-items-success');
    }
  } catch (error: any) {
    console.error('Add items error:', error);
    showToast({
      type: 'error',
      title: 'Gagal Menambah Item',
      message: error.response?.data?.message || 'Gagal menambahkan item ke pesanan',
    });
  } finally {
    isAddingItems.value = false;
    hide();
  }
};

// Device type
const authStore = useAuthStore();
const { deviceType } = storeToRefs(authStore);

const isMobile = computed(() => deviceType.value === 'mobile');
const isWeb = computed(() => deviceType.value === 'web');

// Open/Close Cart in Responsive
const showCartMobile = ref(false);

const openCloseCart = () => {
  showCartMobile.value = !showCartMobile.value;
};

watch(() => props.outletId, (newVal: string) => {
  transactionForm.value.outlet_id = newVal;
  fetchTables(newVal);
}, { immediate: true });

watch(() => props.shiftId, (newVal: string) => {
  transactionForm.value.shift_id = newVal;
}, { immediate: true });

watch(() => transactionForm.value.payment_method, (method: string) => {
  if (method !== 'cash') {
    cashPaidAmount.value = 0;
  }
});
</script>
<style>
@import 'tailwindcss';
@import '@/assets/styles/themes.css';

.pos-cart {
  @apply w-full flex flex-col justify-between bg-white dark:bg-dark-secondary;
}

.pos-cart--desktop {
  @apply sticky top-[72px] h-[calc(100vh-90px)] border border-gray-200 dark:border-dark-secondary rounded-lg overflow-hidden;
}

.pos-cart--mobile {
  @apply fixed top-0 h-full -right-full xl:right-0 xl:z-0 bg-white dark:bg-dark-secondary;
  z-index: 100;
}

.pos-cart--animation {
  @apply transition-all duration-300;
}

.pos-cart--open {
  @apply right-0;
}

.pos-cart__header {
  @apply w-full py-3 px-4 flex items-center justify-between;
}

.pos-cart__header--mobile {
  @apply py-3 px-4;
}

.pos-cart__section {
  @apply p-4 rounded-none;
}

.pos-cart__section-item {
  @apply flex-1 overflow-y-auto;
}

.post-cart__footer {
  @apply w-full;
}

.pos-cart__trigger {
  @apply left-0 w-full hidden;
  z-index: 10;
}

.pos-cart__trigger--fixed {
  @apply fixed bottom-0 py-4;
}

.pos-cart__trigger--sticky {
  @apply sticky bottom-4;
}

.pos-cart__trigger--mobile {
  @apply pl-4 pr-4;
}

.pos-cart__trigger--desktop {
  @apply pl-20 pr-4;
}

.pos-cart__trigger--open {
  @apply block;
}

.pos-cart__trigger-content {
  @apply w-full py-2! px-3! shadow-xl!;
}

.pos-cart__trigger-content--dark {
  @apply dark:bg-dark-secondary dark:border-dark-secondary;
}
</style>
