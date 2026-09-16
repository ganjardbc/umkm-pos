export interface StatCardProps {
  /** @startingPoint section="Components" subtitle="Dashboard KPI widget — sales summary, top products" viewport="260x160" */
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'success' | 'error';
  icon?: React.ReactNode;
}
