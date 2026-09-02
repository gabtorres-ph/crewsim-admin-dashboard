import { useEffect, useState } from 'react'
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/react'
import type {
  ColumnFiltersState,
  ColumnDef,
  FilterFn,
  PaginationState,
  RowData,
  SortingState,
  TableFeatures,
} from '@tanstack/react-table'
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  flexRender,
  useTable,
} from '@tanstack/react-table'

import { cx, focusRing } from '../../lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from './Table'
import { Input } from './Input'
import { SelectNative } from './SelectNative'
import { Button } from './Button'

// TanStack Table v9 registers state capabilities and row-model factories as
// features rather than passing v8-style `get*RowModel` options to the hook.
// Keep this stable at module scope so the table instance is not recreated.
const dataTableFeatures = tableFeatures({
  // This supplies the visible-column APIs used by headers and row cells; it
  // does not add a user-facing column-visibility control.
  columnVisibilityFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})

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
 * within `DataTable`; consumers may provide an initial sort but do not
 * maintain table state. Exactly one column can be sorted at a time, using
 * TanStack's normal ascending then descending header-click cycle, while
 * non-sortable headers remain plain text. The default page size is 10, and
 * the only available page sizes are 10, 25, and 50. A search, select-filter,
 * sort, page-size, or source-data change resets pagination to page 1. Result
 * counts are calculated after search and column filters but before pagination.
 *
 * This initial client-side version intentionally excludes URL synchronization,
 * persisted preferences, server-side pagination, multi-sort, row selection,
 * column visibility, and virtualization.
 */
export type DataTableProps<TData extends RowData> = {
  data: TData[]
  columns: ColumnDef<TableFeatures, TData, unknown>[]
  getRowId: (row: TData, index: number) => string
  /** Sets the first rendered sort while keeping sorting uncontrolled here. */
  initialSorting?: SortingState
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
 * Owns the shared client-side row-model pipeline, search/filter toolbar, and
 * pagination controls, including source-empty and filtered-empty states.
 */
export function DataTable<TData extends RowData>(
  {
    data,
    columns,
    getRowId,
    initialSorting = [],
    search,
    filters = [],
    emptyState,
    className,
  }: DataTableProps<TData>,
) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Loaded collections can change after mutations. Starting at the first page
  // prevents a now-invalid later page from rendering after a deletion.
  useEffect(() => {
    setPagination((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    )
  }, [data])

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    state: {
      globalFilter,
      columnFilters,
      sorting,
      pagination,
    },
    onGlobalFilterChange: (updater) => {
      setGlobalFilter(updater)
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater)
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    },
    onSortingChange: (updater) => {
      setSorting(updater)
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    },
    onPaginationChange: setPagination,
    globalFilterFn: search.filterFn,
    enableMultiSort: false,
  })

  const filteredRowCount = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const emptyMessage =
    data.length === 0
      ? emptyState.noData
      : filteredRowCount === 0
        ? emptyState.noResults
        : null
  const visibleColumnCount = Math.max(table.getVisibleLeafColumns().length, 1)

  return (
    <div
      className={cx(
        'overflow-hidden rounded-lg border border-gray-800 bg-gray-950 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-gray-800 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <Input
          type="search"
          value={globalFilter}
          placeholder={search.placeholder}
          aria-label={search.label}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="w-full sm:max-w-sm"
        />
        {filters.map((filter) => {
          const column = table.getColumn(filter.columnId)

          // A page may temporarily pass a filter before its matching column is
          // added. Avoid presenting a control that cannot affect the table.
          if (!column) {
            return null
          }

          const selectId = `data-table-filter-${filter.columnId}`
          const filterValue = column.getFilterValue()

          return (
            <label key={filter.columnId} htmlFor={selectId} className="grid gap-1">
              <span className="text-sm font-medium text-gray-200">
                {filter.label}
              </span>
              <SelectNative
                id={selectId}
                value={typeof filterValue === 'string' ? filterValue : ''}
                onChange={(event) =>
                  column.setFilterValue(event.target.value || undefined)
                }
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectNative>
            </label>
          )
        })}
      </div>
      <TableRoot>
        <Table className="border-b-0">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDirection = header.column.getIsSorted()
                  const SortIcon =
                    sortDirection === 'asc'
                      ? RiArrowUpSLine
                      : RiArrowDownSLine

                  return (
                    <TableHeaderCell
                      key={header.id}
                      colSpan={header.colSpan}
                      aria-sort={
                        canSort
                          ? sortDirection === 'asc'
                            ? 'ascending'
                            : sortDirection === 'desc'
                              ? 'descending'
                              : 'none'
                          : undefined
                      }
                    >
                      {!header.isPlaceholder &&
                        (canSort ? (
                          <button
                            type="button"
                            className={cx(
                              '-m-1 inline-flex items-center gap-1 rounded-sm p-1 text-gray-400 transition-colors hover:text-gray-50',
                              focusRing,
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {sortDirection && (
                              <SortIcon
                                className="size-4 text-blue-400"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        ))}
                    </TableHeaderCell>
                  )
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {emptyMessage ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnCount}
                  className="py-12 text-center text-gray-400"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableRoot>
      <div className="flex flex-col gap-3 border-t border-gray-800 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-gray-400">
          {filteredRowCount} {filteredRowCount === 1 ? 'result' : 'results'}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <span>Rows per page</span>
            <SelectNative
              value={String(pagination.pageSize)}
              onChange={(event) => {
                table.setPageSize(Number(event.target.value))
                table.setPageIndex(0)
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </SelectNative>
          </label>
          <span className="text-sm text-gray-400" aria-live="polite">
            {pageCount > 0
              ? `Page ${pagination.pageIndex + 1} of ${pageCount}`
              : 'No pages'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
