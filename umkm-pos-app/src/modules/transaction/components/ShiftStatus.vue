<template>
  <!-- Warning Shift -->
  <Message
    v-if="currentShift.status === ShiftStatus.CLOSED"
    severity="warn"
    icon="pi pi-info-circle"
  >
    <b>Shift is closed.</b><br>
    <span class="text-sm">
      Please open new shit to create transactions.
    </span>
  </Message>

  <Message
    v-if="!isUserInShift && currentShift.status === ShiftStatus.OPEN"
    severity="info"
    icon="pi pi-info-circle"
  >
    <b>You're not shift participant.</b><br>
    <span class="text-sm">
      To create the transactions, you have to be a part of the shift.
    </span>
  </Message>
</template>

<script setup lang="ts">
import { useShift } from '@/modules/shift/composables/useShift.ts';

const ShiftStatus = {
  OPEN: 'open',
  CLOSED: 'closed'
};

// Computed for Shift
const {
  isUserInShift,
  currentShift,
} = useShift();
</script>
