<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row gap-4">
      <UiSearch
        v-model="form.search"
        type="search"
        placeholder="Cari nama atau nomor..."
        class="w-full"
        @input="search"
      />
      <Button
        icon="pi pi-plus"
        label="Tambah Pelanggan"
        class="w-full md:w-[248px]"
        :disabled="!isCanCreate"
        @click="openForm(null)"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Memuat pelanggan..."
    />

    <div
      v-else-if="customers.length === 0"
      class="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <i class="pi pi-users mb-3 text-4xl" />
      <p class="text-sm">Belum ada pelanggan.</p>
    </div>

    <div
      v-else
      class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3"
    >
      <UiCard
        v-for="customer in customers"
        :key="customer.id"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-sm font-semibold">
              {{ customer.name }}
            </h2>
            <p class="text-xs text-gray-400">
              {{ customer.phone || 'Tanpa nomor' }}
            </p>
            <p
              v-if="customer.note"
              class="mt-1 text-xs text-gray-500 line-clamp-2"
            >
              {{ customer.note }}
            </p>
          </div>
          <div class="flex gap-1 shrink-0">
            <Button
              icon="pi pi-history"
              severity="secondary"
              text
              rounded
              size="small"
              aria-label="Riwayat"
              @click="openDetail(customer.id)"
            />
            <Button
              v-if="isCanUpdate"
              icon="pi pi-pencil"
              severity="secondary"
              text
              rounded
              size="small"
              aria-label="Ubah"
              @click="openForm(customer)"
            />
            <Button
              v-if="isCanDelete"
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              size="small"
              aria-label="Hapus"
              @click="onDelete(customer)"
            />
          </div>
        </div>
      </UiCard>
    </div>

    <UiPagination
      v-model="pagination"
      @page="onPageChange"
    />

    <CustomerFormDialog
      v-model:visibility="showForm"
      :customer="editing"
      @saved="fetchCustomers"
    />
    <CustomerDetailDialog
      v-model:visibility="showDetail"
      :customer-id="detailId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast, showConfirm } from '@umkm-pos/ui/helpers/toast';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiSearch from '@umkm-pos/ui/components/UiSearch.vue';
import UiPagination from '@umkm-pos/ui/components/UiPagination.vue';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';
import { isHasPermission } from '@/helpers/auth.ts';
import { CREATE, UPDATE, DELETE } from '@/modules/customers/services/rbac.ts';
import { deleteCustomer, getListCustomers } from '@/modules/customers/services/api.ts';
import CustomerFormDialog from '@/modules/customers/components/CustomerFormDialog.vue';
import CustomerDetailDialog from '@/modules/customers/components/CustomerDetailDialog.vue';

const isCanCreate = computed(() => isHasPermission(CREATE));
const isCanUpdate = computed(() => isHasPermission(UPDATE));
const isCanDelete = computed(() => isHasPermission(DELETE));

const loading = ref(false);
const customers = ref<any[]>([]);
const pagination = ref({ page: 1, pageCount: 0, rows: 12, totalRecords: 0 });
const form = ref({ search: '' });

const fetchCustomers = async () => {
  try {
    loading.value = true;
    const response = await getListCustomers({
      page: pagination.value.page,
      limit: pagination.value.rows,
      ...(form.value.search && { search: form.value.search }),
    });
    const { data, meta } = response?.data?.data || {};
    customers.value = data || [];
    pagination.value.totalRecords = meta?.total || 0;
    pagination.value.pageCount = meta?.totalPages || 0;
  } catch (error) {
    showToast({ type: 'error', title: 'Gagal', message: getErrorMessage(error) || 'Gagal memuat pelanggan.' });
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event: any) => {
  pagination.value.page = event.page + 1;
  fetchCustomers();
};

let searchTimer: ReturnType<typeof setTimeout>;
const search = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.value.page = 1;
    fetchCustomers();
  }, 300);
};

const showForm = ref(false);
const editing = ref<any>(null);
const openForm = (customer: any) => {
  editing.value = customer;
  showForm.value = true;
};

const showDetail = ref(false);
const detailId = ref<string | null>(null);
const openDetail = (id: string) => {
  detailId.value = id;
  showDetail.value = true;
};

const onDelete = (customer: any) => {
  showConfirm({
    header: 'Hapus Pelanggan',
    message: `Hapus ${customer.name}? Transaksi lama tetap tersimpan.`,
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    type: 'warn',
    accept: async () => {
      try {
        await deleteCustomer(customer.id);
        showToast({ type: 'success', title: 'Berhasil', message: 'Pelanggan dihapus.' });
        fetchCustomers();
      } catch (error) {
        showToast({ type: 'error', title: 'Gagal', message: getErrorMessage(error) || 'Gagal menghapus.' });
      }
    },
  });
};

onMounted(fetchCustomers);
</script>
