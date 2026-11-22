<template>
  <div class="space-y-3">
    <div
      v-if="groups.length === 0"
      class="space-y-2"
    >
      <p class="text-sm text-gray-400">
        Belum ada pilihan. Mulai dari contoh, lalu sesuaikan nama dan harganya:
      </p>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="preset in presets"
          :key="preset.name"
          :label="preset.name"
          icon="pi pi-plus"
          size="small"
          severity="secondary"
          variant="outlined"
          @click="addPreset(preset)"
        />
      </div>
    </div>

    <div
      v-for="(group, groupIndex) in groups"
      :key="groupIndex"
      class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3"
    >
      <div class="flex gap-2">
        <InputText
          v-model="group.name"
          class="flex-1"
          placeholder="Nama grup, contoh: Ukuran"
          maxlength="80"
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          variant="outlined"
          aria-label="Hapus grup"
          @click="removeGroup(groupIndex)"
        />
      </div>

      <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <label class="flex items-center gap-2">
          <Checkbox v-model="group.is_required" binary />
          Wajib dipilih
        </label>
        <label class="flex items-center gap-2">
          <Checkbox v-model="group.allow_multiple" binary />
          Boleh pilih lebih dari satu
        </label>
      </div>

      <div
        v-for="(option, optionIndex) in group.options"
        :key="optionIndex"
        class="flex gap-2"
      >
        <InputText
          v-model="option.name"
          class="flex-1"
          placeholder="Nama opsi, contoh: Large"
          maxlength="80"
        />
        <InputNumber
          v-model="option.price_delta"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          :min="0"
          placeholder="Tambahan harga"
          class="w-40"
        />
        <Button
          icon="pi pi-times"
          severity="secondary"
          variant="outlined"
          aria-label="Hapus opsi"
          @click="group.options.splice(optionIndex, 1)"
        />
      </div>

      <Button
        label="Tambah Opsi"
        icon="pi pi-plus"
        size="small"
        severity="secondary"
        variant="outlined"
        @click="group.options.push({ name: '', price_delta: 0 })"
      />
    </div>

    <Button
      label="Tambah Grup Opsi"
      icon="pi pi-plus"
      size="small"
      severity="secondary"
      @click="addGroup"
    />
  </div>
</template>

<script setup lang="ts">
import type { OptionGroupInput } from '@/modules/product-lists/helpers/options.ts';

const groups = defineModel<OptionGroupInput[]>({ required: true });

const presets: OptionGroupInput[] = [
  {
    name: 'Ukuran',
    is_required: true,
    allow_multiple: false,
    options: [
      { name: 'Small', price_delta: 0 },
      { name: 'Medium', price_delta: 3000 },
      { name: 'Large', price_delta: 6000 },
    ],
  },
  {
    name: 'Topping',
    is_required: false,
    allow_multiple: true,
    options: [
      { name: 'Boba', price_delta: 3000 },
      { name: 'Keju', price_delta: 2000 },
    ],
  },
  {
    name: 'Level gula',
    is_required: true,
    allow_multiple: false,
    options: [
      { name: 'Normal', price_delta: 0 },
      { name: 'Kurang manis', price_delta: 0 },
      { name: 'Tanpa gula', price_delta: 0 },
    ],
  },
];

const addPreset = (preset: OptionGroupInput) => {
  groups.value.push(JSON.parse(JSON.stringify(preset)));
};

const addGroup = () => {
  groups.value.push({
    name: '',
    is_required: false,
    allow_multiple: false,
    options: [{ name: '', price_delta: 0 }],
  });
};

const removeGroup = (index: number) => {
  groups.value.splice(index, 1);
};
</script>
