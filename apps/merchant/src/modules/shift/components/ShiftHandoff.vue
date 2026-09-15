<template>
  <UiCard class="shift-handoff">
    <div class="shift-handoff__header">
      <h3 class="shift-handoff__title">Oper Shift</h3>
    </div>

    <div class="shift-handoff__content">
      <p class="shift-handoff__description">
        Oper tanggung jawab shift kepada peserta lain oleh pemilik shift.
      </p>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Pilih Peserta Tujuan</label>
          <Dropdown
            v-model="selectedTargetUserId"
            :options="otherParticipants"
            option-label="user_name"
            option-value="user_id"
            placeholder="Pilih peserta"
            class="w-full"
            :disabled="!isShiftOwner"
          />
        </div>

        <div class="flex items-center gap-2">
          <InputSwitch
            v-model="removePreviousOwner"
            :disabled="!isShiftOwner"
          />
          <label class="text-sm">Keluarkan saya dari peserta shift setelah oper shift</label>
        </div>

        <div class="flex gap-2 justify-end">
          <Button
            label="Batal"
            severity="secondary"
            :disabled="!isShiftOwner || loading"
            fluid
            @click="resetForm"
          />
          <Button
            label="Oper Shift"
            :loading="loading"
            :disabled="!isShiftOwner || !selectedTargetUserId"
            fluid
            @click="handleConfirmHandoff"
          />
        </div>

        <div v-if="isHandoffComplete" class="text-center text-sm text-green-600 dark:text-green-400">
          ✓ Oper shift berhasil diselesaikan
        </div>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { type Participant, useShift } from '@/modules/shift/composables/useShift';
import { showConfirm, showToast } from '@/helpers/toast';
import { getErrorMessage } from '@/helpers/utils';
import UiCard from '@/components/UiCard.vue';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';

const props = defineProps({
  shiftId: {
    type: String,
    required: true,
  },
  currentOwnerId: {
    type: String,
    required: true,
  },
  participants: {
    type: Array as () => Participant[],
    required: true,
  },
  isShiftOwner: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['handoff-complete']);

const { loading, handoffShift } = useShift();

const selectedTargetUserId = ref('');
const removePreviousOwner = ref(false);
const isHandoffComplete = ref(false);

const otherParticipants = computed(() => {
  return props.participants.filter(
    (p) => p.user_id !== props.currentOwnerId && !p.participant_removed_at
  );
});

const resetForm = () => {
  selectedTargetUserId.value = '';
  removePreviousOwner.value = false;
};

const handleHandoff = async () => {
  if (!selectedTargetUserId.value) return;

  try {
    await handoffShift({
      shiftId: props.shiftId,
      targetUserId: selectedTargetUserId.value,
      removePreviousOwner: removePreviousOwner.value,
    });
    showToast({
      type: 'success',
      title: 'Sukses',
      message: 'Shift berhasil dioper',
    });

    // Mark as complete to disable form
    isHandoffComplete.value = true;

    // Emit after handoff shift complete
    emit('handoff-complete');
  } catch (error) {
    console.error('Handoff error:', error);
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal mengoper shift',
    });
  }
};

const handleConfirmHandoff = () => {
  showConfirm({
    header: 'Oper Shift?',
    message: 'Apakah Anda yakin ingin mengoper shift ini?',
    rejectLabel: 'Batal',
    acceptLabel: 'Oper Shift',
    type: 'warn',
    accept: () => {
      handleHandoff();
    },
  });
};
</script>

<style scoped>
@import "tailwindcss";
@import "@/assets/styles/themes.css";

.shift-handoff {
  @apply bg-white dark:bg-dark-secondary rounded-lg p-4 border border-gray-200 dark:border-dark;
}

.shift-handoff__header {
  @apply mb-4;
}

.shift-handoff__title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.shift-handoff__content {
  @apply space-y-4;
}

.shift-handoff__description {
  @apply text-sm text-gray-600 dark:text-gray-400;
}
</style>
