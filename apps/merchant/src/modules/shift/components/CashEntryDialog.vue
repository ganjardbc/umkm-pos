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
      <UiFormGroup label="Kategori" variant="vertical">
        <Select
          v-model="reasonCode"
          :options="codeOptions"
          option-label="label"
          option-value="value"
          show-clear
          fluid
          :disabled="submitting"
          placeholder="Pilih kategori (opsional)"
        />
      </UiFormGroup>
      <UiFormGroup label="Alasan" variant="vertical">
        <Textarea
          v-model="reason"
          rows="3"
          maxlength="255"
          fluid
          :disabled="submitting"
          placeholder="Alasan wajib diisi, kecuali kategori dipilih"
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
        :disabled="submitting || !amount || !finalReason"
        @click="onSubmit"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';

const props = defineProps<{
  // Preselected type when the dialog opens (default: Kas Masuk).
  initialType?: 'in' | 'out';
  // Calls the API. Rejects => error shown, dialog stays open with inputs kept.
  submit: (data: { type: 'in' | 'out'; amount: number; reason: string; reason_code?: string }) => Promise<any>;
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
const reasonCode = ref<string | null>(null);

// Codes match the API's shift-cash.constants.ts.
const CODE_OPTIONS = {
  in: [
    { label: 'Modal tambahan', value: 'modal_tambahan' },
    { label: 'Uang kembalian', value: 'kembalian' },
    { label: 'Lainnya', value: 'lainnya' },
  ],
  out: [
    { label: 'Beli bahan', value: 'beli_bahan' },
    { label: 'Biaya operasional', value: 'operasional' },
    { label: 'Setoran ke pemilik', value: 'setoran_pemilik' },
    { label: 'Lainnya', value: 'lainnya' },
  ],
};
const codeOptions = computed(() => CODE_OPTIONS[type.value]);
// Typed text wins; otherwise a specific category's label stands in as the reason.
const finalReason = computed(() => {
  if (reason.value.trim()) return reason.value.trim();
  const picked = codeOptions.value.find((o) => o.value === reasonCode.value);
  return picked && picked.value !== 'lainnya' ? picked.label : '';
});
const submitting = ref(false);
const errorMessage = ref('');

// Reset only when opening, so a failed submit keeps the inputs.
watch(visible, (v) => {
  if (v) {
    type.value = props.initialType ?? 'in';
    amount.value = null;
    reason.value = '';
    reasonCode.value = null;
    errorMessage.value = '';
  }
});
// A code of the other type would be rejected as meaningless: reset when the type changes.
watch(type, () => { reasonCode.value = null; });

const onSubmit = async () => {
  if (!amount.value || !finalReason.value || submitting.value) return;
  submitting.value = true;
  errorMessage.value = '';
  try {
    await props.submit({
      type: type.value,
      amount: amount.value,
      reason: finalReason.value,
      ...(reasonCode.value ? { reason_code: reasonCode.value } : {}),
    });
    visible.value = false;
    emit('saved');
  } catch (error) {
    errorMessage.value = getErrorMessage(error) || 'Terjadi kesalahan';
  } finally {
    submitting.value = false;
  }
};
</script>
