<template>
  <div class="w-full space-y-4">
    <h1 class="text-lg font-semibold">
      Permission
    </h1>

    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <UiSearch
          v-model="form.search"
          type="search"
          class="w-full"
          @input="search"
        />
      </div>
      <Button
        icon="pi pi-plus"
        label="Add Permission"
        class="w-full md:w-[192px]"
        :disabled="!isCanCreate"
        @click="addPermission"
      />
    </div>

    <UiCard class="p-0! gap-0! overflow-hidden!">
      <DataTable :value="permissions" tableStyle="min-width: 50rem">
        <template #empty>
          <span class="w-full text-center flex justify-center">
            Permissions are empty.
          </span>
        </template>
        <Column field="no" header="NO" class="w-18">
          <template #body="slotProps">
            {{ getNoTable(slotProps.index, pagination.page, pagination.rows) }}
          </template>
        </Column>
        <Column field="code" header="Code">
          <template #body="slotProps">
            {{ slotProps.data.code }}
          </template>
        </Column>
        <Column field="description" header="Description">
          <template #body="slotProps">
            {{ slotProps.data.description }}
          </template>
        </Column>
        <Column field="created_at" header="Created At">
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column field="action" header="#" class="w-[92px]">
          <template #body="slotProps">
            <Button
              severity="secondary" 
              variant="outlined"
              icon="pi pi-trash"
              size="small"
              :disabled="!isCanDelete"
              @click="onDeletePermission(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
      <UiPagination
        v-model="pagination"
        @page="onPageChange"
      />
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getNoTable, getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { getListPermission, deletePermission } from '@/modules/permission/services/api.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/permission/services/constants.ts';
import { CREATE, UPDATE, DELETE } from '@/modules/permission/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';

const router = useRouter();

// RBAC
const isCanCreate = computed(() => isHasPermission(CREATE));
const isCanUpdate = computed(() => isHasPermission(UPDATE));
const isCanDelete = computed(() => isHasPermission(DELETE));

// Fetch Data
const permissions = ref([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchPermission = async () => {
  try {
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
    }
    const response = await getListPermission(payload);
    const { data, meta } = response?.data?.data || {};

    permissions.value = data;
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
  fetchPermission();
};

// Actions
const addPermission = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-create`,
  });
};

// Delete Process
const removePermission = async (id: string) => {
  try {
    showLoading();

    const response = await deletePermission(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Permission has been deleted.'
      });
      fetchPermission();
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

const onDeletePermission = (permission: any) => {
  showConfirm({
    header: 'Delete Permission',
    message: 'Are you sure you want to delete this permission?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    type: 'warn',
    accept: () => {
      removePermission(permission?.id);
    },
  });
};

// Search
const form = ref({
  search: '',
});

const search = () => {
  console.log(form.value);
};

onMounted(() => {
  fetchPermission();
});
</script>

<style scoped>
</style>
