<template>
  <div class="customer-layout customer-layout--dark">
    <template v-if="isStartRoute">
      <router-view />
    </template>

    <template v-else>
      <nav class="customer-layout__nav">
        <div class="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-3 px-4">
          <template v-if="!isHomeRoute">
            <div class="flex min-w-0 items-center gap-3">
              <Button
                severity="secondary"
                variant="outlined"
                icon="pi pi-arrow-left"
                size="small"
                @click="goBack"
              />
              <h1 class="truncate text-lg font-semibold">{{ pageTitle }}</h1>
            </div>
          </template>

          <template v-else>
            <div class="flex min-w-0 items-center gap-3">
              <img
                v-if="outlet?.logo"
                :src="outlet.logo"
                :alt="outlet?.name"
                class="h-10 w-10 rounded object-cover"
              >
              <div
                v-else
                class="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-primary dark:bg-dark-secondary"
              >
                {{ outletInitial }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-base font-semibold">{{ outlet?.name || 'Customer Catalog' }}</p>
              </div>
            </div>
          </template>

          <div class="flex items-center gap-2">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-dark-secondary dark:text-slate-50">
              {{ customerInitial }}
            </div>
            <Button
              severity="danger"
              variant="outlined"
              icon="pi pi-sign-out"
              size="small"
              @click="resetToStart"
            />
          </div>
        </div>
      </nav>

      <main class="customer-layout__content" :class="contentPaddingClass">
        <Message
          v-if="showShiftClosedMessage"
          severity="warn"
          :closable="false"
          class="mb-4"
        >
          Outlet belum menerima pesanan karena shift kasir belum dibuka.
        </Message>
        <router-view />
      </main>

      <CustomerCartFooter
        v-if="showCartFooter"
        :items="catalogStore.cartItems"
        :total="catalogStore.cartTotal"
        :disabled="!catalogStore.isShiftOpen"
        @open="goTo('customer-catalog-cart')"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { useCatalogStore } from '@/modules/customer-catalog/stores/index.ts';
import CustomerCartFooter from '@/modules/customer-catalog/components/CustomerCartFooter.vue';

const route = useRoute();
const router = useRouter();
const catalogStore = useCatalogStore();
let pollTimer: number | undefined;

const isStartRoute = computed(() => route.name === 'customer-catalog-start');
const isHomeRoute = computed(() => route.name === 'customer-catalog-home');
const outlet = computed(() => catalogStore.session?.outlets || null);
const outletInitial = computed(() => outlet.value?.name?.charAt(0)?.toUpperCase() || 'S');
const customerInitial = computed(() =>
  catalogStore.session?.customer_name?.charAt(0)?.toUpperCase() || 'C',
);
const showCartFooter = computed(() =>
  ['customer-catalog-home', 'customer-catalog-browse'].includes(String(route.name)),
);
const showShiftClosedMessage = computed(() =>
  Boolean(catalogStore.shiftStatus) && !catalogStore.shiftStatusLoading && !catalogStore.isShiftOpen,
);
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'customer-catalog-browse': 'Pilih Menu',
    'customer-catalog-cart': 'Keranjang',
    'customer-catalog-order': 'Detail Pesanan',
  };
  return titles[String(route.name)] || 'Customer Catalog';
});
const contentPaddingClass = computed(() => {
  if (showCartFooter.value) return 'pb-28';
  return '';
});

const goTo = (name: string) => {
  router.push({ name, params: { outletId: route.params.outletId } });
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  goTo('customer-catalog-home');
};

const resetToStart = () => {
  if (pollTimer) {
    window.clearInterval(pollTimer);
    pollTimer = undefined;
  }
  const outletId = route.params.outletId;
  catalogStore.resetSession();
  router.replace({ name: 'customer-catalog-start', params: { outletId } });
};

const initializeSession = async () => {
  if (isStartRoute.value) return;
  if (pollTimer) return;

  if (!catalogStore.hydrateSession()) {
    resetToStart();
    return;
  }

  try {
    await catalogStore.loadSession();
    await catalogStore.refreshShiftStatus(route.params.outletId as string);
    pollTimer = window.setInterval(async () => {
      try {
        const data = await catalogStore.pollSessionStatus();
        if (['closed', 'expired'].includes(data.session_status)) {
          resetToStart();
        }
      } catch (_error) {
        resetToStart();
      }
    }, 8000);
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat sesi.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
    resetToStart();
  }
};

onMounted(initializeSession);

onBeforeUnmount(() => {
  if (pollTimer) window.clearInterval(pollTimer);
});
</script>

<style scoped>
@import "tailwindcss";
@import '@/assets/styles/themes.css';

.customer-layout {
  @apply relative min-h-dvh w-full bg-white text-slate-900 dark:text-slate-50;
}

.customer-layout--dark {
  @apply dark:bg-dark dark:border-dark;
}

.customer-layout__nav {
  @apply sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-white/10 dark:bg-dark;
}

.customer-layout__content {
  @apply mx-auto w-full max-w-4xl px-4 py-4;
}

</style>
