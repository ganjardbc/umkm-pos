export interface SidebarSectionItem { id: string; label: string; }
export interface SidebarSection { title: string; items: SidebarSectionItem[]; }
export interface SidebarProps {
  /** @startingPoint section="Components" subtitle="Dashboard sidebar nav — sections, active state, collapsible" viewport="280x420" */
  sections?: SidebarSection[];
  activeId?: string;
  onSelect?: (id: string) => void;
  collapsed?: boolean;
}
