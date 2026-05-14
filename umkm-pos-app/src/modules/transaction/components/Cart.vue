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
        Cart ({{ posStore.cartItemCount }})
      </h1>
      <div class="flex gap-4">
        <Button
          severity="danger"
          variant="outlined"
          icon="pi pi-trash"
          label="Clear All"
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
        <p class="text-sm text-gray-500">Cart is empty</p>
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
          </div>
        </UiCard>
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
        <div class="space-y-2">
          <div class="text-sm font-medium text-gray-800 dark:text-gray-400">Payment Method</div>
          <Select
            v-model="transactionForm.payment_method"
            :options="paymentMethods"
            option-label="label"
            option-value="value"
            placeholder="Select Payment Method"
            fluid
            class="w-full"
          />
        </div>

        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-800 dark:text-gray-400">Is Offline Order?</label>
          <InputSwitch
            v-model="transactionForm.is_offline"
            :binary="true"
          />
        </div>
      </div>

      <Divider class="m-0!" />
      
      <div class="pos-cart__section space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm">
            Total ({{ posStore.cartItemCount }})
          </span>
          <span class="text-sm text-primary dark:text-primary-400 font-semibold">
            {{ getCurrency(posStore.cartTotal) }}
          </span>
        </div>
        <Button
          label="Checkout"
          size="medium"
          fluid
          :disabled="isCanCheckout"
          :loading="isCheckingOut"
          @click="onCheckout"
        />
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
              Outlet Cart
            </div>
            <div class="flex items-center">
              <span class="text-base font-bold">
                {{ posStore.cartItemCount || 0 }} Items
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/modules/auth/stores/index.ts';
import { usePosStore } from '@/modules/transaction/stores-pos';
import { getCurrency } from '@/helpers/utils.ts';
import { showConfirm, showToast } from '@/helpers/toast.ts';
import { postTransaction } from '@/modules/transaction/services/api.ts';
import UiCard from '@/components/UiCard.vue';

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
});

const emit = defineEmits(['checkout-success']);

const posStore = usePosStore();
const isCheckingOut = ref(false);

const transactionForm = ref({
  outlet_id: '',
  shift_id: '',
  payment_method: 'cash',
  is_offline: true,
  device_id: `device-${Date.now()}`,
});

const paymentMethods = ref([
  { label: 'Cash', value: 'cash' },
  { label: 'Debit Card', value: 'debit' },
  { label: 'Credit Card', value: 'credit' },
  { label: 'E-Wallet', value: 'e-wallet' },
  { label: 'QRIS', value: 'qris' },
]);

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
    header: 'Clear Cart',
    message: 'Are you sure you want to clear the cart?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Clear',
    type: 'warn',
    accept: () => {
      posStore.clearCart();
      showToast({
        type: 'success',
        title: 'Cart cleared',
        message: 'All items removed from cart',
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

const onCheckout = async () => {
  if (isCheckingOut.value) return;
  
  // Validate form
  if (!transactionForm.value.outlet_id) {
    showToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please select an outlet',
    });
    return;
  }
  
  if (!transactionForm.value.shift_id) {
    showToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please select a shift',
    });
    return;
  }
  
  if (!transactionForm.value.payment_method) {
    showToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please select a payment method',
    });
    return;
  }
  
  try {
    isCheckingOut.value = true;
    
    // Prepare transaction payload
    const payload: any = {
      outlet_id: transactionForm.value.outlet_id,
      shift_id: transactionForm.value.shift_id,
      payment_method: transactionForm.value.payment_method,
      is_offline: transactionForm.value.is_offline,
      device_id: transactionForm.value.device_id,
      items: posStore.cartItems.map(item => ({
        product_id: item.id,
        qty: item.quantity
      }))
    };
    
    const response = await postTransaction(payload);
    
    if (response.data) {
      showToast({
        type: 'success',
        title: 'Transaction Complete',
        message: 'Transaction has been processed successfully',
      });
      
      posStore.clearCart();
      openCloseCart();
      
      // Emit event to parent to handle form clearing
      emit('checkout-success');
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    showToast({
      type: 'error',
      title: 'Checkout Failed',
      message: error.response?.data?.message || 'Failed to process transaction',
    });
  } finally {
    isCheckingOut.value = false;
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
}, { immediate: true });

watch(() => props.shiftId, (newVal: string) => {
  transactionForm.value.shift_id = newVal;
}, { immediate: true });
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