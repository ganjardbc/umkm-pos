<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col xl:flex-row gap-3 xl:items-end">
      <div class="flex-1 min-w-0">
        <UiSearch
          v-model="form.search"
          type="search"
          placeholder="Cari transaksi..."
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
            placeholder="Status Pesanan"
            class="w-full"
            @change="applyFilters"
          />
        </div>
      </div>
    </div>

    <UiLoading
      v-if="loading"
      message="Memuat transaksi..."
    />

    <div v-else-if="transactions.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Belum ada transaksi.</p>
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
              :value="trx.is_cancelled ? 'Dibatalkan' : 'Aktif'"
              :severity="trx.is_cancelled ? 'danger' : 'info'"
              class="capitalize text-xs!"
            />
            <Tag
              :value="getOrderStatusLabel(trx.order_status)"
              severity="warning"
              class="capitalize text-xs!"
            />
          </div>
        </div>

        <Divider class="my-0!" />

        <div class="w-full space-y-2">
          <div class="flex justify-between items-center gap-2">
            <span class="text-xs text-slate-400">Sumber</span>
            <Tag
              :value="trx.order_source === 'customer_catalog' ? 'CC' : 'POS'"
              :severity="trx.order_source === 'customer_catalog' ? 'warning' : 'info'"
              class="text-xs!"
            />
          </div>

          <div class="flex justify-between items-center gap-2">
            <span class="text-xs text-slate-400">Mode</span>
            <Tag
              :value="trx.is_offline ? 'Offline' : 'Online'"
              :severity="trx.is_offline ? 'danger' : 'success'"
              class="capitalize text-xs!"
            />
          </div>

          <div class="flex justify-between items-center gap-2">
            <span class="text-xs text-slate-400">Pembayaran</span>
            <span class="text-sm text-right capitalize text-slate-700 dark:text-slate-300">{{ trx.payment_method }}</span>
          </div>

          <div class="flex justify-between items-center gap-2">
            <span class="text-xs text-slate-400">Item</span>
            <span class="text-sm text-right text-slate-700 dark:text-slate-300">{{ trx.transaction_items?.length || 0 }}x</span>
          </div>

          <div class="flex justify-between items-center gap-2">
            <span class="text-xs text-slate-400">Tanggal</span>
            <span class="text-sm text-right text-slate-700 dark:text-slate-300">{{ formatDateTime(trx.created_at) }}</span>
          </div>
        </div>

        <Divider class="my-0!" />

        <div class="flex justify-between items-center gap-2">
          <span class="text-xs text-slate-400">Total</span>
          <span class="text-right text-base font-bold text-primary dark:text-primary-400">
            {{ getCurrency(trx.total_amount) }}
          </span>
        </div>

        <Divider class="my-0!" />

        <div class="flex-1 flex justify-between items-center">
          <Button
            :label="advanceStatusLabelMap[trx.order_status]"
            :severity="trx.order_status !== 'selesai' ? 'success' : 'secondary'"
            variant="outlined"
            icon="pi pi-ellipsis-h"
            size="small"
            :disabled="!isCanUpdateStatus || trx.order_status === 'selesai'"
            @click="advanceStatus(trx)"
          />

          <div class="flex gap-1 justify-end">
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-eye"
              size="small"
              :disabled="!iscanDetail"
              @click="openDetail(trx)"
            />
            <Button
              v-if="trx.payment_method === 'pending'"
              severity="warning"
              variant="outlined"
              icon="pi pi-wallet"
              size="small"
              :disabled="!isCanPay || trx.is_cancelled"
              @click="openPaymentModal(trx)"
            />
            <Button
              v-else
              severity="secondary"
              variant="outlined"
              icon="pi pi-print"
              size="small"
              :disabled="!isCanPrint || trx.is_cancelled"
              @click="openPrintReceipt(trx)"
            />
            <Button
              v-if="false"
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
import { getNoTable, getErrorMessage, getCurrency, formatDateTime, useDebounce } from '@/helpers/utils.ts';
import { getListTransaction, patchTransactionStatus, patchTransactionPay, postCancelTransaction } from '@/modules/transaction/services/api.ts';
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
import { READ, PRINT, CREATE, CANCEL, UPDATE_STATUS } from '@/modules/transaction/services/rbac.ts';
import { getOrderStatusLabel } from '@/modules/transaction/services/status-labels.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/transaction/services/constants.ts';

const router = useRouter();
const outlet = getOutlet();

// RBAC
const isCanPrint = computed(() => isHasPermission(PRINT));
const iscanDetail = computed(() => isHasPermission(READ));
const isCanCancel = computed(() => isHasPermission(CANCEL));
const isCanUpdateStatus = computed(() => isHasPermission(UPDATE_STATUS));
const isCanPay = computed(() => isHasPermission(CREATE));

const listOfCancelFilters = [
  { label: 'Semua Status', value: null },
  { label: 'Aktif', value: false },
  { label: 'Dibatalkan', value: true },
];
const orderStatusFilters = [
  { label: 'Semua Pesanan', value: null },
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
  rows: 12,
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
      search: form.value.search ? form.value.search.trim() : undefined,
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
        title: 'Gagal',
        message: getErrorMessage(error) || 'Terjadi kesalahan saat memuat transaksi.',
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
  sampai: { order_status: 'selesai' },
};

const advanceStatusLabelMap: Record<string, string> = {
  menunggu_konfirmasi: 'Terima',
  diterima: 'Proses',
  diproses: 'Sampai',
  sampai: 'Selesaikan',
  selesai: 'Selesai',
};

// Payment Modal (independent of order status)
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
    ...paymentPayload.value,
    total_amount: Number(transaction.total_amount),
    payment_method: 'cash',
  };
  showPaymentModal.value = true;
};

const confirmPayment = async () => {
  try {
    showLoading();
    const payload: any = {
      payment_method: paymentPayload.value.payment_method,
      is_offline: paymentPayload.value.is_offline,
    };
    if (payload.payment_method === 'cash') {
      payload.cash_received = Number(paymentPayload.value.cash_received);
      payload.change_amount = Math.max(0, payload.cash_received - paymentPayload.value.total_amount);
    }
    await patchTransactionPay(paymentTarget.value.id, payload);
    showPaymentModal.value = false;
    showToast({
      type: 'success',
      title: 'Sukses',
      message: 'Pembayaran berhasil diproses.',
    });
    fetchTransaction();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal memproses pembayaran.',
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
        title: 'Sukses',
        message: 'Transaksi berhasil dibatalkan dan stok telah dikembalikan.'
      });
      fetchTransaction();
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    hideLoading();
  }
};

const onCancelTransaction = (transaction: any) => {
  showConfirm({
    header: 'Batalkan Transaksi',
    message: 'Apakah Anda yakin ingin membatalkan transaksi ini? Stok produk akan dikembalikan.',
    rejectLabel: 'Tidak',
    acceptLabel: 'Ya, Batalkan',
    type: 'warn',
    accept: () => {
      cancelTransaction(transaction?.id);
    },
  });
};

const advanceStatus = async (transaction: any) => {
  try {
    const payload = { ...nextStatusMap[transaction.order_status] };
    await patchTransactionStatus(transaction.id, payload);
    fetchTransaction();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memperbarui status.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
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

const search = useDebounce(() => {
  pagination.value.page = 1;
  fetchTransaction();
}, 300);

onMounted(() => {
  fetchTransaction();
});
</script>

<style scoped>
</style>
