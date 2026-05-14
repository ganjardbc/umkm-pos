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
        Role Detail
      </h1>
    </div>

    <UiCard v-if="roleDetail">
      <template #header>  
        <div class="w-full flex gap-4 items-center justify-between">
          <h1 class="text-lg font-semibold">
            Role Information
          </h1>
          <Button
            icon="pi pi-pencil"
            label="Edit Role"
            size="small"
            :disabled="!isCanUpdate"
            @click="onEdit"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Name</label>
            <p class="text-base mt-1">{{ roleDetail.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Total Permissions</label>
            <p class="text-base mt-1">{{ roleDetail.role_permissions?.length || 0 }}</p>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-500">Description</label>
          <p class="text-base mt-1">{{ roleDetail.description }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Created At</label>
            <p class="text-base mt-1">{{ formatDateTime(roleDetail.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Updated At</label>
            <p class="text-base mt-1">{{ formatDateTime(roleDetail.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>

    <UiCard v-if="roleDetail" class="gap-0! p-0! overflow-hidden!">
      <template #header>
        <h2 class="text-lg font-semibold pt-4 px-4">
          Permissions
        </h2>
      </template>

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
        <Column field="action" header="#" class="w-20">
          <template #body="slotProps">
            <Button
              :severity="isPermissionChecked(slotProps.data.id) ? 'default' : 'secondary'"
              :variant="isPermissionChecked(slotProps.data.id) ? 'soft' : 'outlined'"
              icon="pi pi-check"
              size="small"
              :disabled="!isCanUpdate"
              @click="onCheckPermission(slotProps.data)"
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
import type { RoleDetail } from '@/modules/role/services/types.ts';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getNoTable, getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { getDetailRole, assignPermission, deletePermission } from '@/modules/role/services/api.ts';
import { getListPermission } from '@/modules/permission/services/api.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/role/services/constants.ts';
import { UPDATE } from '@/modules/role/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';
import UiPagination from '@/components/UiPagination.vue';

const route = useRoute();
const router = useRouter();
const roleID = computed(() => route.params.id as string);

// RBAC
const isCanUpdate = computed(() => isHasPermission(UPDATE));

// Fetch Detail
const roleDetail = ref<RoleDetail | null>(null);
const rolePermissions = ref([]);

const fetchDetail = async () => {
  try {
    const response = await getDetailRole(roleID.value);
    const { data } = response?.data || {};
    const permissions =  data?.role_permissions?.map((item: any) => {
      return {
        id: item?.permissions?.id,
        code: item?.permissions?.code,
        description: item?.permissions?.description,
      }
    }) || [];

    roleDetail.value = data || null;
    rolePermissions.value = permissions;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch data.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

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

// Check/Uncheck Permissions
const isPermissionChecked = (id: string) => {
  return rolePermissions.value.some((item: any) => item.id === id);
};

const handleAssignPermission = async (permissionID: string) => {
  try {
    const payload = {
      permission_id: permissionID,
    };
    const response = await assignPermission(roleID.value, payload);
    showToast({
      type: 'success',
      title: 'Success.',
      message: response?.data?.message || 'Permission assigned successfully.',
    });
    fetchDetail();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to assign permission.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const handleDeletePermission = async (permissionID: string) => {
  try {
    const response = await deletePermission(roleID.value, permissionID);
    showToast({
      type: 'success',
      title: 'Success.',
      message: response?.data?.message || 'Permission deleted successfully.',
    });
    fetchDetail();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to delete permission.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const onCheckPermission = (permission: any) => {
  const isChecked = rolePermissions.value.some((item: any) => item.id === permission.id);

  if (isChecked) {
    handleDeletePermission(permission.id);
  } else {
    handleAssignPermission(permission.id);
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
      id: roleID.value,
    }
  });
};

onMounted(() => {
  fetchDetail();
  fetchPermission();
});
</script>
