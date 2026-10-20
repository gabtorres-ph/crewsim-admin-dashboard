"use client"

import { Button } from "@/components/Button"
import { RiMoreFill } from "@remixicon/react"
import { Row } from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/Dropdown"

export type DataTableRowAction<TData> = {
  id: string
  label: string
  onSelect: (data: TData) => void
  disabled?: boolean
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  rowLabel?: string
  onView?: (data: TData) => void
  onEdit?: (data: TData) => void
  onDelete?: (data: TData) => void
  customActions?: readonly DataTableRowAction<TData>[]
}

export function DataTableRowActions<TData>({
  row,
  rowLabel,
  onView,
  onEdit,
  onDelete,
  customActions = [],
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="group aspect-square p-1.5 hover:border hover:border-gray-300 data-[state=open]:border-gray-300 data-[state=open]:bg-gray-50 hover:dark:border-gray-700 data-[state=open]:dark:border-gray-700 data-[state=open]:dark:bg-gray-900"
          aria-label={
            rowLabel ? `Open actions for ${rowLabel}` : "Open actions"
          }
          onClick={(event) => event.stopPropagation()}
        >
          <RiMoreFill
            className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-data-[state=open]:text-gray-700 group-hover:dark:text-gray-300 group-data-[state=open]:dark:text-gray-300"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {onView && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.stopPropagation()
              onView(row.original)
            }}
          >
            View details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.stopPropagation()
              onEdit(row.original)
            }}
          >
            Edit
          </DropdownMenuItem>
        )}
        {customActions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            disabled={action.disabled}
            onSelect={(event) => {
              event.stopPropagation()
              action.onSelect(row.original)
            }}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
        {onDelete && (
          <DropdownMenuItem
            className="text-red-600 dark:text-red-500"
            onSelect={(event) => {
              event.stopPropagation()
              onDelete(row.original)
            }}
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
