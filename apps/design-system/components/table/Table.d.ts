export interface TableColumn { key: string; label: string; align?: 'left' | 'right' | 'center'; mono?: boolean; }
export interface TableProps {
  /** @startingPoint section="Components" subtitle="Dense data table — transactions, stock, orders" viewport="700x320" */
  columns?: TableColumn[];
  rows?: Record<string, React.ReactNode>[];
}
