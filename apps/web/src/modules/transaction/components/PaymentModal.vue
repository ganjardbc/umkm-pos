<template>
  <Dialog
    v-model:visible="visibility"
    modal
    :class="{
      'w-full': true,
      'max-w-md': !isPaymentMethodCash,
      'max-w-4xl': isPaymentMethodCash,
    }"
    header="Continue Payment"
  >
    <div class="space-y-4">
      <UiFormGroup label="Payment Method" variant="vertical">
        <Select
          v-model="payment_method"
          :options="paymentMethods"
          option-label="label"
          option-value="value"
          placeholder="Select Payment Method"
          fluid
        />
      </UiFormGroup>

      <div v-if="!isPaymentMethodCash" class="flex items-center justify-between p-3 bg-gray-100 dark:bg-dark! rounded-lg">
        <span class="text-sm text-gray-700 dark:text-gray-300">Total Payment</span>
        <span class="text-base font-semibold text-primary dark:text-primary-400">{{ getCurrency(totalAmount) }}</span>
      </div>

      <div v-if="isPaymentMethodCash" class="w-full grid md:grid-cols-[1fr_260px] gap-5">
        <div class="flex-1 space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-dark! rounded-lg">
            <span class="text-sm text-gray-700 dark:text-gray-300">Total Payment</span>
            <span class="text-base font-semibold text-primary dark:text-primary-400">{{ getCurrency(totalAmount) }}</span>
          </div>

          <UiFormGroup label="Cash Received" variant="vertical">
            <InputNumber
              v-model="cashAmount"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              :min="0"
              fluid
              placeholder="Input cash amount"
            />
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="bill in cashBills"
                :key="bill"
                size="small"
                severity="secondary"
                variant="outlined"
                rounded
                class="text-xs"
                :label="`+Rp${bill.toLocaleString('id-ID')}`"
                @click="addBill(bill)"
              />
            </div>
          </UiFormGroup>

          <div class="p-3 bg-gray-100 dark:bg-dark! rounded-lg">
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold text-gray-700 dark:text-gray-300">Change</span>
              <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ getCurrency(changeAmount) }}</span>
            </div>
          </div>
        </div>

        <div class="flex-1 h-full grid grid-cols-3 gap-2">
          <Button
            v-for="key in calculatorKeys"
            :key="key"
            size="large"
            severity="secondary"
            variant="outlined"
            :label="key"
            @click="onCalculatorInput(key)"
          />
          <Button
            size="medium"
            severity="warning"
            label="DEL"
            @click="onCalculatorDelete"
          />
          <Button
            size="medium"
            severity="danger"
            label="C"
            @click="onCalculatorClear"
          />
        </div>
      </div>

      <UiFormGroup label="Order Type" variant="vertical">
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-700 dark:text-gray-300">Is Offline Order?</label>
        <InputSwitch
          v-model="is_offline"
          :binary="true"
        />
        </div>
      </UiFormGroup>

      <div v-if="!isPaymentMethodCash" class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-600 dark:text-gray-300">
        <span v-if="payment_method === 'debit'">Proceed with debit card confirmation at cashier terminal.</span>
        <span v-else-if="payment_method === 'credit'">Proceed with credit card confirmation and signature if required.</span>
        <span v-else-if="payment_method === 'e-wallet'">Ask customer to complete e-wallet payment from their app.</span>
        <span v-else-if="payment_method === 'qris'">Display QRIS code to customer and confirm incoming payment.</span>
      </div>
    </div>

    <Divider />
    
    <template #footer>
      <div class="w-full flex gap-2 pt-4">
        <Button
          label="Back"
          severity="secondary"
          variant="outlined"
          class="w-full"
          @click="visibility = false"
        />
        <Button
          label="Checkout"
          class="w-full"
          :disabled="isCashInsufficient"
          @click="onConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getCurrency } from '@/helpers/utils.ts';
import { showConfirm } from '@/helpers/toast.ts';
import UiFormGroup from '@/components/UiFormGroup.vue';

const visibility = defineModel<boolean>('visibility', { required: true });

const payment_method = defineModel<string>('paymentMethod', { required: true });
const is_offline = defineModel<boolean>('isOffline', { required: true });
const cashAmount = defineModel<number>('cashAmount', { required: true });

const props = defineProps<{
  totalAmount: number;
}>();

const emit = defineEmits<{
  confirm: [];
}>();

const paymentMethods = ref([
  { label: 'Cash', value: 'cash' },
  { label: 'Debit Card', value: 'debit' },
  { label: 'Credit Card', value: 'credit' },
  { label: 'E-Wallet', value: 'e-wallet' },
  { label: 'QRIS', value: 'qris' },
]);

const cashBills = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
const calculatorKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '000', '0', '00'];
const calculatorBuffer = ref('0');
const changeAmount = computed(() => Math.max(0, Number(cashAmount.value || 0) - props.totalAmount));
const isPaymentMethodCash = computed(() => payment_method.value === 'cash');
const isCashInsufficient = computed(() => isPaymentMethodCash.value && Number(cashAmount.value || 0) < props.totalAmount);

const addBill = (value: number) => {
  const next = Number(cashAmount.value || 0) + value;
  cashAmount.value = next;
  calculatorBuffer.value = String(Math.floor(next));
};

const onConfirm = () => {
  if (isCashInsufficient.value) return;

  showConfirm({
    header: 'Confirm Payment',
    message: 'Are you sure you want to proceed with this payment?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Confirm',
    type: 'info',
    accept: () => {
      emit('confirm');
    },
  });
};

const syncCalculatorToAmount = () => {
  cashAmount.value = Number(calculatorBuffer.value || '0');
};

const onCalculatorInput = (value: string) => {
  calculatorBuffer.value = calculatorBuffer.value === '0' ? value : calculatorBuffer.value + value;
  syncCalculatorToAmount();
};

const onCalculatorDelete = () => {
  calculatorBuffer.value = calculatorBuffer.value.length > 1
    ? calculatorBuffer.value.slice(0, -1)
    : '0';
  syncCalculatorToAmount();
};

const onCalculatorClear = () => {
  calculatorBuffer.value = '0';
  syncCalculatorToAmount();
};

watch(cashAmount, (newVal: number | null) => {
  const safeValue = Math.max(0, Number(newVal || 0));
  if (safeValue !== Number(newVal || 0)) {
    cashAmount.value = safeValue;
    return;
  }
  calculatorBuffer.value = String(Math.floor(safeValue));
});

watch(payment_method, (method) => {
  if (method !== 'cash') {
    onCalculatorClear();
  }
});
</script>
