<template>
  <div
    ref="receiptRef"
    class="receipt-container bg-white p-6 rounded-lg border border-gray-200"
  >
    <!-- Header -->
    <div class="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300">
      <h2 class="text-lg font-bold text-gray-900">{{ transaction?.outlets?.name }}</h2>
      <p class="text-xs text-gray-400 mt-1">{{ transaction?.outlets?.location }}</p>
      <p class="text-xs text-gray-500 mt-2">Receipt #{{ transaction?.id?.slice(0, 8).toUpperCase() }}</p>
    </div>

    <!-- Transaction Info -->
    <div class="text-xs text-gray-700 mb-4 space-y-1">
      <div class="flex justify-between">
        <span>Date:</span>
        <span>{{ formatDate(transaction?.created_at) }}</span>
      </div>
      <div class="flex justify-between">
        <span>Time:</span>
        <span>{{ formatTime(transaction?.created_at) }}</span>
      </div>
      <div class="flex justify-between">
        <span>Cashier:</span>
        <span>{{ transaction?.users?.name }}</span>
      </div>
      <div class="flex justify-between">
        <span>Payment:</span>
        <span class="capitalize">{{ transaction?.payment_method }}</span>
      </div>
    </div>

    <!-- Items -->
    <div class="mb-4 pb-4 border-b-2 border-dashed border-gray-300">
      <div class="text-xs font-semibold text-gray-900 mb-2 grid grid-cols-12 gap-1">
        <div class="col-span-6">Item</div>
        <div class="col-span-2 text-right">Qty</div>
        <div class="col-span-2 text-right">Price</div>
        <div class="col-span-2 text-right">Total</div>
      </div>
      <div
        v-for="item in transaction?.transaction_items"
        :key="item.id"
        class="text-xs text-gray-700 mb-2 grid grid-cols-12 gap-1"
      >
        <div class="col-span-6 truncate">{{ item.product_name_snapshot }}</div>
        <div class="col-span-2 text-right">{{ item.qty }}x</div>
        <div class="col-span-2 text-right">{{ formatCurrency(item.price_snapshot) }}</div>
        <div class="col-span-2 text-right font-semibold">{{ formatCurrency(item.subtotal) }}</div>
      </div>
    </div>

    <!-- Total -->
    <div class="mb-4 space-y-2">
      <div class="flex justify-between text-sm font-bold text-gray-900">
        <span>Total Amount:</span>
        <span>{{ formatCurrency(transaction?.total_amount) }}</span>
      </div>
      <div v-if="transaction?.is_offline" class="flex justify-between text-xs text-orange-600 font-semibold">
        <span>Mode:</span>
        <span>OFFLINE</span>
      </div>
      <div v-if="transaction?.is_cancelled" class="flex justify-between text-xs text-red-600 font-semibold">
        <span>Status:</span>
        <span>CANCELLED</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center pt-4 border-t-2 border-dashed border-gray-300">
      <p class="text-xs text-gray-400">Thank you for your purchase!</p>
      <p class="text-xs text-gray-500 mt-2">{{ transaction?.outlets?.name }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  transaction: {
    type: Object,
    required: true,
    default: () => {},
  }
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseInt(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};
</script>

<style scoped>
.receipt-container {
  font-family: 'Courier New', monospace;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}
</style>
