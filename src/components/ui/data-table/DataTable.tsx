"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/Table"
import { cx } from "@/lib/utils"
import * as React from "react"

import {
  DataTableBulkActions,
  DataTableBulkEditor,
} from "./DataTableBulkEditor"
import { DataTableToolbarConfig, Filterbar } from "./DataTableFilterbar"
import { DataTablePagination } from "./DataTablePagination"

import {
  ColumnDef,
  TableOptions,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  pageSize?: number
  getRowId?: TableOptions<TData>["getRowId"]
  emptyMessage?: string
  toolbar?: DataTableToolbarConfig
  enableRowSelection?: boolean
  bulkActions?: DataTableBulkActions<TData>
}

export function DataTable<TData>({
  columns,
  data,
  pageSize = 20,
  getRowId,
  emptyMessage = "No results.",
  toolbar,
  enableRowSelection = false,
  bulkActions,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      rowSelection,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
    enableRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <div className="space-y-3">
        {toolbar && <Filterbar table={table} config={toolbar} />}
        <div className="relative overflow-hidden overflow-x-auto">
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-y border-gray-200 dark:border-gray-800"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHeaderCell
                      key={header.id}
                      className={cx(
                        header.column.columnDef.meta?.className,
                        "whitespace-nowrap py-1 text-left text-sm sm:text-xs",
                      )}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={
                      enableRowSelection
                        ? () => row.toggleSelected(!row.getIsSelected())
                        : undefined
                    }
                    className={cx(
                      "group hover:bg-gray-50 hover:dark:bg-gray-900",
                      enableRowSelection && "cursor-pointer select-none",
                    )}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={cx(
                          row.getIsSelected()
                            ? "bg-gray-50 dark:bg-gray-900"
                            : "",
                          enableRowSelection && "first:w-10",
                          cell.column.columnDef.meta?.className,
                          "relative whitespace-nowrap py-1 text-left text-gray-600 dark:text-gray-400",
                        )}
                      >
                        {index === 0 && row.getIsSelected() && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600 dark:bg-indigo-500" />
                        )}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-left"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {enableRowSelection && bulkActions && (
            <DataTableBulkEditor
              table={table}
              rowSelection={rowSelection}
              actions={bulkActions}
            />
          )}
        </div>
        <DataTablePagination
          table={table}
          pageSize={pageSize}
          showSelectionCount={enableRowSelection}
        />
      </div>
    </>
  )
}
