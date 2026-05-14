<template>
  <div
    class="pos-shift-status"
    :class="{
      'pos-shift-status--open': currentShift.status === ShiftStatus.OPEN,
      'pos-shift-status--closed': currentShift.status === ShiftStatus.CLOSED,
      'pos-shift-status--dark': true,
    }"
  >
    <div class="pos-shift-status__content">
      <div class="pos-shift-status__left">
        <span
          class="pos-shift-status__indicator"
          :class="{
            'pos-shift-status__indicator--open': currentShift.status === ShiftStatus.OPEN,
            'pos-shift-status__indicator--closed': currentShift.status === ShiftStatus.CLOSED,
          }"
        >
          ●
        </span>
        <div class="flex-1 flex flex-col md:flex-row">
          <span
            class="pos-shift-status__label"
            :class="{
              'pos-shift-status__label--empty': !currentShift.id,
              'pos-shift-status__label--empty-dark': !currentShift.id,
            }"
          >
            {{
              currentShift.status === ShiftStatus.OPEN
                ? `${currentShift?.shift_owner?.name} is in Shift`
                : 'No Active Shift'
              }}
          </span>
          <span class="text-xs">
            Created at {{ currentShift.created_at ? formatDateTime(currentShift.created_at) : 'N/A' }}
          </span>
        </div>
      </div>
      <div v-if="currentShift.id" class="pos-shift-status__actions">
        <Button
          v-if="currentShift.status === ShiftStatus.CLOSED"
          label="Open Shift"
          size="small"
          severity="danger"
          :loading="loading"
          :disabled="loading"
          @click="handleOpenShift"
        />
        <Button
          v-if="
            isUserOwner &&
            currentShift.status === ShiftStatus.OPEN
          "
          label="Close Shift"
          size="small"
          severity="success"
          :loading="loading"
          :disabled="loading"
          @click="handleCloseConfirm"
        />
      </div>
    </div>

    <Divider />

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <!-- Participant Count -->
      <div class="p-4 flex flex-row xl:flex-col gap-2 justify-between items-center rounded-lg bg-blue-50 dark:bg-dark">
        <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Participants</label>
        <div class="text-base font-semibold text-gray-900 dark:text-white">
          {{ currentShift.participant_count || 0 }}
        </div>
      </div>

      <!-- Total Transactions -->
      <div class="p-4 flex flex-row xl:flex-col gap-2 justify-between items-center rounded-lg bg-red-50 dark:bg-dark">
        <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</label>
        <div class="text-base font-semibold text-gray-900 dark:text-white">
          {{ currentShift.total_transactions || 0 }}
        </div>
      </div>

      <!-- Shift Time -->
      <div class="p-4 flex flex-row xl:flex-col gap-2 justify-between items-center rounded-lg bg-orange-50 dark:bg-dark">
        <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Shift Time</label>
        <div class="text-base font-semibold text-gray-900 dark:text-white">
          {{ formatRangeTime(currentShift.start_time, currentShift.end_time) }}
        </div>
      </div>
    </div>

    <Message
      v-if="!isUserRemovedFromShift && currentShift.status === ShiftStatus.OPEN"
      severity="success"
      icon="pi pi-info-circle"
    >
      Only {{ currentShift?.shift_owner?.name }} can close this shift.
    </Message>
  
    <Message
      v-if="!isUserInShift && currentShift.status === ShiftStatus.OPEN"
      severity="info"
      icon="pi pi-info-circle"
    >
      <b>You're not shift participant.</b><br>
      <span class="text-sm">
        To join in this shift you can request to your shift owner's.
      </span>
    </Message>
  
    <Message
      v-if="isUserRemovedFromShift && currentShift.status === ShiftStatus.OPEN"
      severity="warn"
      icon="pi pi-info-circle"
    >
      <b>
        You have been removed from this shift.
      </b><br>
      <span class="text-sm">
        Please contact the shift owner to restore your shift.
      </span>
    </Message>
  </div>

</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useShift, type Participant } from '@/modules/shift/composables/useShift.ts';
import { formatDateTime, formatRangeTime } from '@/helpers/utils.ts';
import { showConfirm, showToast } from '@/helpers/toast.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import * as shiftApi from '@/modules/shift/services/api.ts';

const ShiftStatus = {
  OPEN: 'open',
  CLOSED: 'closed'
};

const props = defineProps({
  outletId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['shift-loaded']);

const {
  isUserOwner,
  isUserInShift,
  isUserRemovedFromShift,
  currentShift,
  loading,
  fetchShiftParticipants,
} = useShift();

const fetchOutletShift = async () => {
  try {
    const response = await shiftApi.getOutletShift(props.outletId);
    const shiftData = response?.data?.data || {};
    if (shiftData?.id) {
      // Set current shift
      const { fetchShift: fetchShiftDetail } = useShift();
      await fetchShiftDetail({ shiftId: shiftData.id });
      
      // Fetch participants
      await fetchShiftParticipants({ shiftId: shiftData.id });
      
      emit('shift-loaded', shiftData);
    }
  } catch (error) {
    console.error('Failed to fetch outlet shift:', error);
  }
};

const handleOpenShift = async () => {
  try {
    const response = await shiftApi.openShift({
      outlet_id: props.outletId,
      // shift_owner_id: user?.id,
    });
    const newShift = response?.data?.data;
    if (newShift?.id) {
      await fetchOutletShift();
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Shift opened successfully',
      });
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error',
      message: getErrorMessage(error) || 'Failed to open shift',
    });
  }
};

const handleCloseShift = async () => {
  try {
    await shiftApi.closeShift(currentShift.id);
    await fetchOutletShift();
    showToast({
      type: 'success',
      title: 'Success',
      message: 'Shift closed successfully',
    });
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error',
      message: getErrorMessage(error) || 'Failed to close shift',
    });
  }
};

const handleCloseConfirm = () => {
  showConfirm({
    header: 'Close Shift?',
    message: 'Are you sure you want to close this shift?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Close',
    type: 'warn',
    accept: () => {
      handleCloseShift();
    },
  });
};

onMounted(() => {
  if (props.outletId) {
    fetchOutletShift();
  }
});

// Watch for outlet changes
watch(
  () => props.outletId,
  (newOutletId) => {
    if (newOutletId) {
      fetchOutletShift();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
@import "tailwindcss";
@import "@/assets/styles/themes.css";

.pos-shift-status {
  @apply w-full p-4 rounded-lg border transition-colors duration-200 space-y-4;
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
  @apply flex-1 flex gap-2 items-center;
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
}
</style>
