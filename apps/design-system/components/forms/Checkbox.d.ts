export interface CheckboxProps {
  /** @startingPoint section="Components" subtitle="Custom checkbox, checked/unchecked/disabled" viewport="700x140" */
  label?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}
