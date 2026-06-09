<template>
  <Dialog
    v-model:visible="visibility"
    modal
    group="headless"
    class="adjust-stock-modal"
  >
    <template #header>
      <h1 class="text-xl font-semibold">
        Adjust Stock
      </h1>
    </template>

    <div class="flex flex-col gap-4">
      <Form
        v-slot="$form"
        :resolver="resolver"
        :initialValues="initialValues"
        class="flex flex-col gap-4 w-full"
        @submit="onFormSubmit"
      >
        <div class="w-full space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UiFormGroup label="Product Name" variant="vertical">
              <div class="text-base font-semibold">
                {{ product?.name || '' }}
              </div>
            </UiFormGroup>
            <UiFormGroup label="Current Stock" variant="vertical">
              <div class="text-base font-semibold">
                {{ product?.stock_qty || 0 }}
              </div>
            </UiFormGroup>
          </div>
          <Divider />
          <UiFormGroup label="Adjustment Type" variant="vertical">
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="method in adjustmentTypeOptions"
                :key="method.value"
                type="button"
                class="rounded-lg border px-2 py-4 text-center transition-all duration-150 cursor-pointer"
                :class="[
                  selectedAdjustmentType === method.value
                    ? 'border-primary bg-primary/10 text-primary dark:border-primary-400 dark:bg-primary-500/20 dark:text-primary-300'
                    : 'border-gray-200 dark:border-dark! bg-white dark:bg-dark! text-gray-400',
                ]"
                @click="onAdjustmentTypeChange(method.value as any)"
              >
                <div class="text-sm font-semibold">{{ method.label }}</div>
              </button>
            </div>
            <Message
              v-if="$form.adjustment_type?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.adjustment_type.error?.message }}
            </Message>
          </UiFormGroup>
          <UiFormGroup label="Change Quantity" variant="vertical">
            <InputNumber
              name="change_qty"
              placeholder="Enter quantity"
              :min="1"
              fluid
            />
            <Message
              v-if="$form.change_qty?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.change_qty.error?.message }}
            </Message>
            <small class="text-gray-500">Quantity is always positive. Type controls add or reduce.</small>
          </UiFormGroup>
          <UiFormGroup label="Reason" variant="vertical">
            <Select
              name="reason"
              :options="reasonOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select reason"
              fluid
            />
            <Message
              v-if="$form.reason?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.reason.error?.message }}
            </Message>
          </UiFormGroup>
        </div>

        <Divider class="my-0!" />

        <div class="flex justify-end gap-4 pb-4">
          <Button
            type="button"
            severity="secondary"
            label="Cancel"
            size="medium"
            class="w-full md:w-[128px]"
            @click="onCancel"
          />
          <Button
            type="submit"
            label="Save"
            size="medium"
            class="w-full md:w-[128px]"
          />
        </div>
      </Form>
    </div>
  </Dialog>
</template>
<script lang="ts" setup>
import type { AdjustStock } from '@/modules/product-lists/services/types';
import { computed, ref } from 'vue';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { showConfirm } from '@/helpers/toast.ts';
import { getOutlet } from '@/helpers/auth.ts';
import UiFormGroup from '@/components/UiFormGroup.vue';

const emits = defineEmits(['submit', 'cancel']);

const props = defineProps<{
  product: any | null,
}>();

const visibility = defineModel<boolean>("visibility", {
  required: true
});

const allReasonOptions = [
  { label: 'Restock', value: 'restock' },
  { label: 'Correction (+)', value: 'correction_plus' },
  { label: 'Stock Opname Adjustment', value: 'opname_adjustment' },
  { label: 'Damage', value: 'damage' },
  { label: 'Expired', value: 'expired' },
  { label: 'Shrinkage', value: 'shrinkage' },
  { label: 'Correction (-)', value: 'correction_minus' },
];

const adjustmentTypeOptions = [
  { label: 'Add Stock', value: 'increase' },
  { label: 'Reduce Stock', value: 'decrease' },
];
const selectedAdjustmentType = ref<'increase' | 'decrease'>('increase');

const reasonOptionsByType = {
  increase: ['restock', 'correction_plus', 'opname_adjustment'],
  decrease: ['damage', 'expired', 'shrinkage', 'correction_minus', 'opname_adjustment'],
} as const;

const reasonOptions = computed(() => {
  const type = selectedAdjustmentType.value;
  if (type === 'increase') {
    return allReasonOptions.filter((item) =>
      reasonOptionsByType.increase.includes(item.value as any),
    );
  }
  if (type === 'decrease') {
    return allReasonOptions.filter((item) =>
      reasonOptionsByType.decrease.includes(item.value as any),
    );
  }
  return [];
});

const onAdjustmentTypeChange = (value: 'increase' | 'decrease') => {
  selectedAdjustmentType.value = value;
};

const initialValues = ref<AdjustStock>({
  outlet_id: '',
  product_id: '',
  adjustment_type: 'increase',
  change_qty: '',
  reason: '',
  note: ''
} as any);

const resolver = ref(zodResolver(
  z.object({
    change_qty: z.number().min(1, { message: 'Quantity must be at least 1.' }),
    reason: z.string().min(1, { message: 'Reason is required.' }),
    note: z.string().optional()
  })
));

const onFormSubmit = (event: any) => {
  const { valid, values = {} } = event as { valid: boolean; values?: any };
  if (valid) {
    const signedQty = selectedAdjustmentType.value === 'decrease'
      ? -Math.abs(values.change_qty)
      : Math.abs(values.change_qty);
    const newStock = (props.product?.stock_qty || 0) + signedQty;
    
    showConfirm({
      header: 'Confirm Stock Adjustment',
      message: `Are you sure you want to adjust stock from ${props.product?.stock_qty || 0} to ${newStock}?`,
      rejectLabel: 'Cancel',
      acceptLabel: 'Confirm',
      type: 'warn',
      accept: () => {
        const payload = {
          outlet_id: getOutlet()?.id || '',
          product_id: props.product?.id,
          change_qty: signedQty,
          reason: values.reason,
          note: values.note || ''
        };
        emits('submit', payload);
      },
    });
  }
};

const onCancel = () => {
  emits('cancel');
};
</script>
<style>
.adjust-stock-modal {
  width: 44rem;
}

.adjust-stock-modal .p-dialog-content {
  padding-bottom: 0 !important;
}
</style>
