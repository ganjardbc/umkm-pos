<template>
  <div class="transaction-detail">
    <div class="flex items-center gap-4">
      <Button
        severity="secondary"
        icon="pi pi-arrow-left"
        size="small"
        @click="onBack"
      />
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-lg font-semibold">
          Detail Transaksi
        </h1>

        <Tag
          v-if="transactionDetail"
          :value="transactionDetail.is_cancelled ? 'Dibatalkan' : 'Aktif'"
          :severity="transactionDetail.is_cancelled ? 'danger' : 'success'"
        />
      </div>
    </div>

    <UiLoading v-if="loading" message="Memuat detail transaksi..." />

    <UiCard v-else-if="!transactionDetail" class="transaction-detail__empty">
      <i class="pi pi-receipt text-4xl text-gray-300 dark:text-gray-600" />
      <div>
        <p class="font-semibold text-gray-700 dark:text-gray-200">Transaksi tidak tersedia</p>
        <p class="mt-1 text-sm text-gray-500">Kembali ke daftar transaksi dan pilih transaksi lainnya.</p>
      </div>
      <Button label="Kembali ke Transaksi" severity="secondary" size="small" @click="onBack" />
    </UiCard>

    <div v-else class="transaction-detail__layout">
      <div class="min-w-0 space-y-4">
        <UiCard>
          <template #header>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-50">Item pesanan</p>
                <p class="mt-0.5 text-sm text-gray-500">
                  {{ getProductTotalQuantity(transactionDetail.transaction_items) }} item dalam transaksi ini
                </p>
              </div>
              <Button
                v-if="isCanAddItems"
                icon="pi pi-plus"
                label="Tambah Item"
                size="small"
                class="w-full sm:w-auto"
                @click="onGoToAddItems"
              />
            </div>
          </template>

          <div
            v-if="!transactionDetail.transaction_items?.length"
            class="flex flex-col items-center justify-center gap-2 py-12 text-center text-gray-400"
          >
            <i class="pi pi-inbox text-3xl" />
            <p class="text-sm">Belum ada item dalam transaksi ini.</p>
          </div>

          <div v-else class="transaction-items">
            <UiCard
              v-for="(item, index) in transactionDetail.transaction_items"
              :key="item.id || index"
              class="transaction-item-card dark:bg-dark!"
            >
              <div class="flex min-w-0 items-start gap-3">
                <span class="transaction-item-card__number">{{ Number(index) + 1 }}</span>
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-gray-900 dark:text-gray-50 mt-1">
                    {{ item.product_name_snapshot }}
                  </p>
                  <p v-if="item.customer_note" class="mt-1 flex items-center">
                    <i class="pi pi-comment mr-1 text-gray-500" />
                    <span class="text-sm text-gray-500">
                      {{ item.customer_note }}
                    </span>
                  </p>
                </div>
              </div>

              <div class="transaction-item-card__metrics">
                <div class="transaction-item-card__metric">
                  <span class="transaction-item-card__label">Jumlah</span>
                  <span class="font-semibold text-gray-900 dark:text-gray-50">{{ item.qty }}×</span>
                </div>
                <div class="transaction-item-card__metric">
                  <span class="transaction-item-card__label">Harga</span>
                  <span class="font-medium text-gray-900 dark:text-gray-50">{{ getCurrency(item.price_snapshot) }}</span>
                </div>
                <div class="transaction-item-card__metric transaction-item-card__metric--total">
                  <span class="transaction-item-card__label">Subtotal</span>
                  <span class="font-semibold text-primary dark:text-primary-400">{{ getCurrency(item.subtotal) }}</span>
                </div>
              </div>
            </UiCard>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <div>
              <p class="text-lg font-semibold text-gray-900 dark:text-gray-50">Informasi transaksi</p>
              <p class="mt-0.5 text-sm text-gray-500">Referensi, pelanggan, dan waktu transaksi.</p>
            </div>
          </template>

          <dl class="transaction-metadata">
            <div class="transaction-metadata__item transaction-metadata__item--wide">
              <dt>ID transaksi</dt>
              <dd class="break-all font-mono text-sm">{{ transactionDetail.id }}</dd>
            </div>
            <div class="transaction-metadata__item">
              <dt>Pelanggan</dt>
              <dd>{{ transactionDetail.customer_name_snapshot || transactionDetail.users?.name || '-' }}</dd>
            </div>
            <div class="transaction-metadata__item">
              <dt>No. telepon</dt>
              <dd>{{ transactionDetail.customer_phone_snapshot || '-' }}</dd>
            </div>
            <div class="transaction-metadata__item">
              <dt>Meja</dt>
              <dd>{{ transactionDetail.store_tables?.name || '-' }}</dd>
            </div>
            <div class="transaction-metadata__item">
              <dt>ID perangkat</dt>
              <dd class="break-all font-mono text-sm">{{ transactionDetail.device_id || '-' }}</dd>
            </div>
            <div class="transaction-metadata__item">
              <dt>Dibuat</dt>
              <dd>{{ formatDateTime(transactionDetail.created_at) }}</dd>
            </div>
            <div class="transaction-metadata__item">
              <dt>Terakhir diperbarui</dt>
              <dd>{{ formatDateTime(transactionDetail.updated_at) }}</dd>
            </div>
          </dl>
        </UiCard>
      </div>

      <aside class="transaction-detail__aside">
        <UiCard class="transaction-summary">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Total pembayaran</p>
              <p class="mt-2 text-3xl font-bold tracking-tight text-primary dark:text-primary-400">
                {{ formatPrice(transactionDetail.total_amount) }}
              </p>
            </div>
            <Tag
              :value="transactionDetail.payment_method === 'pending' ? 'Belum dibayar' : 'Dibayar'"
              :severity="transactionDetail.payment_method === 'pending' ? 'warning' : 'success'"
            />
          </div>

          <div class="transaction-summary__tear" />

          <dl class="space-y-3 text-sm">
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">Metode pembayaran</dt>
              <dd class="font-medium capitalize text-gray-900 dark:text-gray-50">{{ transactionDetail.payment_method }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">Sumber pesanan</dt>
              <dd>
                <Tag
                  :value="transactionDetail.order_source === 'customer_catalog' ? 'Customer Catalog' : 'POS'"
                  :severity="transactionDetail.order_source === 'customer_catalog' ? 'warning' : 'info'"
                />
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">Status pesanan</dt>
              <dd class="font-medium text-gray-900 dark:text-gray-50">{{ getOrderStatusLabel(transactionDetail.order_status) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">Mode</dt>
              <dd>
                <Tag
                  :value="transactionDetail.is_offline ? 'Offline' : 'Online'"
                  :severity="transactionDetail.is_offline ? 'warning' : 'info'"
                />
              </dd>
            </div>
            <div v-if="transactionDetail.cash_received !== null && transactionDetail.cash_received !== undefined" class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">Tunai diterima</dt>
              <dd class="font-medium">{{ formatPrice(transactionDetail.cash_received) }}</dd>
            </div>
            <div v-if="transactionDetail.change_amount !== null && transactionDetail.change_amount !== undefined" class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">Kembalian</dt>
              <dd class="font-medium">{{ formatPrice(transactionDetail.change_amount) }}</dd>
            </div>
          </dl>

          <div class="transaction-summary__actions">
            <Button
              :label="advanceStatusLabel"
              :severity="transactionDetail.order_status !== 'selesai' ? 'success' : 'secondary'"
              variant="outlined"
              icon="pi pi-ellipsis-h"
              size="small"
              fluid
              :disabled="!isCanUpdateStatus || transactionDetail.is_cancelled || transactionDetail.order_status === 'selesai'"
              @click="advanceStatus"
            />
            <Button
              v-if="transactionDetail.payment_method === 'pending'"
              severity="warning"
              icon="pi pi-wallet"
              label="Bayar"
              size="small"
              fluid
              :disabled="!isCanPay || transactionDetail.is_cancelled"
              @click="showPaymentModal = true"
            />
            <Button
              v-else
              severity="secondary"
              variant="outlined"
              icon="pi pi-print"
              label="Cetak Struk"
              size="small"
              fluid
              :disabled="!isCanPrint || transactionDetail.is_cancelled"
              @click="openPrintReceipt(transactionDetail)"
            />

            <Divider class="my-0!" />

            <Button
              severity="danger"
              variant="outlined"
              icon="pi pi-times"
              label="Batalkan Transaksi"
              size="small"
              fluid
              :disabled="!isCanCancel || transactionDetail.is_cancelled"
              @click="onCancelTransaction(transactionDetail)"
            />
          </div>
        </UiCard>
      </aside>
    </div>
  </div>

  <ReceiptModal
    v-if="isCanPrint"
    v-model:visibility="showReceiptModal"
    :selected="selectedTransaction"
    @cancel="cancelReceiptModal"
  />

  <PaymentModal
    v-if="isCanPay"
    v-model:visibility="showPaymentModal"
    v-model:payment-method="paymentForm.payment_method"
    v-model:is-offline="paymentForm.is_offline"
    v-model:cash-amount="paymentForm.cash_amount"
    :total-amount="Number(transactionDetail?.total_amount || 0)"
    @confirm="onPayTransaction"
  />
</template>
<script lang="ts" setup>
import { type ReceiptData } from '../utils/receiptGenerator';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage, getCurrency, formatDateTime, formatPrice } from '@/helpers/utils.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import {
  getDetailTransaction,
  postCancelTransaction,
  patchTransactionStatus,
  patchTransactionPay,
} from '@/modules/transaction/services/api.ts';
import { PRINT, CANCEL, CREATE, UPDATE_STATUS } from '@/modules/transaction/services/rbac.ts';
import { getOrderStatusLabel } from '@/modules/transaction/services/status-labels.ts';
import ReceiptModal from '@/modules/transaction/components/ReceiptModal.vue';
import PaymentModal from '@/modules/transaction/components/PaymentModal.vue';

import UiCard from '@/components/UiCard.vue';
import UiLoading from '@/components/UiLoading.vue';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const transactionID = computed(() => route.params.id as string);

// RBAC
const isCanPrint = computed(() => isHasPermission(PRINT));
const isCanCancel = computed(() => isHasPermission(CANCEL));
const isCanUpdateStatus = computed(() => isHasPermission(UPDATE_STATUS));
const isCanAddItems = computed(() => transactionDetail.value?.payment_method === 'pending');
const isCanPay = computed(() => isHasPermission(CREATE));

const nextStatusMap: Record<string, string> = {
  menunggu_konfirmasi: 'diterima',
  diterima: 'diproses',
  diproses: 'sampai',
  sampai: 'selesai',
};

const advanceStatusLabelMap: Record<string, string> = {
  menunggu_konfirmasi: 'Terima',
  diterima: 'Proses',
  diproses: 'Sampai',
  sampai: 'Selesaikan',
  selesai: 'Selesai',
};

const advanceStatusLabel = computed(() => {
  return advanceStatusLabelMap[transactionDetail.value?.order_status] || 'Update Status';
});

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

// Fetch Detail
const transactionDetail = ref<any>(null);
const loading = ref(false);

const fetchDetail = async () => {
  try {
    loading.value = true;
    const response = await getDetailTransaction(transactionID.value);
    const { data } = response?.data || {};

    transactionDetail.value = data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat data.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    loading.value = false;
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
      fetchDetail();
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

// Advance order status (pure workflow, no payment involved)
const advanceStatus = async () => {
  const transaction = transactionDetail.value;
  if (!transaction || transaction.is_cancelled) return;

  const nextStatus = nextStatusMap[transaction.order_status];
  if (!nextStatus) return;

  try {
    showLoading();
    await patchTransactionStatus(transaction.id, { order_status: nextStatus });
    showToast({
      type: 'success',
      title: 'Status Diperbarui',
      message: `Pesanan sekarang berstatus ${getOrderStatusLabel(nextStatus)}.`,
    });
    await fetchDetail();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memperbarui status.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    hideLoading();
  }
};

// Pay (independent of order status)
const showPaymentModal = ref(false);
const paymentForm = ref({
  payment_method: 'cash',
  is_offline: true,
  cash_amount: 0,
});

const onPayTransaction = async () => {
  try {
    showLoading();

    const payload: any = {
      payment_method: paymentForm.value.payment_method,
      cash_received: paymentForm.value.payment_method === 'cash' ? paymentForm.value.cash_amount : undefined,
      change_amount: paymentForm.value.payment_method === 'cash'
        ? Math.max(0, paymentForm.value.cash_amount - Number(transactionDetail.value?.total_amount || 0))
        : undefined,
    };

    const response = await patchTransactionPay(transactionID.value, payload);
    if (response.data) {
      showToast({
        type: 'success',
        title: 'Pembayaran Berhasil',
        message: 'Transaksi telah dibayar dan stok telah dikurangi.',
      });
      showPaymentModal.value = false;
      paymentForm.value.cash_amount = 0;
      await fetchDetail();
    }
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

// Add items to held order
const onGoToAddItems = () => {
  router.push({ path: '/cashier', query: { add_to: transactionID.value } });
};

// Helpers
const getProductTotalQuantity = (items: any[] ) => {
  return items?.reduce((total, item) => total + (item.qty || 0), 0) || 0;
};

// Navigation
const onBack = () => {
  router.back();
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
@import "tailwindcss";
@import "@/assets/styles/themes.css";

.transaction-detail {
  @apply w-full space-y-4;
}

.transaction-detail__header {
  @apply flex items-start gap-3;
}

.transaction-detail__layout {
  @apply grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px];
}

.transaction-detail__aside {
  @apply min-w-0;
}

.transaction-detail__empty {
  @apply items-center py-12 text-center;
}

.transaction-summary {
  @apply xl:sticky xl:top-[88px];
}

.transaction-summary__tear {
  @apply my-1 border-t-2 border-dashed border-gray-200 dark:border-gray-700;
}

.transaction-summary__actions {
  @apply grid gap-3 border-t border-gray-200 pt-4 dark:border-gray-700;
}

.transaction-items {
  @apply grid gap-3;
}

.transaction-item-card {
  @apply gap-3 shadow-none dark:border-gray-700;
}

.transaction-item-card__number {
  @apply flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-xs font-bold text-primary dark:bg-dark-secondary dark:text-primary-300;
}

.transaction-item-card__metrics {
  @apply grid grid-cols-1 gap-2 sm:grid-cols-3;
}

.transaction-item-card__metric {
  @apply flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900 sm:flex-col sm:items-start sm:gap-1;
}

.transaction-item-card__metric--total {
  @apply sm:items-end sm:text-right;
}

.transaction-item-card__label {
  @apply text-xs font-medium text-gray-400;
}

.transaction-metadata {
  @apply grid gap-x-8 gap-y-5 sm:grid-cols-2;
}

.transaction-metadata__item {
  @apply min-w-0;
}

.transaction-metadata__item--wide {
  @apply sm:col-span-2;
}

.transaction-metadata dt {
  @apply text-xs font-medium uppercase tracking-wide text-gray-400;
}

.transaction-metadata dd {
  @apply mt-1 font-medium text-gray-900 dark:text-gray-50;
}
</style>
