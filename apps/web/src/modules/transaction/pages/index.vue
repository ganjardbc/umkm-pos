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
        <div class="min-w-0 xl:w-38">
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

        <div class="min-w-0 xl:w-38">
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

    <UiCard class="p-0! gap-0! overflow-hidden!">
      <DataTable
        :value="transactions"
        :loading="loading"
        dataKey="id"
        tableStyle="min-width: 50rem;"
      >
        <template #empty>
          <span class="w-full text-center flex justify-center">
            Transactions are empty.
          </span>
        </template>
        <Column field="no" header="NO" class="w-18">
          <template #body="slotProps">
            {{ getNoTable(slotProps.index, pagination.page, pagination.rows) }}
          </template>
        </Column>
        <Column field="users" header="Users" class="min-w-48">
          <template #body="slotProps">
            {{ slotProps.data.customer_name_snapshot || slotProps.data.users?.name || '-' }}
          </template>
        </Column>
        <Column field="order_source" header="Source" class="min-w-32">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.order_source === 'customer_catalog' ? 'Customer Catalog' : 'POS'"
              :severity="slotProps.data.order_source === 'customer_catalog' ? 'warning' : 'info'"
            />
          </template>
        </Column>
        <Column field="payment_method" header="Payment" class="min-w-28">
          <template #body="slotProps">
            <span class="capitalize">
              {{ slotProps.data.payment_method }}
            </span>
          </template>
        </Column>
        <Column field="total_amount" header="Total" class="min-w-38">
          <template #body="slotProps">
            {{ getCurrency(slotProps.data.total_amount) }}
          </template>
        </Column>
        <Column field="transaction_items" header="Items">
          <template #body="slotProps">
            <span class="capitalize">
              {{ slotProps.data.transaction_items?.length || 0 }}x
            </span>
          </template>
        </Column>
        <Column field="created_at" header="Created At" class="min-w-48">
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column field="is_offline" header="Mode">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.is_offline ? 'Offline' : 'Online'"
              :severity="slotProps.data.is_offline ? 'danger' : 'success'"
              class="capitalize"
            />
          </template>
        </Column>
        <Column field="is_cancelled" header="Status">
          <template #body="slotProps">
            <div class="flex flex-col gap-1">
              <Tag
                :value="slotProps.data.is_cancelled ? 'Cancelled' : 'Active'"
                :severity="slotProps.data.is_cancelled ? 'danger' : 'info'"
                class="capitalize"
              />
              <Tag
                v-if="slotProps.data.order_source === 'customer_catalog'"
                :value="slotProps.data.order_status"
                severity="warning"
                class="capitalize"
              />
            </div>
          </template>
        </Column>
        <Column field="action" header="#">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-eye"
                size="small"
                :disabled="!iscanDetail"
                @click="openDetail(slotProps.data)"
              />
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-print"
                size="small"
                :disabled="!isCanPrint || slotProps.data.is_cancelled"
                @click="openPrintReceipt(slotProps.data)"
              />
              <Button
                v-if="slotProps.data.order_source === 'customer_catalog' && slotProps.data.order_status !== 'selesai'"
                severity="warning"
                variant="outlined"
                icon="pi pi-arrow-right"
                size="small"
                :disabled="!isCanUpdateStatus"
                @click="advanceStatus(slotProps.data)"
              />
              <Button
                severity="danger" 
                variant="outlined"
                icon="pi pi-times"
                size="small"
                :disabled="!isCanCancel || slotProps.data.is_cancelled"
                @click="onCancelTransaction(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <UiPagination
        v-model="pagination"
        @page="onPageChange"
      />
    </UiCard>
  </div>

  <ReceiptModal
    v-if="isCanPrint"
    v-model:visibility="showReceiptModal"
    :selected="selectedTransaction"
    @cancel="cancelReceiptModal"
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
import ReceiptModal from '@/modules/transaction/components/ReceiptModal.vue';
import { READ, PRINT, CANCEL, UPDATE_STATUS } from '@/modules/transaction/services/rbac.ts';
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
const transactions = ref([]);
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
  sampai: {
    order_status: 'selesai',
    payment_method: 'cash',
  },
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
  try {
    const payload = { ...nextStatusMap[transaction.order_status] };
    if (payload.order_status === 'selesai') {
      payload.cash_received = Number(transaction.total_amount);
      payload.change_amount = 0;
    }
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
