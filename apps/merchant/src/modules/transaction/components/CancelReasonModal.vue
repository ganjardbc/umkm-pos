<template>
  <Dialog
    v-model:visible="visibility"
    modal
    header="Batalkan Transaksi"
    class="w-full max-w-md"
  >
    <p class="text-sm text-gray-500 mb-4">
      Stok produk akan dikembalikan. Transaksi yang sudah dibatalkan tidak bisa dipulihkan.
    </p>

    <div class="space-y-4">
      <UiFormGroup label="Alasan" variant="vertical">
        <Textarea
          v-model="reason"
          class="w-full"
          rows="3"
          maxlength="255"
          placeholder="Contoh: salah input, pelanggan batal"
        />
      </UiFormGroup>

      <UiFormGroup
        v-if="needsPin"
        label="PIN Manager"
        variant="vertical"
      >
        <InputText
          v-model="pin"
          type="password"
          inputmode="numeric"
          maxlength="6"
          class="w-full"
          placeholder="6 digit PIN manager atau owner"
          autocomplete="off"
        />
        <small class="text-gray-500">
          Pembatalan oleh kasir harus disetujui manager atau owner dengan PIN-nya.
        </small>
      </UiFormGroup>
    </div>

    <template #footer>
      <div class="w-full flex gap-4">
        <Button
          label="Tidak"
          severity="secondary"
          variant="outlined"
          class="w-full"
          @click="visibility = false"
        />
        <Button
          label="Ya, Batalkan"
          severity="danger"
          class="w-full"
          :disabled="!canSubmit"
          @click="onConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import UiFormGroup from '@umkm-pos/ui/components/UiFormGroup.vue';
import { isHasPermission } from '@/helpers/auth.ts';
import { CANCEL_APPROVE } from '@/modules/transaction/services/rbac.ts';

const visibility = defineModel<boolean>('visibility', { required: true });

const emit = defineEmits<{
  confirm: [payload: { reason: string; approver_pin?: string }];
}>();

const reason = ref('');
const pin = ref('');

// Approvers cancel on their own authority; everyone else needs a manager's PIN.
const needsPin = computed(() => !isHasPermission(CANCEL_APPROVE));
const canSubmit = computed(
  () => reason.value.trim().length >= 3 && (!needsPin.value || /^\d{6}$/.test(pin.value)),
);

// Start empty every time the dialog opens
watch(visibility, (open) => {
  if (open) {
    reason.value = '';
    pin.value = '';
  }
});

const onConfirm = () => {
  if (!canSubmit.value) return;
  emit('confirm', {
    reason: reason.value.trim(),
    ...(needsPin.value && { approver_pin: pin.value }),
  });
  visibility.value = false;
};
</script>
