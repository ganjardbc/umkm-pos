<template>
  <div class="w-full space-y-4">
    <div class="flex items-center gap-4">
      <Button
        severity="secondary"
        icon="pi pi-arrow-left"
        size="small"
        @click="onBack"
      />
      <h1 class="text-lg font-semibold">
        User Detail
      </h1>
    </div>

    <!-- User Information -->
    <UiCard v-if="userDetail">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold">
            User Information
          </h2>
          <Button
            v-if="isCanUpdate"
            icon="pi pi-pencil"
            label="Edit User"
            size="small"
            @click="onEdit"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Username</label>
            <p class="text-base mt-1">{{ userDetail?.username }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Name</label>
            <p class="text-base mt-1">{{ userDetail?.name }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Email</label>
            <p class="text-base mt-1">{{ userDetail?.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <p class="text-base mt-1">
              <Tag :severity="userDetail?.is_active ? 'success' : 'danger'" :value="userDetail?.is_active ? 'Active' : 'Inactive'" />
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Merchant</label>
            <p class="text-base mt-1">{{ userDetail?.merchants?.name }}</p>
          </div>
          <div>
            <div v-if="userDetail?.avatar" class="flex gap-2 items-center">
              <label class="text-sm font-medium text-gray-500">Avatar</label>
              <div class="mt-2">
                <img :src="userDetail?.avatar" alt="User Avatar" class="w-20 h-20 rounded-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Created At</label>
            <p class="text-base mt-1">{{ formatDateTime(userDetail?.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Updated At</label>
            <p class="text-base mt-1">{{ formatDateTime(userDetail?.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Your Jobs -->
    <UiCard class="p-0! gap-0! overflow-hidden!">
      <template #header>
        <div class="flex justify-between items-center pt-4 px-4">
          <h2 class="text-lg font-semibold">
            Outlet Informations
          </h2>
          <Button
            v-if="isCanUpdate"
            icon="pi pi-plus"
            label="Assign Outlet"
            size="small"
            :disabled="!userDetail?.is_active"
            @click="onAssignOutlet"
          />
        </div>
      </template>

      <DataTable :value="userRoles">
        <template #empty>
          <span class="w-full text-center flex justify-center">
            Your works are empty.
          </span>
        </template>
        <Column field="no" header="NO" class="w-18">
          <template #body="slotProps">
            {{ slotProps.index + 1 }}
          </template>
        </Column>
        <Column field="outlet" header="Outlet">
          <template #body="slotProps">
            {{ slotProps.data.outlets.name }}
          </template>
        </Column>
        <Column field="role" header="Role">
          <template #body="slotProps">
            {{ slotProps.data.roles.name }}
          </template>
        </Column>
        <Column field="permissions" header="Permissions">
          <template #body="slotProps">
            {{ slotProps.data.roles.role_permissions.length || '0' }}
          </template>
        </Column>
        <Column v-if="isCanUpdate" field="action" header="#" class="w-full md:w-[128px]">
          <template #body="slotProps">
            <Button
              severity="secondary"
              variant="outlined"
              label="Revoke"
              icon="pi pi-times"
              size="small"
              fluid
              :disabled="!userDetail?.is_active"
              @click="onCheckRole(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </UiCard>
  </div>
  <AssignOutletModal
    v-model:visibility="showAssignOutletModal"
    @cancel="cancelAssignOutletModal"
    @submit="submitAssignOutletModal"
  />
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { getDetailUser, getUserRole, assignRoleToUser, revokeRoleFromUser } from '@/modules/user/services/api.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/user/services/constants.ts';
import { UPDATE } from '@/modules/user/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';
import AssignOutletModal from '@/modules/user/components/AssignOutletModal.vue';

const route = useRoute();
const router = useRouter();
const userID = computed(() => route.params.id as string);

// RBAC
const isCanUpdate = computed(() => isHasPermission(UPDATE));

// Fetch Detail
const userDetail = ref<any>(null);

const fetchDetail = async () => {
  try {
    const response = await getDetailUser(userID.value);
    const { data } = response?.data || {};

    userDetail.value = data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch data.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

// Fetch User Role
const userRoles = ref<string[]>([]);

const fetchUserRole = async () => {
  try {
    const response = await getUserRole(userID.value);
    const { data } = response?.data || {};

    userRoles.value = data || [];
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch data.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

// Assign Outlet
const showAssignOutletModal = ref(false);

const onAssignOutlet = () => {
  showAssignOutletModal.value = !showAssignOutletModal.value;
};

// Assign Roles from User
const assignRole = async (userId: string, roleId: string, outletId: string) => {
  try {
    showLoading();
    const payload = {
      role_id: roleId,
      user_id: userId,
      outlet_id: outletId,
    };
    const response = await assignRoleToUser(payload);
    
    showAssignOutletModal.value = false;
    
    fetchUserRole();
    showToast({
      type: 'success',
      title: 'Success.',
      message: response?.data?.message || 'Role assigned successfully.',
    });
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to assign role.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  } finally {
    hideLoading();
  }
};

const cancelAssignOutletModal = () => {
  showAssignOutletModal.value = false;
}

const submitAssignOutletModal = (payload: any) => {
  assignRole(
    userID.value,
    payload?.role?.id,
    payload?.outlet?.id
  );
};

// Revoke Roles from User
const revokeRole = async (userId: string, roleId: string, outletId: string) => {
  try {
    showLoading();
    const payload = {
      user_id: userId,
      role_id: roleId,
      outlet_id: outletId,
    };
    const response = await revokeRoleFromUser(payload);

    fetchUserRole();
    showToast({
      type: 'success',
      title: 'Success.',
      message: response?.data?.message || 'Role revoked successfully.',
    });
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to revoke role.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  } finally {
    hideLoading();
  }
};

const onCheckRole = (role: any) => {
  showConfirm({
    header: 'Revoke Role',
    message: 'This will remove user from this roles.',
    rejectLabel: 'Cancel',
    acceptLabel: 'Revoke',
    type: 'danger',
    accept: () => {
      revokeRole(
        role?.user_id,
        role?.role_id,
        role?.outlet_id
      );
    },
  });
};

// Methods
const onBack = () => {
  router.back();
};

const onEdit = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: userID.value,
    }
  });
};

onMounted(() => {
  fetchDetail();
  fetchUserRole();
  // fetchRole();
  // fetchOutlet();
});
</script>