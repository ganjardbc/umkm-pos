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
        Laporan Kasir
      </h1>
    </div>

    <!-- Shift Information -->
    <Information
      v-if="currentShift?.id"
      :current-shift="currentShift"
    />

    <CashEntryList
      v-if="currentShift?.id"
      :entries="currentShift.cash_entries || []"
    >
      <template #action>
        <Button
          v-if="canRecordCash"
          label="Catat Kas"
          icon="pi pi-plus"
          size="small"
          @click="showCashEntry = true"
        />
      </template>
    </CashEntryList>

    <CashEntryDialog
      v-model:visible="showCashEntry"
      :submit="(data) => addCashEntry(shiftID, data)"
      @saved="fetchDetailShift"
    />

    <!-- Metrics Tab -->
    <MetricsDisplay
      v-if="currentShift?.id"
      :shift-id="currentShift?.id"
      :participants="participants"
      :show-removed-status="false"
    />
  </div>
</template>

<script setup lang="ts">
import MetricsDisplay from '@/modules/shift/components/MetricsDisplay.vue';
import CashEntryDialog from '@/modules/shift/components/CashEntryDialog.vue';
import CashEntryList from '@/modules/shift/components/CashEntryList.vue';
import { isHasPermission } from '@/helpers/auth.ts';
import Information from '@/modules/shift/components/Information.vue';
import { showLoading, hideLoading } from '@umkm-pos/ui/helpers/loading';
import { addCashEntry, getDetailShift, getOutletShiftSetting, getShiftParticipants } from '@/modules/shift/services/api';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';

const route = useRoute();
const router = useRouter();
const shiftID = computed(() => route.params.id as string);

// Fetch Laporan Kasir
const currentShift = ref<any>();

const fetchDetailShift = async () => {
  try {
    showLoading();
    const response = await getDetailShift(shiftID.value);
    const { data, success } = response?.data || {};
    if (success) {
      currentShift.value = data;
    }
  } catch (error) {
    console.error('Failed to fetch shift:', error);
  }  finally {
    hideLoading();
  }
};

// Record cash: open shift + shift.update + outlet setting not off (API stays the final guard).
const showCashEntry = ref(false);
const shiftRequired = ref(true);
const canRecordCash = computed(
  () => currentShift.value?.status === 'open' && isHasPermission('shift.update') && shiftRequired.value,
);

const fetchShiftSetting = async (outletId: string) => {
  try {
    const response = await getOutletShiftSetting(outletId);
    shiftRequired.value = response?.data?.data?.shift_required !== false;
  } catch {
    shiftRequired.value = true;
  }
};

// Fetch Participant Shift
const participants = ref<any[]>([]);

const fetchParticipantShift = async () => {
  try {
    const response = await getShiftParticipants(shiftID.value);
    const { data, success } = response?.data || {};
    if (success) {
      participants.value = data.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch shift:', error);
  }
};

// Methods
const onBack = () => {
  router.back();
};

onMounted(async () => {
  await fetchDetailShift();
  if (currentShift.value?.outlet_id) await fetchShiftSetting(currentShift.value.outlet_id);
  await fetchParticipantShift();
});
</script>

<style scoped></style>
