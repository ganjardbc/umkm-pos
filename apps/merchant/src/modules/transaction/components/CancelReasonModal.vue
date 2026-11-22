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

    <UiFormGroup label="Alasan (opsional)" variant="vertical">
      <Textarea
        v-model="reason"
        class="w-full"
        rows="3"
        maxlength="255"
        placeholder="Contoh: salah input, pelanggan batal"
      />
    </UiFormGroup>

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
          @click="onConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import UiFormGroup from '@umkm-pos/ui/components/UiFormGroup.vue';

const visibility = defineModel<boolean>('visibility', { required: true });

const emit = defineEmits<{
  confirm: [reason: string];
}>();

const reason = ref('');

// Start empty every time the dialog opens
watch(visibility, (open) => {
  if (open) reason.value = '';
});

const onConfirm = () => {
  emit('confirm', reason.value.trim());
  visibility.value = false;
};
</script>
