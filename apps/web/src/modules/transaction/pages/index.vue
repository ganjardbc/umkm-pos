<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col xl:flex-row gap-3 xl:items-end">
      <div class="flex-1 min-w-0">
        <UiSearch
          v-model="form.search"
          type="search"
          class="w-full"
          @input="search"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:flex gap-3 xl:items-end">
        <div class="min-w-0 xl:w-48">
          <Select
            v-model="filter.is_cancelled"
            :options="listOfCancelFilters"
            option-label="label"
            option-value="value"
            placeholder="Status"
            class="w-full"
            @change="applyFilters"
          />
        </div>

        <div class="min-w-0 xl:w-48">
          <Select
            v-model="filter.order_status"
            :options="orderStatusFilters"
            option-label="label"
            option-value="value"
            placeholder="Order Status"
            class="w-full"
            @change="applyFilters"
          />
        </div>
      </div>
    </div>

    <UiLoading
      v-if="loading"
      message="Loading notifications..."
    />

    <div v-else-if="transactions.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Transactions are empty.</p>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <UiCard
        v-for="(trx, index) in transactions"
        :key="trx.id"
        class="relative overflow-hidden"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
              {{ trx.customer_name_snapshot || trx.users?.name || '-' }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              #{{ getNoTable(index, pagination.page, pagination.rows) }}
            </p>
          </div>
          <div class="flex shrink-0 gap-1">
            <Tag
              :value="trx.is_cancelled ? 'Cancelled' : 'Active'"
              :severity="trx.is_cancelled ? 'danger' : 'info'"
              class="capitalize text-xs!"
            />
            <Tag
              v-if="trx.order_source === 'customer_catalog'"
              :value="getOrderStatusLabel(trx.order_status)"
              severity="warning"
              class="capitalize text-xs!"
            />
          </div>
        </div>

        <Divider class="my-0!" />

        <div class="grid grid-cols-2 gap-y-2 text-xs">
          <span class="text-slate-400">Source</span>
          <span class="text-right">
            <Tag
              :value="trx.order_source === 'customer_catalog' ? 'CC' : 'POS'"
              :severity="trx.order_source === 'customer_catalog' ? 'warning' : 'info'
"
              class="text-xs!"
            />
          </span>

          <span class="text-slate-400">Mode</span>
          <span class="text-right">
            <Tag
              :value="trx.is_offline ? 'Offline' : 'Online'"
              :severity="trx.is_offline ? 'danger' : 'success'"
              class="capitalize text-xs!"
            />
          </span>

          <span class="text-slate-400">Payment</span>
          <span class="text-right capitalize text-slate-700 dark:text-slate-300">{{ trx.payment_method }}</span>

          <span class="text-slate-400">Items</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ trx.transaction_items?.length || 0 }}x</span>

          <span class="text-slate-400">Date</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ formatDateTime(trx.created_at) }}</span>
        </div>

        <Divider class="my-0!" />

        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-primary dark:text-primary-400">
            {{ getCurrency(trx.total_amount) }}
          </span>
          <div class="flex gap-1">
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-eye"
              size="small"
              :disabled="!iscanDetail"
              @click="openDetail(trx)"
            />
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-print"
              size="small"
              :disabled="!isCanPrint || trx.is_cancelled"
              @click="openPrintReceipt(trx)"
            />
            <Button
              v-if="trx.order_source === 'customer_catalog' && trx.order_status !== 'selesai'"
              severity="success"
              variant="outlined"
              icon="pi pi-arrow-right"
              size="small"
              :disabled="!isCanUpdateStatus"
              @click="advanceStatus(trx)"
            />
            <Button
              severity="danger"
              variant="outlined"
              icon="pi pi-times"
              size="small"
              :disabled="!isCanCancel || trx.is_cancelled"
              @click="onCancelTransaction(trx)"
            />
          </div>
        </div>
      </UiCard>
    </div>

    <UiPagination
      v-model="pagination"
      class="px-0!"
      @page="onPageChange"
    />
  </div>

  <ReceiptModal
    v-if="isCanPrint"
    v-model:visibility="showReceiptModal"
    :selected="selectedTransaction"
    @cancel="cancelReceiptModal"
  />

  <PaymentModal
    v-model:visibility="showPaymentModal"
    v-model:paymentMethod="paymentPayload.payment_method"
    v-model:isOffline="paymentPayload.is_offline"
    v-model:cashAmount="paymentPayload.cash_received"
    :totalAmount="paymentPayload.total_amount"
    @confirm="confirmPayment"
  />
</template>

<script setup lang="ts">
import { type ReceiptData } from '../utils/receiptGenerator';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getNoTable, getErrorMessage, getCurrency, formatDateTime } from '@/helpers/utils.ts';
import { getListTransaction, patchTransactionStatus, postCancelTransaction } from '@/modules/transaction/services/api.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { getOutlet } from '@/helpers/auth.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';
import UiLoading from '@/components/UiLoading.vue';
import ReceiptModal from '@/modules/transaction/components/ReceiptModal.vue';
import PaymentModal from '@/modules/transaction/components/PaymentModal.vue';
import { READ, PRINT, CANCEL, UPDATE_STATUS } from '@/modules/transaction/services/rbac.ts';
import { getOrderStatusLabel } from '@/modules/transaction/services/status-labels.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/transaction/services/constants.ts';

