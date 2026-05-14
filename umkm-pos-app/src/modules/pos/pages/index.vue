<template>
  <div
    class="pos"
    :class="{
      'pos--mobile': !isWeb,
      'pos--desktop': isWeb,
    }"
  >
    <!-- POS Product -->
    <div class="pos__content">
      <!-- Warning Shift -->
      <Message
        v-if="isShiftClosed"
        severity="warn"
        icon="pi pi-info-circle"
      >
        <b>Shift is closed.</b><br>
        <span class="text-sm">
          Please open new shit to create transactions.
        </span>
      </Message>

      <!-- Warning Shift -->
      <ShiftStatus />

      <!-- Products Tab -->
      <PosProduct
        :is-user-in-shift="isShiftUserCanManage"
      />
    </div>

    <!-- POS Cart -->
    <PosCart
      :is-user-in-shift="isShiftUserCanManage"
      :shift-id="currentShift?.id"
      :outlet-id="currentShift?.outlet_id"
      class="pos__cart"
      @checkout-success="clearForm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { getOutlet } from '@/helpers/auth.ts';
import { useAuthStore } from '@/modules/auth/stores/index.ts';
import { useShift } from '@/modules/shift/composables/useShift.ts';
import { getOutletShift } from '@/modules/shift/services/api.ts';
import { usePosStore } from '@/modules/transaction/stores-pos';
import ShiftStatus from '@/modules/transaction/components/ShiftStatus.vue';
import PosCart from '@/modules/transaction/components/Cart.vue';
import PosProduct from '@/modules/transaction/components/Product.vue';

const outlet = getOutlet();
const posStore = usePosStore();

// Device type
const authStore = useAuthStore();
const { deviceType } = storeToRefs(authStore);

const isWeb = computed(() => deviceType.value === 'web');

// Computed for Shift
const {
  isShiftClosed,
  isShiftUserCanManage,
  currentShift,
  fetchShift,
} = useShift();

// Task 26: Clear form - reset all state to defaults
const clearForm = () => {
  posStore.clearCart();
};

const fetchOutletShift = async () => {
  try {
    const response = await getOutletShift(outlet.id);
    const shiftData = response?.data?.data || {};
    if (shiftData?.id) {
      await fetchShift({ shiftId: shiftData.id });
    }
  } catch (error) {
    console.error('Failed to fetch outlet shift:', error);
  }
};

onMounted(() => {
  fetchOutletShift();
});
</script>

<style scoped>
@import "tailwindcss";
@import "@/assets/styles/themes.css";

.pos {
  @apply w-full h-full grid gap-4;
}

.pos--mobile {
  @apply grid-cols-1;
  /* @apply grid-cols-1 pb-20; */
}

.pos--desktop {
  @apply grid-cols-[1fr_minmax(0,380px)];
}

.pos__content {
  @apply relative flex-1 space-y-4;
}

.pos__cart {
  @apply sticky right-0 flex-1;
  top: 72px;
  height: max(100vh - 90px);
}
</style>
