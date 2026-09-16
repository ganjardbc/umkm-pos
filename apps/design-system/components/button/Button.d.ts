export interface ButtonProps {
  /** @startingPoint section="Components" subtitle="Primary, secondary, ghost, danger — 3 sizes" viewport="700x220" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}