const router = useRouter();
const outlet = getOutlet();

// RBAC
const isCanPrint = computed(() => isHasPermission(PRINT));
const iscanDetail = computed(() => isHasPermission(READ));
const isCanCancel = computed(() => isHasPermission(CANCEL));
const isCanUpdateStatus = computed(() => isHasPermission(UPDATE_STATUS));

const listOfCancelFilters = [
  { label: 'All Status', value: null },
  { label: 'Active', value: false },
  { label: 'Cancelled', value: true },
];
const orderStatusFilters = [
  { label: 'All Orders', value: null },
  { label: 'Menunggu', value: 'menunggu_konfirmasi' },
  { label: 'Diterima', value: 'diterima' },
  { label: 'Diproses', value: 'diproses' },
  { label: 'Sampai', value: 'sampai' },
  { label: 'Selesai', value: 'selesai' },
];

// Fetch Data
const loading = ref(false);
const transactions = ref<any[]>([]);
const filter = ref({
  outlet_id: outlet?.id,
  is_cancelled: null,
  order_status: null,
});
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchTransaction = async () => {
  try {
    loading.value = true;

    const payload = {
      outlet_id: outlet?.id,
      page: pagination.value.page,
      limit: pagination.value.rows,
      is_cancelled: filter.value.is_cancelled,
      order_status: filter.value.order_status,
    }
    const response = await getListTransaction(payload);
    const { data, meta } = response?.data?.data || {};

    transactions.value = data || [];
    pagination.value.totalRecords = meta?.total;
    pagination.value.pageCount = meta?.totalPages;
  } catch (error) {
    console.log(error);
    showToast({
        type: 'error',
        title: 'Error.',
        message: getErrorMessage(error) || 'There was an error.',
    });
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event: any) => {
  pagination.value.page = event.page + 1;
  fetchTransaction();
};

// Receipt Modal
const showReceiptModal = ref(false);
const selectedTransaction = ref({} as ReceiptData);

const cancelReceiptModal = () => {
  showReceiptModal.value = false;
};

const openPrintReceipt = (transaction: any) => {
  selectedTransaction.value = transaction;
  showReceiptModal.value = true;
};

const nextStatusMap: Record<string, any> = {
  menunggu_konfirmasi: { order_status: 'diterima' },
  diterima: { order_status: 'diproses' },
  diproses: { order_status: 'sampai' },
};

// Payment Modal
const showPaymentModal = ref(false);
const paymentTarget = ref<any>(null);
const paymentPayload = ref({
  total_amount: 0,
  payment_method: 'cash',
  cash_received: 0,
  is_offline: false,
});

const openPaymentModal = (transaction: any) => {
  paymentTarget.value = transaction;
  paymentPayload.value = {
    total_amount: Number(transaction.total_amount),
    payment_method: 'cash',
    cash_received: 0,
    is_offline: transaction.is_offline || false,
  };
  showPaymentModal.value = true;
};

const confirmPayment = async () => {
  try {
    showLoading();
    const payload: any = {
      order_status: 'selesai',
      payment_method: paymentPayload.value.payment_method,
      is_offline: paymentPayload.value.is_offline,
    };
    if (payload.payment_method === 'cash') {
      payload.cash_received = Number(paymentPayload.value.cash_received);
      payload.change_amount = Math.max(0, payload.cash_received - paymentPayload.value.total_amount);
    }
    await patchTransactionStatus(paymentTarget.value.id, payload);
    showPaymentModal.value = false;
    showToast({
      type: 'success',
      title: 'Success',
      message: 'Payment completed successfully.',
    });
    fetchTransaction();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error.',
      message: getErrorMessage(error) || 'Failed to process payment.',
    });
  } finally {
    hideLoading();
  }
};

// Actions
const cancelTransaction = async (id: string) => {
  try {
    showLoading();

    const response = await postCancelTransaction(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Transaction has been cancelled and stock has been restored.'
      });
      fetchTransaction();
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  } finally {
    hideLoading();
  }
};

const onCancelTransaction = (transaction: any) => {
  showConfirm({
    header: 'Cancel Transaction',
    message: 'Are you sure you want to cancel this transaction? Stock will be restored.',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Cancel',
    type: 'warn',
    accept: () => {
      cancelTransaction(transaction?.id);
    },
  });
};

const advanceStatus = async (transaction: any) => {
  if (transaction.order_status === 'sampai') {
    openPaymentModal(transaction);
    return;
  }
  try {
    const payload = { ...nextStatusMap[transaction.order_status] };
    await patchTransactionStatus(transaction.id, payload);
    fetchTransaction();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to update status.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

// Detail Transactions
const openDetail = (transaction: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: { id: transaction.id }
  });
};

// Filters
const applyFilters = () => {
  pagination.value.page = 1;
  fetchTransaction();
};

// Search
const form = ref({
  search: '',
});

const search = () => {
  console.log(form.value);
};

onMounted(() => {
  fetchTransaction();
});
</script>

<style scoped>
</style>
