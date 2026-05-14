import { useGlobalLoading } from '@/composables/useGlobalLoading';

const { show, hide } = useGlobalLoading();
export const showLoading = show;
export const hideLoading = hide;
