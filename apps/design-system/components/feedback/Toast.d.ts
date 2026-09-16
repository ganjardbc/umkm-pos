export interface ToastProps {
  /** @startingPoint section="Components" subtitle="Transient bottom/corner notification" viewport="320x80" */
  tone?: 'success' | 'warning' | 'error';
  message: string;
  onClose?: () => void;
}
