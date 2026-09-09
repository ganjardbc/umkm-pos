<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEditing ? 'Edit Meja' : 'Tambah Meja'"
    class="w-[92vw] max-w-lg"
  >
    <div class="space-y-3">
      <UiFormGroup label="Kode" variant="vertical">
        <InputText v-model="form.code" fluid />
      </UiFormGroup>
      <UiFormGroup label="Nama" variant="vertical">
        <InputText v-model="form.name" fluid />
      </UiFormGroup>
      <UiFormGroup label="Kapasitas" variant="vertical">
        <InputNumber v-model="form.capacity" fluid />
      </UiFormGroup>
      <div class="flex items-center gap-2">
        <Checkbox v-model="form.is_active" binary inputId="table-active" />
        <label for="table-active">Aktif</label>
      </div>
      <Button label="Simpan" fluid @click="save" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { patchOutletTable, postOutletTable } from '@/modules/outlet/services/api.ts';
import UiFormGroup from '@/components/UiFormGroup.vue';

const props = defineProps<{
  outletId: string;
  visible: boolean;
  table: any;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  saved: [];
}>();

const visible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val),
});

const isEditing = computed(() => !!props.table?.id);

const form = reactive({
  code: '',
  name: '',
  capacity: null as number | null,
  is_active: true,
});

const resetForm = () => {
  form.code = '';
  form.name = '';
  form.capacity = null;
  form.is_active = true;
};

watch(() => props.visible, (val) => {
  if (val && props.table) {
    form.code = props.table.code || '';
    form.name = props.table.name || '';
    form.capacity = props.table.capacity;
    form.is_active = props.table.is_active ?? true;
  }
  if (val && !props.table) {
    resetForm();
  }
});

const save = async () => {
  try {
    const payload = {
      code: form.code,
      name: form.name,
      capacity: form.capacity,
      is_active: form.is_active,
    };

    if (isEditing.value) {
      await patchOutletTable(props.outletId, props.table.id, payload);
    } else {
      await postOutletTable(props.outletId, payload);
    }

    visible.value = false;
    emit('saved');
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal menyimpan meja.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
};
</script>
