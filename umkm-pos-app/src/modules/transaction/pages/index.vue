<template>
  <div class="w-full space-y-4">
    <div class="flex-1">
      <UiSearch
        v-model="form.search"
        type="search"
        class="w-full"
        @input="search"
      />
    </div>

    <div class="flex gap-2 items-center">
      <div class="text-sm text-gray-400">
        Status:
      </div>
      <Tag
        v-for="(cancel, index) in listOfCancellFilters"
        :key="index"
        :value="cancel.label "
        :severity="filter.is_cancelled === cancel.value ? 'success' : 'secondary'"
        class="cursor-pointer! rounded-full! px-3! py-1!"
        @click="handleCancelFilters(cancel)"
      />
    </div>

    <UiCard class="p-0! gap-0! overflow-hidden!">
      <DataTable
        :value="transactions"
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
            {{ slotProps.data.users?.name }}
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
            <Tag
              :value="slotProps.data.is_cancelled ? 'Cancelled' : 'Active'"
              :severity="slotProps.data.is_cancelled ? 'danger' : 'info'"
              class="capitalize"
            />
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
import { getListTransaction, postCancelTransaction } from '@/modules/transaction/services/api.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { getOutlet } from '@/helpers/auth.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';
import ReceiptModal from '@/modules/transaction/components/ReceiptModal.vue';
import { READ, PRINT, CANCEL } from '@/modules/transaction/services/rbac.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/transaction/services/constants.ts';

const router = useRouter();
const outlet = getOutlet();

// RBAC
const isCanPrint = computed(() => isHasPermission(PRINT));
const iscanDetail = computed(() => isHasPermission(READ));
const isCanCancel = computed(() => isHasPermission(CANCEL));

const listOfCancellFilters = [
  { label: 'All Status', value: null },
  { label: 'Active', value: false },
  { label: 'Cancelled', value: true },
];

// Fetch Data
const transactions = ref([]);
const filter = ref({
  outlet_id: outlet?.id,
  is_cancelled: null,
});
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchTransaction = async () => {
  try {
    const payload = {
      outlet_id: outlet?.id,
      page: pagination.value.page,
      limit: pagination.value.rows,
      is_cancelled: filter.value.is_cancelled,
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

// Detail Transactions
const openDetail = (transaction: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: { id: transaction.id }
  });
};

// Filters
const handleCancelFilters =  (cancel: any) => {
  filter.value.is_cancelled = cancel.value;
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
