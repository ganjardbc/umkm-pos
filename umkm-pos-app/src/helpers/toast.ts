import { useGlobalToast } from '@/composables/useGlobalToast';
import { useGlobalConfirm } from '@/composables/useGlobalConfirm';
import type { ShowToastParams } from '@/composables/useGlobalToast';
import type { ShowConfirmParams } from '@/composables/useGlobalConfirm';

const { showToast: globalShowToast } = useGlobalToast();
const { showConfirm: globalShowConfirm } = useGlobalConfirm();

export const showToast = (params: ShowToastParams) => {
  globalShowToast(params);
};

export const showConfirm = (params: ShowConfirmParams) => {
  globalShowConfirm(params);
};
