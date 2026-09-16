export interface TabItem { id: string; label: string; }
export interface TabsProps {
  /** @startingPoint section="Components" subtitle="Underline tabs with active state" viewport="500x80" */
  tabs?: TabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
}
