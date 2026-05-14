<template>
  <Dialog
    v-model:visible="visibility"
    modal
    group="headless"
    class="assign-outlet-modal"
  >
    <template #header>
      <h1 class="text-xl font-semibold">
        Assign Outlet
      </h1>
    </template>

    <div class="flex flex-col gap-4">
      <Stepper v-model:value="activeStep" :linear="true" class="basis-[622px]">
        <StepList>
          <Step :value="1">Outlet</Step>
          <Step :value="2">Roles</Step>
          <Step :value="3">Preview</Step>
        </StepList>

        <StepPanels>
          <!-- Outlets -->
          <StepPanel :value="1">
            <UiCard class="p-0! gap-0! overflow-hidden!">
              <template #header>
                <h2 class="text-lg font-semibold pt-4 px-4">
                  Outlets
                </h2>
              </template>

              <DataTable :value="outlets">
                <template #empty>
                  <span class="w-full text-center flex justify-center">
                    Your outlets are empty.
                  </span>
                </template>
                <Column field="no" header="NO" class="w-18">
                  <template #body="slotProps">
                    {{ getNoTable(slotProps.index, outletPagination.page, outletPagination.rows) }}
                  </template>
                </Column>
                <Column field="name" header="Name"></Column>
                <Column field="location" header="Location"></Column>
                <Column field="merchants" header="Merchant">
                  <template #body="slotProps">
                    {{ slotProps.data.merchants.name }}
                  </template>
                </Column>
                <Column field="action" header="#" class="w-[152px]">
                  <template #body="slotProps">
                    <div class="flex gap-2">
                      <Button
                        :severity="isOutletSelected(slotProps.data) ? 'default' : 'secondary'"
                        :variant="isOutletSelected(slotProps.data) ? 'soft' : 'outlined'"
                        :label="isOutletSelected(slotProps.data) ? 'Unselect' : 'Select'"
                        :icon="isOutletSelected(slotProps.data) ? 'pi pi-check' : 'pi pi-plus'"
                        size="small"
                        class="w-[120px]"
                        @click="onSelectOutlet(slotProps.data)"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>

              <UiPagination
                v-model="outletPagination"
                @page="onOutletPageChange"
              />
            </UiCard>
          </StepPanel>

          <!-- Roles -->
          <StepPanel :value="2">
            <UiCard class="p-0! gap-0! overflow-hidden!">
              <template #header>
                <h2 class="text-lg font-semibold pt-4 px-4">
                  Roles
                </h2>
              </template>
              
              <DataTable :value="roles">
                <template #empty>
                  <span class="w-full text-center flex justify-center">
                    Your roles are empty.
                  </span>
                </template>
                <Column field="no" header="NO" class="w-18">
                  <template #body="slotProps">
                    {{ getNoTable(slotProps.index, rolePagination.page, rolePagination.rows) }}
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
                <Column field="role_permissions" header="Permissions">
                  <template #body="slotProps">
                    {{ slotProps.data.role_permissions?.length }}
                  </template>
                </Column>
                <Column field="action" header="#" class="w-[152px]">
                  <template #body="slotProps">
                    <div
                      v-if="slotProps.data.name !== 'admin'"
                      class="flex gap-2"
                    >
                      <Button
                        :severity="isRoleSelected(slotProps.data) ? 'default' : 'secondary'"
                        :variant="isRoleSelected(slotProps.data) ? 'soft' : 'outlined'"
                        :label="isRoleSelected(slotProps.data) ? 'Unselect' : 'Select'"
                        :icon="isRoleSelected(slotProps.data) ? 'pi pi-check' : 'pi pi-plus'"
                        size="small"
                        class="w-[120px]"
                        @click="onSelectRole(slotProps.data)"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>

              <UiPagination
                v-model="rolePagination"
                @page="onRolePageChange"
              />
            </UiCard>
          </StepPanel>

          <!-- Preview -->
          <StepPanel :value="3">
            <div class="space-y-6">
              <!-- Outlet Information -->
              <UiCard v-if="outletSelected" class="dark:bg-dark!">
                <template #header>
                  <h2 class="text-lg font-semibold">
                    Outlet Information
                  </h2>
                </template>

                <div class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-medium text-gray-500">Outlet Name</label>
                      <p class="text-base mt-1">{{ outletSelected.name }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-500">Merchant</label>
                      <p class="text-base mt-1">{{ outletSelected.merchants.name }}</p>
                    </div>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500">Location</label>
                    <p class="text-base mt-1">{{ outletSelected.location }}</p>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-medium text-gray-500">Slug</label>
                      <p class="text-base mt-1">{{ outletSelected.slug }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-500">Status</label>
                      <p class="text-base mt-1">
                        <Tag :severity="outletSelected.is_active ? 'success' : 'danger'" :value="outletSelected.is_active ? 'Active' : 'Inactive'" />
                      </p>
                    </div>
                  </div>
                </div>
              </UiCard>

              <!-- Role Information -->
              <UiCard v-if="roleSelected" class="dark:bg-dark!">
                <template #header>
                  <h2 class="text-lg font-semibold">
                    Role Information
                  </h2>
                </template>

                <div class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-medium text-gray-500">Role Name</label>
                      <p class="text-base mt-1">{{ roleSelected.name }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-500">Total Permissions</label>
                      <p class="text-base mt-1">{{ roleSelected.role_permissions?.length || 0 }}</p>
                    </div>
                  </div>

                  <div>
                    <label class="text-sm font-medium text-gray-500">Description</label>
                    <p class="text-base mt-1">{{ roleSelected.description }}</p>
                  </div>

                  <div v-if="roleSelected.role_permissions && roleSelected.role_permissions.length > 0">
                    <label class="text-sm font-medium text-gray-500 mb-2 block">Permissions</label>
                    <div class="flex flex-wrap gap-2">
                      <Tag 
                        v-for="permission in roleSelected.role_permissions" 
                        :key="permission.permission_id"
                        severity="secondary"
                        :value="permission.permissions.code"
                      />
                    </div>
                  </div>
                </div>
              </UiCard>

              <!-- Empty State -->
              <div v-if="!outletSelected && !roleSelected" class="flex flex-col items-center justify-center h-full text-center py-12">
                <i class="pi pi-info-circle text-gray-400 text-5xl mb-4"></i>
                <p class="text-gray-500 text-lg">No outlet or role selected</p>
                <p class="text-gray-400 text-sm mt-2">Please select an outlet and role from previous steps</p>
              </div>
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </div>

    <template #footer>
      <!-- Footer -->
      <div class="flex justify-end gap-4 pt-4">
        <Button
          severity="secondary"
          :label="activeStep === 1 ? 'Cancel' : 'Back'"
          size="medium"
          class="w-full md:w-[128px]"
          @click="onCancel"
        />
        <Button
          :label="activeStep === 3 ? 'Save' : 'Next'"
          size="medium"
          class="w-full md:w-[128px]"
          :disabled="disabledSave"
          @click="onSave"
        />
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getNoTable, getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { getListOutlet } from '@/modules/outlet/services/api.ts';
import { getListRole } from '@/modules/role/services/api.ts';
import UiCard from '@/components/UiCard.vue';
import UiPagination from '@/components/UiPagination.vue';

const emits = defineEmits(['submit', 'cancel']);

const visibility = defineModel<boolean>("visibility", {
  required: true
});

// Fetch Outlets
interface OutletData {
  id: string;
  merchant_id: string;
  slug: string;
  name: string;
  location: string;
  logo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  merchants: {
    id: string;
    slug: string;
    name: string;
    phone: string | null;
    address: string | null;
    logo: string | null;
  }
}

const outlets = ref<OutletData[]>([]);
const outletPagination = ref({
  page: 1,
  pageCount: 0,
  rows: 5,
  totalRecords: 0,
});
const outletSelected = ref<OutletData | null>(null);

const onSelectOutlet = (outlet: OutletData) => {
  if (outletSelected.value?.id === outlet.id) {
    outletSelected.value = null;
  } else {
    outletSelected.value = outlet;
  }
};

const isOutletSelected = (outlet: OutletData) => {
  return outletSelected.value?.id === outlet.id;
};

const fetchOutlet = async () => {
  try {
    const payload = {
      page: outletPagination.value.page,
      limit: outletPagination.value.rows,
    }
    const response = await getListOutlet(payload);
    const { data, meta } = response?.data?.data || {};

    outlets.value = data;
    outletPagination.value.totalRecords = meta?.total;
    outletPagination.value.pageCount = meta?.totalPages;
  } catch (error) {
    console.log(error);
    showToast({
      type: 'error',
      title: 'Error.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const onOutletPageChange = (event: any) => {
  outletPagination.value.page = event.page + 1;
  fetchOutlet();
};

// Fetch Roles
interface RoleData {
  id: string;
  name: string;
  description: string;
  role_permissions: Array<{
    role_id: string;
    permission_id: string;
    permissions: {
      id: string;
      code: string;
      description: string;
    }
  }>;
}

const roles = ref<RoleData[]>([]);
const rolePagination = ref({
  page: 1,
  pageCount: 0,
  rows: 5,
  totalRecords: 0,
});
const roleSelected = ref<RoleData | null>(null);

const onSelectRole = (role: RoleData) => {
  if (roleSelected.value?.id === role.id) {
    roleSelected.value = null;
  } else {
    roleSelected.value = role;
  }
};

const isRoleSelected = (role: RoleData) => {
  return roleSelected.value?.id === role.id;
};

const fetchRole = async () => {
  try {
    const payload = {
      page: rolePagination.value.page,
      limit: rolePagination.value.rows,
    }
    const response = await getListRole(payload);
    const { data, meta } = response?.data?.data || {};

    roles.value = data;
    rolePagination.value.totalRecords = meta?.total;
    rolePagination.value.pageCount = meta?.totalPages;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const onRolePageChange = (event: any) => {
  rolePagination.value.page = event.page + 1;
  fetchRole();
};

// Footer
const activeStep = ref(1);

const disabledSave = computed(() => {
  if (activeStep.value === 1) return !outletSelected.value
  if (activeStep.value === 2) return !roleSelected.value
  return !outletSelected.value && !roleSelected.value;
})

const onCancel = () => {
  if (activeStep.value === 1) {
    emits('cancel');
  } else {
    activeStep.value -= 1;
  }
}

const onSave = () => {
  if (activeStep.value === 3) {
    emits('submit', {
      outlet: outletSelected.value,
      role: roleSelected.value,
    });
  } else {
    activeStep.value += 1;
  }
}

watch(() => visibility.value, (val: any) => {
  if (val) {
    activeStep.value = 1;
    outletSelected.value = null;
    roleSelected.value = null;
  }
});

onMounted(() => {
  fetchRole();
  fetchOutlet();
});
</script>
<style>
.assign-outlet-modal {
  width: 64rem;
}

.assign-outlet-modal .p-dialog-content {
  padding-bottom: 0 !important;
}
</style>
