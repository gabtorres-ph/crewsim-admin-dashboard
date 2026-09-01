import type {
  ColumnDef,
  FilterFn,
  RowData,
  TableFeatures,
} from '@tanstack/react-table'

/**
 * A domain-provided select filter that targets a column by its explicit ID.
 * An empty value represents the unfiltered "All" option.
 */
export type DataTableSelectFilter = {
  columnId: string
  label: string
  options: Array<{ label: string; value: string }>
}

/**
 * The generic, client-side data-table contract.
 *
 * `data` is the complete already-loaded record collection. Consumers provide
 * all domain presentation through TanStack column definitions and must supply
 * a persisted row ID rather than relying on an array index.
 */
export type DataTableProps<TData extends RowData> = {
  data: TData[]
  columns: ColumnDef<TableFeatures, TData, unknown>[]
  getRowId: (row: TData, index: number) => string
  search: {
    label: string
    placeholder: string
    filterFn: FilterFn<TableFeatures, TData>
  }
  filters?: DataTableSelectFilter[]
  emptyState: {
    noData: string
    noResults: string
  }
  /** Applies only to the outer table card. */
  className?: string
}

/**
 * Placeholder for the shared table behavior introduced in the next plan step.
 * The interface is intentionally established before any rendering or state is
 * implemented, so current page tables remain unchanged.
 */
export function DataTable<TData extends RowData>(
  _props: DataTableProps<TData>,
) {
  return null
}
