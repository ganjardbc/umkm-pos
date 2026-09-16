export interface ModalProps {
  /** @startingPoint section="Components" subtitle="Overlay dialog with header, body, footer actions" viewport="500x320" */
  open: boolean;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
}
