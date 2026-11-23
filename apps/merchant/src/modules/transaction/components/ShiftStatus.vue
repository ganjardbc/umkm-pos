<template>
  <!-- Warning Shift -->
  <Message
    v-if="shiftRequired && currentShift.status === ShiftStatus.CLOSED"
    severity="warn"
    icon="pi pi-info-circle"
  >
    <b>Kasir sudah ditutup.</b><br>
    <span class="text-sm">
      Silakan buka kasir untuk membuat transaksi.
    </span>
  </Message>

  <Message
    v-if="shiftRequired && !isUserInShift && currentShift.status === ShiftStatus.OPEN"
    severity="info"
    icon="pi pi-info-circle"
  >
    <b>Anda bukan kasir bertugas saat ini.</b><br>
    <span class="text-sm">
      Untuk membuat transaksi, Anda harus menjadi kasir bertugas.
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
