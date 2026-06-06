<template>
  <div class="w-full mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-4 pb-28">
    <StoreInformations
      :session="session"
      :latest-order="latestOrder"
      :session-status="sessionStatus"
      @reset="resetSession"
    />

    <div class="w-full space-y-4">
      <InputText v-model="search" fluid placeholder="Cari menu..." />
      <div class="flex gap-2 overflow-x-auto pb-1">
        <Button
          :severity="selectedCategory ? 'secondary' : 'contrast'"
          :variant="selectedCategory ? 'outlined' : undefined"
          size="small"
          label="Semua"
          @click="selectedCategory = ''"
        />
        <Button
          v-for="category in categories"
          :key="category.id"
          :label="category.name"
          size="small"
          :severity="selectedCategory === category.id ? 'contrast' : 'secondary'"
          :variant="selectedCategory === category.id ? undefined : 'outlined'"
          @click="selectedCategory = category.id"
        />
      </div>
    </div>

    <div
      v-if="latestOrder && !['closed', 'expired'].includes(sessionStatus)"
      class="rounded-3xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-800"
    >
      Order terakhir kamu sedang diproses dengan status <strong>{{ latestOrder.order_status }}</strong>.
    </div>

    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 pb-28">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @add="handleAddToCart"
      />
    </div>

    <Dialog v-model:visible="showTableDialog" modal header="Pilih Meja" class="w-[92vw] max-w-lg">
      <div class="space-y-3">
        <Dropdown
          v-model="selectedTableId"
          :options="tables"
          optionLabel="name"
          optionValue="id"
          placeholder="Pilih meja"
          class="w-full"
        />
        <Button label="Buat Pesanan" fluid @click="submitOrder" />
      </div>
    </Dialog>

    <CartBar
      :items="catalogStore.cartItems"
      :total="catalogStore.cartTotal"
      @remove="catalogStore.removeFromCart"
      @increment="catalogStore.incrementQuantity"
      @decrement="catalogStore.decrementQuantity"
      @clear="onClearCart"
      @checkout="showTableDialog = true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clearCustomerSession, getCustomerSession } from '@/helpers/customer-session.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { useGlobalLoading } from '@/composables/useGlobalLoading.ts';
import { useCatalogStore } from '../stores/index.ts';
import {
  getCatalogCategories,
  getCatalogProducts,
  getCatalogTables,
  getCustomerSessionMe,
  getCustomerSessionStatus,
  postCatalogOrder,
} from '../services/api.ts';
import StoreInformations from '../components/StoreInformations.vue';
import ProductCard from '../components/ProductCard.vue';
import CartBar from '../components/CartBar.vue';

const route = useRoute();
const router = useRouter();
const outletId = route.params.outletId as string;

const catalogStore = useCatalogStore();

const session = ref<any>(getCustomerSession());
const sessionStatus = ref('active');
const latestOrder = ref<any>(null);
const categories = ref<any[]>([]);
const tables = ref<any[]>([]);
const products = ref<any[]>([]);
const selectedCategory = ref('');
const selectedTableId = ref('');
const search = ref('');
const showTableDialog = ref(false);
const isCheckingOut = ref(false);
let pollTimer: number | undefined;

const filteredProducts = computed(() =>
  products.value.filter((product) => {
    const matchesCategory = !selectedCategory.value || product.category_id === selectedCategory.value;
    const matchesSearch =
      !search.value || product.name.toLowerCase().includes(search.value.toLowerCase());
    return matchesCategory && matchesSearch;
  }),
);

const loadBaseData = async () => {
  const [sessionResponse, categoriesResponse, productsResponse, tablesResponse] =
    await Promise.all([
      getCustomerSessionMe(),
      getCatalogCategories(outletId),
      getCatalogProducts({ outlet_id: outletId, limit: 100 }),
      getCatalogTables(outletId),
    ]);

  session.value = sessionResponse.data?.data || session.value;
  latestOrder.value = session.value?.latest_transaction || null;
  categories.value = categoriesResponse.data?.data || [];
  products.value = productsResponse.data?.data?.data || [];
  tables.value = tablesResponse.data?.data || [];
};

