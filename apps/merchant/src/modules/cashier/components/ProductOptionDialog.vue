<template>
  <Dialog
    v-model:visible="visibility"
    modal
    :header="product?.name"
    class="w-full max-w-md"
  >
    <div class="space-y-5">
      <div v-for="group in groups" :key="group.id" class="space-y-2">
        <div class="flex items-baseline justify-between">
          <span class="text-sm font-semibold">{{ group.name }}</span>
          <span class="text-xs text-gray-400">
            {{ group.is_required ? 'Wajib' : 'Opsional' }}{{ group.allow_multiple ? ', boleh banyak' : '' }}
          </span>
        </div>

        <div>
          <button
            v-for="option in group.product_options"
            :key="option.id"
            type="button"
            class="w-full flex items-center justify-between gap-4 px-0 py-1.5 text-left text-sm cursor-pointer"
            @click="toggle(group, option.id)"
          >
            <span class="min-w-0">
              <span class="font-medium">{{ option.name }}</span>
              <span v-if="Number(option.price_delta) > 0" class="ml-2 text-xs text-gray-400">
                +{{ getCurrency(option.price_delta) }}
              </span>
            </span>
            <!-- Display only: the row button owns the click (it also lets an optional radio be unchecked) -->
            <Checkbox
              v-if="group.allow_multiple"
              :model-value="isChosen(group.id, option.id)"
              binary
              class="pointer-events-none shrink-0"
              :tabindex="-1"
            />
            <RadioButton
              v-else
              :model-value="isChosen(group.id, option.id)"
              :value="true"
              class="pointer-events-none shrink-0"
              :tabindex="-1"
            />
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="w-full flex items-center gap-4">
        <div class="font-bold text-primary dark:text-primary-400 shrink-0">
          {{ getCurrency(unitPrice) }}
        </div>
        <Button
          label="Tambah ke Keranjang"
          class="w-full"
          :disabled="!isComplete"
          @click="onConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getCurrency } from '@umkm-pos/ui/helpers/utils';
import type { CartOption } from '@/modules/cashier/stores/state.ts';

const props = defineProps<{ product: any }>();
const visibility = defineModel<boolean>('visibility', { required: true });
const emit = defineEmits<{ confirm: [options: CartOption[]] }>();

const groups = computed<any[]>(() => props.product?.product_option_groups ?? []);

// group id -> chosen option ids
const chosen = ref<Record<string, string[]>>({});

// Required single-choice groups start on their first option (e.g. Small), the common case.
watch(visibility, (open) => {
  if (!open) return;
  chosen.value = Object.fromEntries(
    groups.value.map((group) => [
      group.id,
      group.is_required && !group.allow_multiple && group.product_options[0]
        ? [group.product_options[0].id]
        : [],
    ]),
  );
});

const isChosen = (groupId: string, optionId: string) => !!chosen.value[groupId]?.includes(optionId);

const toggle = (group: any, optionId: string) => {
  const current = chosen.value[group.id] ?? [];
  if (current.includes(optionId)) {
    // A required single-choice group must always keep one option selected.
    if (group.is_required && !group.allow_multiple) return;
    chosen.value[group.id] = current.filter((id) => id !== optionId);
  } else {
    chosen.value[group.id] = group.allow_multiple ? [...current, optionId] : [optionId];
  }
};

const selectedOptions = computed<CartOption[]>(() =>
  groups.value.flatMap((group) =>
    group.product_options
      .filter((option: any) => chosen.value[group.id]?.includes(option.id))
      .map((option: any) => ({
        option_id: option.id,
        group_name: group.name,
        name: option.name,
        price_delta: Number(option.price_delta),
      })),
  ),
);

const isComplete = computed(() =>
  groups.value.every((group) => !group.is_required || (chosen.value[group.id]?.length ?? 0) > 0),
);

const unitPrice = computed(
  () => Number(props.product?.price ?? 0) + selectedOptions.value.reduce((sum, option) => sum + option.price_delta, 0),
);

const onConfirm = () => {
  if (!isComplete.value) return;
  emit('confirm', selectedOptions.value);
  visibility.value = false;
};
</script>
