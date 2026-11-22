<template>
  <Dialog
    v-model:visible="visibility"
    modal
    :header="customer ? 'Ubah Pelanggan' : 'Pelanggan Baru'"
    class="w-full max-w-md"
  >
    <form
      class="space-y-4"
      @submit.prevent="onSave"
    >
      <UiFormGroup label="Nama" variant="vertical">
        <InputText
          v-model="form.name"
          class="w-full"
          maxlength="150"
          placeholder="Nama pelanggan"
        />
      </UiFormGroup>
      <UiFormGroup label="No. WhatsApp (opsional)" variant="vertical">
        <InputText
          v-model="form.phone"
          class="w-full"
          inputmode="tel"
          maxlength="30"
          placeholder="0812xxxxxxx"
        />
      </UiFormGroup>
      <UiFormGroup label="Catatan (opsional)" variant="vertical">
        <Textarea
          v-model="form.note"
          class="w-full"
          rows="2"
          maxlength="255"
          placeholder="Contoh: langganan, alergi kacang"
        />
      </UiFormGroup>
    </form>

    <template #footer>
      <div class="w-full flex gap-4">
        <Button
          label="Batal"
          severity="secondary"
          variant="outlined"
          class="w-full"
          @click="visibility = false"
        />
        <Button
          label="Simpan"
          class="w-full"
          :disabled="!form.name.trim()"
          :loading="saving"
          @click="onSave"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import UiFormGroup from '@umkm-pos/ui/components/UiFormGroup.vue';
import { patchCustomer, postCustomer } from '@/modules/customers/services/api.ts';

const props = defineProps<{ customer?: any | null }>();
const visibility = defineModel<boolean>('visibility', { required: true });
const emit = defineEmits<{ saved: [customer: any] }>();

const form = ref({ name: '', phone: '', note: '' });
const saving = ref(false);

watch(visibility, (open) => {
  if (!open) return;
  form.value = {
    name: props.customer?.name ?? '',
    phone: props.customer?.phone ?? '',
    note: props.customer?.note ?? '',
  };
});

const onSave = async () => {
  if (!form.value.name.trim() || saving.value) return;
  try {
    saving.value = true;
    const payload = {
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      note: form.value.note.trim(),
    };
    const response = props.customer
      ? await patchCustomer(props.customer.id, payload)
      : await postCustomer(payload);
    showToast({ type: 'success', title: 'Berhasil', message: 'Pelanggan disimpan.' });
    visibility.value = false;
    emit('saved', response?.data?.data);
  } catch (error) {
    showToast({ type: 'error', title: 'Gagal', message: getErrorMessage(error) || 'Gagal menyimpan pelanggan.' });
  } finally {
    saving.value = false;
  }
};
</script>
