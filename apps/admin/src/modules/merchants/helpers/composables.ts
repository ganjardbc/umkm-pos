import { ref } from 'vue';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import { getListMerchants } from '@/modules/merchants/services/api.ts';

export interface MerchantOption {
  id: string;
  name: string;
  slug: string;
}

// API caps page size at 100.
const MERCHANT_OPTIONS_LIMIT = 100;

/**
 * Merchant dropdown options for forms and filters (outlet, user).
 */
export const useMerchantOptions = () => {
  const merchantOptions = ref<MerchantOption[]>([]);
  const loadingMerchants = ref(false);

  const fetchMerchantOptions = async () => {
    try {
      loadingMerchants.value = true;
      const response = await getListMerchants({ page: 1, limit: MERCHANT_OPTIONS_LIMIT });
      const { data } = response?.data?.data || {};

      merchantOptions.value = data || [];
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Gagal memuat merchant.',
        message: getErrorMessage(error) || 'Terjadi kesalahan.',
      });
    } finally {
      loadingMerchants.value = false;
    }
  };

  return {
    merchantOptions,
    loadingMerchants,
    fetchMerchantOptions,
  };
};
