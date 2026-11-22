<template>
  <!-- Warning Shift -->
  <Message
    v-if="shiftRequired && currentShift.status === ShiftStatus.CLOSED"
    severity="warn"
    icon="pi pi-info-circle"
  >
    <b>Shift telah ditutup.</b><br>
    <span class="text-sm">
      Silakan buka shift baru untuk membuat transaksi.
    </span>
  </Message>

  <Message
    v-if="shiftRequired && !isUserInShift && currentShift.status === ShiftStatus.OPEN"
    severity="info"
    icon="pi pi-info-circle"
  >
    <b>Anda bukan peserta shift ini.</b><br>
    <span class="text-sm">
      Untuk membuat transaksi, Anda harus menjadi bagian dari shift ini.
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
  shiftRequired,
  isUserInShift,
  currentShift,
} = useShift();
</script>
