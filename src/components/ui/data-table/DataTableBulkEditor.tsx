"use client"

import {
  CommandBar,
  CommandBarBar,
  CommandBarCommand,
  CommandBarSeperator,
  CommandBarValue,
} from "@/components/CommandBar"
import { RowSelectionState, Table } from "@tanstack/react-table"

export type DataTableBulkActions<TData> = {
  onEdit?: (rows: TData[]) => void
  onDelete?: (rows: TData[]) => void
}

type DataTableBulkEditorProps<TData> = {
  table: Table<TData>
  rowSelection: RowSelectionState
  actions: DataTableBulkActions<TData>
}

function DataTableBulkEditor<TData>({
  table,
  rowSelection,
  actions,
}: DataTableBulkEditorProps<TData>) {
  const hasSelectedRows = Object.keys(rowSelection).length > 0
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original)

  if (!actions.onEdit && !actions.onDelete) {
    return null
  }

  return (
    <CommandBar open={hasSelectedRows}>
      <CommandBarBar>
        <CommandBarValue>
          {Object.keys(rowSelection).length} selected
        </CommandBarValue>
        {actions.onEdit && (
          <>
            <CommandBarSeperator />
            <CommandBarCommand
              label="Edit"
              action={() => actions.onEdit?.(selectedRows)}
              shortcut={{ shortcut: "e" }}
            />
          </>
        )}
        {actions.onDelete && (
          <>
            <CommandBarSeperator />
            <CommandBarCommand
              label="Delete"
              action={() => actions.onDelete?.(selectedRows)}
              shortcut={{ shortcut: "d" }}
            />
          </>
        )}
        <CommandBarSeperator />
        <CommandBarCommand
          label="Reset"
          action={() => {
            table.resetRowSelection()
          }}
          shortcut={{ shortcut: "Escape", label: "esc" }}
          // don't disable this command
        />
      </CommandBarBar>
    </CommandBar>
  )
}

export { DataTableBulkEditor }
