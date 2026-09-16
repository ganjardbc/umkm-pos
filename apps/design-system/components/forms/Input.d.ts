export interface InputProps {
  /** @startingPoint section="Components" subtitle="Label, hint, error, prefix icon states" viewport="700x260" */
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  disabled?: boolean;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
