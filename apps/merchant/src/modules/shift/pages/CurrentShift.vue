<template>
  <div class="pos-shift">
    <!-- Shift Status -->
    <ShiftStatus :outlet-id="outlet?.id" />

    <!-- Participants Tab -->
    <ParticipantManagement
      :shift-id="currentShift.id"
      :is-shift-owner="isShiftOwner"
      :is-shift-open="currentShift.status === 'open'"
      @participant-added="onParticipantChanged"
      @participant-removed="onParticipantChanged"
      @handoff-complete="onHandoffComplete"
    />

    <!-- Metrics Tab -->
    <MetricsDisplay
      :shift-id="currentShift.id"
      :participants="participants"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useShift } from '@/modules/shift/composables/useShift.ts';
import { getUser, getOutlet } from '@/helpers/auth.ts';
import ParticipantManagement from '@/modules/shift/components/ParticipantManagement.vue';
import MetricsDisplay from '@/modules/shift/components/MetricsDisplay.vue';
import ShiftStatus from '@/modules/shift/components/ShiftStatus.vue';

const emit = defineEmits(['shift-loaded']);
const outlet = getOutlet();

const {
  currentShift,
  participants,
  fetchShift,
  fetchShiftParticipants,
} = useShift();
const user = getUser();

const isShiftOwner = computed(() => {
  return currentShift.shift_owner_id === user?.id;
});

const onParticipantChanged = async () => {
  // Reload participants when they change
  if (currentShift.id) {
    await fetchShiftParticipants({ shiftId: currentShift.id });
  }
};

const onHandoffComplete = async () => {
  // Reload shift data after handoff
  if (currentShift.id) {
    await fetchShift({ shiftId: currentShift.id });
    await fetchShiftParticipants({ shiftId: currentShift.id });
  }
};

watch(
  () => currentShift,
  (shift: any) => {
    if (shift.id) {
      fetchShiftParticipants({ shiftId: shift.id });
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (currentShift.id) {
    fetchShiftParticipants({ shiftId: currentShift.id });
  }
});
</script>

<style scoped>
@import "tailwindcss";
@import "@/assets/styles/themes.css";

.pos-shift {
  @apply w-full space-y-4;
}

/* .pos-shift-status {
  @apply w-full p-2 rounded-lg border transition-colors duration-200 mb-4;
}

.pos-shift-status--open {
  @apply border-green-500 bg-green-50;
}

.pos-shift-status--closed {
  @apply border-red-500 bg-red-50;
}

.pos-shift-status--dark {
  @apply dark:border-dark! dark:bg-dark-secondary!;
}

.pos-shift-status__content {
  @apply flex items-center justify-between gap-4;
}

.pos-shift-status__left {
  @apply flex-1 flex gap-2 items-center pl-2;
}

.pos-shift-status__indicator {
  font-size: 10px;
}

.pos-shift-status__indicator--open {
  @apply text-green-400 dark:text-green-400;
}

.pos-shift-status__indicator--closed {
  @apply text-red-400 dark:text-red-400;
}

.pos-shift-status__label {
  @apply flex-1 text-sm font-semibold;
}

.pos-shift-status__label--empty {
  @apply text-gray-900;
}

.pos-shift-status__label--empty-dark {
  @apply dark:text-white;
}

.pos-shift-status__actions {
  @apply flex gap-2;
} */
</style>
