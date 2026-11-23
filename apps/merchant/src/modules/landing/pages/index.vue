<template>
  <div class="w-full md:max-w-3xl mx-auto min-h-[70vh] flex flex-col items-center justify-center py-8 px-4">
    <router-link to="/" class="flex items-center mb-4">
      <Image :src="defaultLogo" alt="Image" class="w-58" />
    </router-link>
    <div class="w-full text-lg text-gray-400 text-center">
      The simple point of sale for UMKM.
    </div>

    <div v-if="steps.length > 0" class="w-full mt-8 space-y-3">
      <h2 class="text-base font-semibold text-center">
        Langkah awal
      </h2>
      <UiCard
        v-for="(step, index) in steps"
        :key="step.to"
      >
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 shrink-0 rounded-full bg-primary-50 dark:bg-primary-900 text-primary-500 dark:text-primary-400 font-bold flex items-center justify-center">
            {{ index + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold">
              {{ step.title }}
            </div>
            <div class="text-sm text-gray-400">
              {{ step.description }}
            </div>
          </div>
          <Button
            :label="step.action"
            size="small"
            @click="router.push(step.to)"
          />
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import defaultLogo from '@/assets/insell-logo.png';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import { isHasPermission } from '@/helpers/auth.ts';
import { CREATE as PRODUCT_CREATE } from '@/modules/product-lists/services/rbac.ts';
import { CREATE as USER_CREATE } from '@/modules/user/services/rbac.ts';
import { CREATE as TRANSACTION_CREATE } from '@/modules/cashier/services/rbac.ts';
import { PREFIX_ROUTE_PATH as PRP_PRODUCT } from '@/modules/product-lists/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_USER } from '@/modules/user/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_CASHIER } from '@/modules/cashier/services/constants.ts';

const router = useRouter();

// Only steps the signed-in role can actually perform are listed.
const steps = computed(() => [
  {
    permission: PRODUCT_CREATE,
    title: 'Tambah produk pertama',
    description: 'Isi nama, harga, dan stok awal. Stok bisa diubah kapan saja.',
    action: 'Tambah Produk',
    to: `${PRP_PRODUCT}/create`,
  },
  {
    permission: USER_CREATE,
    title: 'Tambah staf',
    description: 'Buat akun kasir dan atur perannya per outlet.',
    action: 'Tambah Staf',
    to: `${PRP_USER}/create`,
  },
  {
    permission: TRANSACTION_CREATE,
    title: 'Buat transaksi pertama',
    description: 'Buka kasir, pilih produk, lalu bayar.',
    action: 'Buka Kasir',
    to: PRP_CASHIER,
  },
].filter((step) => isHasPermission(step.permission)));
</script>

<style scoped></style>
