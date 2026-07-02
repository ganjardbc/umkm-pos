<template>
  <div class="w-full space-y-4">
    <div class="flex gap-4 items-center">
      <Button
        severity="secondary"
        icon="pi pi-arrow-left"
        size="small"
        @click="onBack"
      />
      <h1 class="text-lg font-semibold">
        Outlet Detail
      </h1>
    </div>

    <UiCard v-if="outletDetail">
      <template #header>
        <div class="w-full flex gap-4 items-center justify-between">
          <h1 class="text-lg font-semibold">
            Outlet Information
          </h1>
          <div class="flex gap-2">
            <Button
              icon="pi pi-qrcode"
              label="Customer QR"
              size="small"
              severity="secondary"
              variant="outlined"
              @click="showQrModal = true"
            />
            <Button
              icon="pi pi-pencil"
              label="Edit Outlet"
              size="small"
              :disabled="!isCanUpdate"
              @click="onEdit"
            />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div v-if="outletDetail.logo" class="flex justify-center md:justify-start">
          <img
:src="outletDetail.logo" alt="Outlet Logo"
               class="w-32 h-32 rounded-lg object-cover border border-gray-200" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Name</label>
            <p class="text-base mt-1">{{ outletDetail.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Slug</label>
            <p class="text-base mt-1">{{ outletDetail.slug }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Location</label>
            <p class="text-base mt-1">{{ outletDetail.location }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Guest Secret Code</label>
            <p class="text-base mt-1 font-mono">{{ outletDetail.guest_session_secret || '-' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Merchant</label>
            <p class="text-base mt-1">{{ outletDetail.merchants?.name || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <div class="mt-1">
              <Tag
                :value="outletDetail.is_active ? 'Active' : 'Inactive'"
                :severity="outletDetail.is_active ? 'success' : 'danger'"
                class="capitalize"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Created At</label>
            <p class="text-base mt-1">{{ formatDateTime(outletDetail.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Updated At</label>
            <p class="text-base mt-1">{{ formatDateTime(outletDetail.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>

    <UiCard v-if="outletDetail">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-lg font-semibold">Store Tables</h1>
          <Button
            icon="pi pi-plus"
            label="Add Table"
            size="small"
            :disabled="!isCanUpdate"
            @click="openCreateTable"
          />
        </div>
      </template>

      <div class="space-y-3">
        <div v-for="table in tables" :key="table.id" class="rounded-xl border border-gray-200 dark:border-dark! dark:bg-dark! p-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="font-semibold">{{ table.name }} <span class="text-xs text-slate-500">({{ table.code }})</span></p>
              <p class="text-sm text-slate-500">Kapasitas: {{ table.capacity || '-' }}</p>
            </div>
            <div class="flex gap-2">
              <Tag :value="table.is_active ? 'Active' : 'Inactive'" :severity="table.is_active ? 'success' : 'danger'" />
              <Button icon="pi pi-pencil" size="small" text @click="openEditTable(table)" />
              <Button icon="pi pi-trash" size="small" text severity="danger" @click="removeTable(table.id)" />
            </div>
          </div>
        </div>
        <p v-if="tables.length === 0" class="text-sm text-slate-500">Belum ada meja untuk outlet ini.</p>
      </div>
    </UiCard>
  </div>

  <CustomerQrModal
    v-model:visible="showQrModal"
    :outlet="outletDetail"
  />

  <TableFormModal
    v-model:visible="showTableDialog"
    :outlet-id="outletID"
    :table="editingTable"
    @saved="fetchTables"
  />
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { deleteOutletTable, getDetailOutlet, getOutletTables } from '@/modules/outlet/services/api.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/outlet/services/constants.ts';
import { UPDATE } from '@/modules/outlet/services/rbac.ts';
import CustomerQrModal from '@/modules/outlet/components/CustomerQrModal.vue';
import TableFormModal from '@/modules/outlet/components/TableFormModal.vue';
import UiCard from '@/components/UiCard.vue';

const route = useRoute();
const router = useRouter();
const outletID = computed(() => route.params.id as string);
const showQrModal = ref(false);

// RBAC
const isCanUpdate = computed(() => isHasPermission(UPDATE));

// Fetch Detail
const outletDetail = ref<any>(null);
const tables = ref<any[]>([]);
const showTableDialog = ref(false);
const editingTable = ref<any>(null);

const fetchDetail = async () => {
  try {
    const response = await getDetailOutlet(outletID.value);
    const { data } = response?.data || {};

    outletDetail.value = data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch data.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const fetchTables = async () => {
  try {
    const response = await getOutletTables(outletID.value);
    tables.value = response?.data?.data || [];
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch tables.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

// Methods
const onBack = () => {
  router.back();
};

const onEdit = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: outletID.value,
    }
  });
};

const openCreateTable = () => {
  editingTable.value = null;
  showTableDialog.value = true;
};

const openEditTable = (table: any) => {
  editingTable.value = table;
  showTableDialog.value = true;
};

const removeTable = async (id: string) => {
  try {
    await deleteOutletTable(outletID.value, id);
    fetchTables();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to delete table.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

onMounted(() => {
  fetchDetail();
  fetchTables();
});
</script>
