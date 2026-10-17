import { ref } from 'vue';
import { getErrorMessage, useDebounce } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import { getMerchantOptions } from '@/modules/merchants/services/api.ts';

export interface MerchantOption {
  id: string;
  name: string;
  slug: string;
}

/**
 * Merchant dropdown options for forms and filters (outlet, user).
 */
export const useMerchantOptions = () => {
  const merchantOptions = ref<MerchantOption[]>([]);
  const loadingMerchants = ref(false);

  const fetchMerchantOptions = async (search?: string) => {
    try {
      loadingMerchants.value = true;
      const response = await getMerchantOptions(search ? { search } : undefined);
      const data = response?.data?.data;

      merchantOptions.value = Array.isArray(data) ? data : [];
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

  const onFilterMerchants = useDebounce((event: { value?: string }) => {
    fetchMerchantOptions(event?.value || undefined);
  }, 300);

  return {
    merchantOptions,
    loadingMerchants,
    fetchMerchantOptions,
    onFilterMerchants,
  };
};
