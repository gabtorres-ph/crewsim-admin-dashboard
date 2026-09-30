"use client"

import {
  CommandBar,
  CommandBarBar,
  CommandBarCommand,
  CommandBarSeperator,
  CommandBarValue,
} from "@/components/CommandBar"
import { Table } from "@tanstack/react-table"

export type DataTableBulkActions<TData> = {
  onEdit?: (rows: TData[]) => void
  onDelete?: (rows: TData[]) => void
}

type DataTableBulkEditorProps<TData> = {
  table: Table<TData>
  actions: DataTableBulkActions<TData>
}

function DataTableBulkEditor<TData>({
  table,
  actions,
}: DataTableBulkEditorProps<TData>) {
  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)
  const selectedCount = selectedRows.length
  const hasSelectedRows = selectedCount > 0

  if (!actions.onEdit && !actions.onDelete) {
    return null
  }

  return (
    <CommandBar open={hasSelectedRows}>
      <CommandBarBar>
        <CommandBarValue>
          {selectedCount} selected
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
