<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row gap-4">
      <UiSearch
        v-model="form.search"
        type="search"
        class="w-full"
        @input="search"
      />
    </div>

    <UiCard class="p-0! gap-0! overflow-hidden!">
      <DataTable :value="shifts" tableStyle="min-width: 50rem">
        <template #empty>
          <span class="w-full text-center flex justify-center">
            Shifts are empty.
          </span>
        </template>
        <Column field="no" header="NO" class="w-18">
          <template #body="slotProps">
            {{ getNoTable(slotProps.index, pagination.page, pagination.rows) }}
          </template>
        </Column>
        <Column field="outlet" header="Outlet" class="min-w-48">
          <template #body="slotProps">
            {{ slotProps.data.outlet?.name }}
          </template>
        </Column>
        <Column field="users" header="Users" class="min-w-48">
          <template #body="slotProps">
            {{ slotProps.data.shift_owner?.name }}
          </template>
        </Column>
        <Column field="date" header="Date" class="min-w-48">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.start_time) }}
          </template>
        </Column>
        <Column field="time" header="Time" class="min-w-48">
          <template #body="slotProps">
            {{ formatRangeTime(slotProps.data.start_time, slotProps.data.end_time) }}
          </template>
        </Column>
        <Column field="duration" header="Duration" class="min-w-48">
          <template #body="slotProps">
            {{ getDuration(slotProps.data.start_time, slotProps.data.end_time) }}
          </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.status"
              :severity="getStatusSeverity(slotProps.data.status)"
              class="capitalize"
            />
          </template>
        </Column>
        <Column field="action" header="#" class="w-[48px]">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-eye"
                size="small"
                :disabled="slotProps.data.status === 'open'"
                @click="onDetailShift(slotProps.data)"
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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getNoTable, getErrorMessage, formatDate, formatRangeTime, getDuration } from '@/helpers/utils.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/shift/services/constants.ts';
import { getListShift } from '@/modules/shift/services/api.ts';
import { showToast } from '@/helpers/toast.ts';
import { getOutlet } from '@/helpers/auth.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';

const outlet = getOutlet();
const router = useRouter();

// Fetch Data
const shifts = ref([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchShift = async () => {
  try {
    const payload = {
      outlet_id: outlet?.id,
      page: pagination.value.page,
      limit: pagination.value.rows,
    }
    const response = await getListShift(payload);
    const { data, meta } = response?.data?.data || {};

    shifts.value = data;
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
  fetchShift();
};

// Search
const form = ref({
  search: '',
});

const search = () => {
  console.log(form.value);
};

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'open':
      return 'success';
    case 'closed':
      return 'danger';
    default:
      return 'warning';
  }
};

const onDetailShift = (shift: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: { id: shift.id },
  });
}

onMounted(() => {
  fetchShift();
});
</script>

<style scoped>
</style>
