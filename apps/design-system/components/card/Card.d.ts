export interface CardProps {
  /** @startingPoint section="Components" subtitle="Header + body + optional footer container" viewport="700x260" */
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: string;
  children: React.ReactNode;
}
