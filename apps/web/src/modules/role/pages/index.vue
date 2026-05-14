<template>
  <div class="w-full space-y-4">
    <h1 class="text-lg font-semibold">
      Role
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
        label="Add Role"
        class="w-full md:w-[192px]"
        :disabled="!isCanCreate"
        @click="addRole"
      />
    </div>

    <UiCard class="p-0! gap-0! overflow-hidden!">
      <DataTable :value="roles" tableStyle="min-width: 50rem">
        <template #empty>
          <span class="w-full text-center flex justify-center">
            Roles are empty.
          </span>
        </template>
        <Column field="no" header="NO" class="w-18">
          <template #body="slotProps">
            {{ getNoTable(slotProps.index, pagination.page, pagination.rows) }}
          </template>
        </Column>
        <Column field="name" header="Name">
          <template #body="slotProps">
            {{ slotProps.data.name }}
          </template>
        </Column>
        <Column field="description" header="Description">
          <template #body="slotProps">
            {{ slotProps.data.description }}
          </template>
        </Column>
        <Column field="role_permissions" header="Total Permissions">
          <template #body="slotProps">
            {{ slotProps.data.role_permissions?.length }}
          </template>
        </Column>
        <Column field="created_at" header="Created At">
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column field="action" header="#" class="w-[148px]">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-eye"
                size="small"
                @click="onDetailRole(slotProps.data)"
              />
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-pencil"
                size="small"
                :disabled="!isCanUpdate"
                @click="onEditRole(slotProps.data)"
              />
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-trash"
                size="small"
                :disabled="!isCanDelete"
                @click="onDeleteRole(slotProps.data)"
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
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter  } from 'vue-router';
import { getNoTable, getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { getListRole, deleteRole } from '@/modules/role/services/api.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/role/services/constants.ts';
import { CREATE, UPDATE, DELETE } from '@/modules/role/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';

const router = useRouter();

// RBAC
const isCanCreate = computed(() => isHasPermission(CREATE));
const isCanUpdate = computed(() => isHasPermission(UPDATE));
const isCanDelete = computed(() => isHasPermission(DELETE));

// Fetch Data
const roles = ref([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchRole = async () => {
  try {
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
    }
    const response = await getListRole(payload);
    const { data, meta } = response?.data?.data || {};

    roles.value = data;
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
  fetchRole();
};

// Actions
const addRole = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-create`,
  });
};

const onDetailRole = (role: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: {
      id: role?.id,
    }
  });
};

const onEditRole = (role: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: role?.id,
    }
  });
};

// Delete Process
const removeRole = async (id: string) => {
  try {
    showLoading();

    const response = await deleteRole(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Role has been deleted.'
      });
      fetchRole();
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

const onDeleteRole = (role: any) => {
  showConfirm({
    header: 'Delete Role',
    message: 'Are you sure you want to delete this role?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    type: 'warn',
    accept: () => {
      removeRole(role?.id);
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
  fetchRole();
});
</script>

<style scoped>
</style>
