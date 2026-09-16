export interface BadgeProps {
  /** @startingPoint section="Components" subtitle="Status pills — neutral, brand, success, warning, error, info" viewport="700x120" */
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
  dot?: boolean;
  children: React.ReactNode;
}
