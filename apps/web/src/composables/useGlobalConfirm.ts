import { ref } from 'vue';

export interface ShowConfirmParams {
  message?: string;
  header: string;
  rejectLabel?: string;
  acceptLabel?: string;
  icon?: string;
  type?: 'info' | 'warn' | 'danger' | 'success';
  position?: string;
  accept?: () => void;
  reject?: () => void;
}

interface ConfirmQueueItem {
  group: string;
  message?: string;
  header: string;
  icon?: string;
  type: string;
  position: string;
  rejectProps: {
    label: string;
    severity: string;
    outlined: boolean;
    fluid: boolean;
  };
  acceptProps: {
    label: string;
    severity: string;
    outlined: boolean;
    fluid: boolean;
  };
  accept: () => void;
  reject: () => void;
}

const confirmQueue = ref<ConfirmQueueItem[]>([]);

export function useGlobalConfirm() {
  const showConfirm = ({
    message,
    header,
    rejectLabel = 'Batal',
    acceptLabel = 'Ok, Lanjutkan',
    icon,
    type = 'info',
    position = 'center',
    accept = () => {},
    reject = () => {},
  }: ShowConfirmParams) => {
    confirmQueue.value.push({
      group: 'headless',
      message,
      header,
      icon,
      type,
      position,
      rejectProps: {
        label: rejectLabel,
        severity: 'secondary',
        outlined: true,
        fluid: true,
      },
      acceptProps: {
        label: acceptLabel,
        severity: 'primary',
        outlined: true,
        fluid: true,
      },
      accept,
      reject,
    });
  };

  return {
    confirmQueue,
    showConfirm,
  };
}
