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
          <UiFormGroup label="Change Quantity" variant="vertical">
            <InputNumber
              name="change_qty"
              placeholder="Enter positive or negative number"
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
            <small class="text-gray-500">Use positive numbers to add stock, negative to reduce</small>
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
import { ref } from 'vue';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { showConfirm } from '@/helpers/toast.ts';
import UiFormGroup from '@/components/UiFormGroup.vue';

const emits = defineEmits(['submit', 'cancel']);

const props = defineProps<{
  product: any | null,
}>();

const visibility = defineModel<boolean>("visibility", {
  required: true
});

const reasonOptions = [
  { label: 'Restock', value: 'restock' },
  { label: 'Damage', value: 'damage' },
  { label: 'Correction', value: 'correction' },
  { label: 'Manual', value: 'manual' },
];

const initialValues = ref<AdjustStock>({
  product_id: '',
  change_qty: 0,
  reason: '',
  note: ''
});

const resolver = ref(zodResolver(
  z.object({
    change_qty: z.number().refine((val) => val !== 0, {
      message: 'Change quantity cannot be zero.'
    }),
    reason: z.string().min(1, { message: 'Reason is required.' }),
    note: z.string().optional()
  })
));

const onFormSubmit = ({ valid, values }: { valid: boolean; values: AdjustStock }) => {
  if (valid) {
    const newStock = (props.product?.stock_qty || 0) + values.change_qty;
    
    showConfirm({
      header: 'Confirm Stock Adjustment',
      message: `Are you sure you want to adjust stock from ${props.product?.stock_qty || 0} to ${newStock}?`,
      rejectLabel: 'Cancel',
      acceptLabel: 'Confirm',
      type: 'warn',
      accept: () => {
        const payload = {
          product_id: props.product?.id,
          change_qty: values.change_qty,
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
