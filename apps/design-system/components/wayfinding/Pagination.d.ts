export interface PaginationProps {
  /** @startingPoint section="Components" subtitle="Numbered page nav for tables/lists" viewport="300x60" */
  page?: number;
  totalPages?: number;
  onChange?: (page: number) => void;
}
