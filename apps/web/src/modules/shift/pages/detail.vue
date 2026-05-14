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
        Shift Detail
      </h1>
    </div>

    <!-- Shift Information -->
    <Information
      v-if="currentShift?.id"
      :current-shift="currentShift"
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
import Information from '@/modules/shift/components/Information.vue';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { getDetailShift, getShiftParticipants } from '@/modules/shift/services/api';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';

const route = useRoute();
const router = useRouter();
const shiftID = computed(() => route.params.id as string);

// Fetch Detail Shift
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
  await fetchParticipantShift();
});
</script>

<style scoped></style>
