import type {
  ColumnDef,
  FilterFn,
  RowData,
  TableFeatures,
} from '@tanstack/react-table'

/**
 * A domain-provided select filter that targets a TanStack column by its
 * explicit ID. An empty value represents the unfiltered "All" option; the
 * component deliberately does not infer domain values or labels.
 */
export type DataTableSelectFilter = {
  columnId: string
  label: string
  options: Array<{ label: string; value: string }>
}

/**
 * The generic, client-side data-table contract.
 *
 * `data` is the complete, already-loaded client-side record collection; this
 * component never fetches data or calls an API. Consumers provide all domain
 * presentation, accessors, sorting rules, and action cells through TanStack
 * column definitions. Action columns must opt out of sorting and column
 * filtering with `enableSorting: false` and `enableColumnFilter: false`.
 *
 * A persisted row ID is required so both React and TanStack avoid array-index
 * identity. `search.filterFn` is domain-defined to preserve search coverage
 * for values that may not be rendered in a column. It returns whether a row
 * matches the normalized search value supplied by the table.
 *
 * Initial table-state policy (implemented in Step 2): state is uncontrolled
 * within `DataTable`; pages supply only data and column definitions. Exactly
 * one column can be sorted at a time, using TanStack's normal ascending then
 * descending header-click cycle, while non-sortable headers remain plain text.
 * The default page size is 10, and the only available page sizes are 10, 25,
 * and 50. A search, select-filter, sort, page-size, or source-data change
 * resets pagination to page 1. Result counts are calculated after search and
 * column filters but before pagination.
 *
 * This initial client-side version intentionally excludes URL synchronization,
 * persisted preferences, server-side pagination, multi-sort, row selection,
 * column visibility, and virtualization.
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
