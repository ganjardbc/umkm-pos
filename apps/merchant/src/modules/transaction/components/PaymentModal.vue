<template>
  <Dialog
    v-model:visible="visibility"
    modal
    :class="{
      'w-full': true,
      'max-w-4xl': true,
    }"
    header="Lanjut ke Pembayaran"
  >
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
      <button
        v-for="method in paymentMethods"
        :key="method.value"
        type="button"
        class="rounded-lg border px-2 py-4 text-center transition-all duration-150 cursor-pointer"
        :class="[
          payment_method === method.value
            ? 'border-primary bg-primary/10 text-primary dark:border-primary-400 dark:bg-primary-500/20 dark:text-primary-300'
            : 'border-gray-200 dark:border-dark! bg-white dark:bg-dark! text-gray-400',
        ]"
        @click="payment_method = method.value"
      >
        <div class="text-sm font-semibold">{{ method.label }}</div>
      </button>
    </div>

    <Divider />

    <div class="space-y-4 min-h-86">
      <UiFormGroup v-if="allowDiscount" label="Diskon" variant="vertical">
        <div class="flex gap-2">
          <Button
            size="small"
            label="Rp"
            :variant="discountType === 'amount' ? undefined : 'outlined'"
            @click="toggleDiscountType('amount')"
          />
          <Button
            size="small"
            label="%"
            :variant="discountType === 'percent' ? undefined : 'outlined'"
            @click="toggleDiscountType('percent')"
          />
          <InputNumber
            v-model="discountValue"
            :mode="discountType === 'amount' ? 'currency' : 'decimal'"
            currency="IDR"
            locale="id-ID"
            :suffix="discountType === 'percent' ? '%' : undefined"
            :min="0"
            :max="discountType === 'percent' ? 100 : totalAmount"
            :disabled="!discountType"
            :placeholder="discountType ? 'Nilai diskon' : 'Pilih Rp atau %'"
            fluid
          />
        </div>
        <div v-if="discountAmount > 0" class="text-xs text-gray-500">
          Subtotal {{ getCurrency(totalAmount) }}, diskon -{{ getCurrency(discountAmount) }}
        </div>
      </UiFormGroup>

      <div v-if="!isPaymentMethodCash" class="flex items-center justify-between p-3 bg-gray-100 dark:bg-dark! rounded-lg">
        <span class="text-sm text-gray-700 dark:text-gray-300">Total Pembayaran</span>
        <span class="text-base font-semibold text-primary dark:text-primary-400">{{ getCurrency(payableAmount) }}</span>
      </div>

      <div v-if="isPaymentMethodCash" class="w-full grid md:grid-cols-[1fr_260px] gap-5">
        <div class="flex-1 space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-dark! rounded-lg">
            <span class="text-sm text-gray-700 dark:text-gray-300">Total Pembayaran</span>
            <span class="text-base font-semibold text-primary dark:text-primary-400">{{ getCurrency(payableAmount) }}</span>
          </div>

          <UiFormGroup label="Uang Tunai Diterima" variant="vertical">
            <InputNumber
              v-model="cashAmount"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              :min="0"
              fluid
              placeholder="Masukkan nominal uang tunai"
            />
            <div class="flex flex-wrap gap-2">
              <Button
                size="small"
                rounded
                class="text-xs"
                label="Uang Pas"
                @click="setExactAmount"
              />
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
              <span class="font-semibold text-gray-700 dark:text-gray-300">Kembalian</span>
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

      <UiFormGroup label="Mode Pesanan" variant="vertical">
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-700 dark:text-gray-300">Pesanan Offline?</label>
        <InputSwitch
          v-model="is_offline"
          :binary="true"
        />
        </div>
      </UiFormGroup>

      <div v-if="!isPaymentMethodCash" class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-600 dark:text-gray-300">
        <span v-if="payment_method === 'debit'">Lakukan konfirmasi kartu debit di mesin EDC kasir.</span>
        <span v-else-if="payment_method === 'credit'">Lakukan konfirmasi kartu kredit dan tanda tangan jika diperlukan.</span>
        <span v-else-if="payment_method === 'e-wallet'">Minta pelanggan menyelesaikan pembayaran e-wallet dari aplikasinya.</span>
        <span v-else-if="payment_method === 'qris'">Tampilkan QR code QRIS kepada pelanggan dan konfirmasi pembayaran masuk.</span>
      </div>
    </div>

    <Divider class="mb-0!" />

    <template #footer>
      <div class="w-full flex gap-4">
        <Button
          label="Kembali"
          severity="secondary"
          variant="outlined"
          class="w-full"
          @click="visibility = false"
        />
        <Button
          label="Bayar Sekarang"
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
import { getCurrency } from '@umkm-pos/ui/helpers/utils';
import UiFormGroup from '@umkm-pos/ui/components/UiFormGroup.vue';
import { calcDiscountAmount, type DiscountType } from '@/modules/transaction/utils/discount.ts';

const visibility = defineModel<boolean>('visibility', { required: true });

const payment_method = defineModel<string>('paymentMethod', { required: true });
const is_offline = defineModel<boolean>('isOffline', { required: true });
const cashAmount = defineModel<number>('cashAmount', { required: true });
const discountType = defineModel<DiscountType | ''>('discountType', { default: '' });
const discountValue = defineModel<number | null>('discountValue', { default: null });

const props = defineProps<{
  totalAmount: number;
  allowDiscount?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
}>();

const paymentMethods = ref([
  { label: 'Tunai', value: 'cash', description: 'Bayar dengan uang tunai' },
  { label: 'Kartu Debit', value: 'debit', description: 'Gunakan mesin EDC debit' },
  { label: 'E-Wallet', value: 'e-wallet', description: 'Pelanggan membayar melalui aplikasi e-wallet' },
  { label: 'QRIS', value: 'qris', description: 'Pindai dan bayar menggunakan QRIS' },
]);

const cashBills = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
const calculatorKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '000', '0', '00'];
const calculatorBuffer = ref('0');
const discountAmount = computed(() =>
  props.allowDiscount ? calcDiscountAmount(props.totalAmount, discountType.value, discountValue.value) : 0,
);
const payableAmount = computed(() => props.totalAmount - discountAmount.value);
const changeAmount = computed(() => Math.max(0, Number(cashAmount.value || 0) - payableAmount.value));
const isPaymentMethodCash = computed(() => payment_method.value === 'cash');
const isCashInsufficient = computed(() => isPaymentMethodCash.value && Number(cashAmount.value || 0) < payableAmount.value);

const addBill = (value: number) => {
  const next = Number(cashAmount.value || 0) + value;
  cashAmount.value = next;
  calculatorBuffer.value = String(Math.floor(next));
};

const setExactAmount = () => {
  cashAmount.value = payableAmount.value;
  calculatorBuffer.value = String(Math.floor(payableAmount.value));
};

const toggleDiscountType = (type: DiscountType) => {
  discountType.value = discountType.value === type ? '' : type;
  discountValue.value = null;
};

// "Bayar Sekarang" is already the explicit confirmation; no second dialog.
const onConfirm = () => {
  if (isCashInsufficient.value) return;
  emit('confirm');
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