const pollStatus = async () => {
  try {
    const response = await getCustomerSessionStatus();
    const data = response.data?.data || {};
    sessionStatus.value = data.session_status || 'active';
    latestOrder.value = data.latest_transaction || latestOrder.value;

    if (
      ['closed', 'expired'].includes(sessionStatus.value) ||
      latestOrder.value?.order_status === 'selesai'
    ) {
      showToast({
        type: 'info',
        title: 'Sesi selesai.',
        message: 'Pesanan sudah selesai. Silakan scan ulang jika ingin memesan lagi.',
      });
      resetSession();
    }
  } catch (_error) {
    resetSession();
  }
};

const handleAddToCart = (product: any) => {
  if (product.stock_qty <= 0) {
    showToast({
      type: 'warn',
      title: 'Stok habis',
      message: `${product.name} sedang tidak tersedia.`,
    });
    return;
  }
  catalogStore.addToCart(product);
};

const onClearCart = () => {
  showConfirm({
    header: 'Kosongkan Keranjang',
    message: 'Yakin ingin mengosongkan keranjang?',
    rejectLabel: 'Batal',
    acceptLabel: 'Kosongkan',
    type: 'warn',
    accept: () => {
      catalogStore.clearCart();
      showToast({
        type: 'success',
        title: 'Keranjang dikosongkan',
        message: 'Semua item telah dihapus dari keranjang.',
      });
    },
  });
};

const { show: showLoading, hide: hideLoading } = useGlobalLoading();

const submitOrder = async () => {
  try {
    if (isCheckingOut.value) return;

    if (!selectedTableId.value) {
      showToast({ type: 'warn', title: 'Pilih meja dulu.', message: 'Meja wajib dipilih.' });
      return;
    }

    isCheckingOut.value = true;
    showLoading();

    const payload = {
      outlet_id: outletId,
      table_id: selectedTableId.value,
      items: catalogStore.cartItems.map((item) => ({
        product_id: item.id,
        qty: item.quantity,
        customer_note: item.customer_note,
      })),
    };

    const response = await postCatalogOrder(payload);
    latestOrder.value = response.data?.data || null;
    catalogStore.clearCart();
    showTableDialog.value = false;
    selectedTableId.value = '';
    showToast({
      type: 'success',
      title: 'Pesanan dibuat.',
      message: 'Tunggu konfirmasi dari kasir ya.',
    });
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal membuat pesanan.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    isCheckingOut.value = false;
    hideLoading();
  }
};

const resetSession = () => {
  clearCustomerSession();
  router.replace({ name: 'customer-catalog-start', params: { outletId } });
};

watch(selectedCategory, async (value) => {
  const response = await getCatalogProducts({
    outlet_id: outletId,
    category_id: value || undefined,
    search: search.value || undefined,
    limit: 100,
  });
  products.value = response.data?.data?.data || [];
});

watch(search, async (value) => {
  const response = await getCatalogProducts({
    outlet_id: outletId,
    category_id: selectedCategory.value || undefined,
    search: value || undefined,
    limit: 100,
  });
  products.value = response.data?.data?.data || [];
});

onMounted(async () => {
  if (!session.value) {
    resetSession();
    return;
  }

  try {
    await loadBaseData();
    pollTimer = window.setInterval(pollStatus, 8000);
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat katalog.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
    resetSession();
  }
});

onBeforeUnmount(() => {
  if (pollTimer) window.clearInterval(pollTimer);
});
</script>

<style scoped>
@import "tailwindcss";
@import '@/assets/styles/themes.css';

:deep(.p-dialog) {
  @apply dark:bg-slate-900 dark:text-slate-50 dark:border dark:border-white/10;
}

:deep(.p-dialog-header) {
  @apply dark:bg-slate-900 dark:text-slate-50 dark:border-b dark:border-white/10;
}

:deep(.p-dialog-content) {
  @apply dark:bg-slate-900 dark:text-slate-50;
}
</style>
