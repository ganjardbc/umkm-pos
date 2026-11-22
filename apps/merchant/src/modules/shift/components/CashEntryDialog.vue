<template>
  <Dialog
    v-model:visible="visible"
    modal
    class="w-full max-w-md"
    header="Catat Kas"
    :closable="!submitting"
  >
    <div class="space-y-3">
      <UiFormGroup label="Jenis" variant="vertical">
        <SelectButton
          v-model="type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          :disabled="submitting"
        />
      </UiFormGroup>
      <UiFormGroup label="Nominal" variant="vertical">
        <InputNumber
          v-model="amount"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          :min="0"
          fluid
          :disabled="submitting"
          placeholder="Masukkan nominal"
        />
      </UiFormGroup>
      <UiFormGroup label="Alasan" variant="vertical">
        <Textarea
          v-model="reason"
          rows="3"
          maxlength="255"
          fluid
          :disabled="submitting"
          placeholder="Alasan wajib diisi"
        />
      </UiFormGroup>
      <Message v-if="errorMessage" severity="error" size="small">
        {{ errorMessage }}
      </Message>
    </div>

    <template #footer>
      <Button
        label="Batal"
        severity="secondary"
        variant="outlined"
        :disabled="submitting"
        @click="visible = false"
      />
      <Button
        label="Simpan"
        :loading="submitting"
        :disabled="submitting || !amount || !reason.trim()"
        @click="onSubmit"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';

const props = defineProps<{
  // Calls the API. Rejects => error shown, dialog stays open with inputs kept.
  submit: (data: { type: 'in' | 'out'; amount: number; reason: string }) => Promise<any>;
}>();

const emit = defineEmits<{ (e: 'saved'): void }>();

const visible = defineModel<boolean>('visible', { default: false });

const typeOptions = [
  { label: 'Kas Masuk', value: 'in' },
  { label: 'Kas Keluar', value: 'out' },
];

const type = ref<'in' | 'out'>('in');
const amount = ref<number | null>(null);
const reason = ref('');
const submitting = ref(false);
const errorMessage = ref('');

// Reset only when opening, so a failed submit keeps the inputs.
watch(visible, (v) => {
  if (v) {
    type.value = 'in';
    amount.value = null;
    reason.value = '';
    errorMessage.value = '';
  }
});

const onSubmit = async () => {
  if (!amount.value || !reason.value.trim() || submitting.value) return;
  submitting.value = true;
  errorMessage.value = '';
  try {
    await props.submit({ type: type.value, amount: amount.value, reason: reason.value.trim() });
    visible.value = false;
    emit('saved');
  } catch (error) {
    errorMessage.value = getErrorMessage(error) || 'Terjadi kesalahan';
  } finally {
    submitting.value = false;
  }
};
</script>
