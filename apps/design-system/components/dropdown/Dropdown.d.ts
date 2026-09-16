export interface DropdownItem { id: string; label: string; danger?: boolean; }
export interface DropdownProps {
  /** @startingPoint section="Components" subtitle="Click-to-open menu, closes on outside click" viewport="400x180" */
  trigger: React.ReactNode;
  items?: DropdownItem[];
  onSelect?: (id: string) => void;
}
