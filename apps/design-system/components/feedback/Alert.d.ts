export interface AlertProps {
  /** @startingPoint section="Components" subtitle="Inline banner — info, success, warning, error" viewport="600x100" */
  tone?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}
