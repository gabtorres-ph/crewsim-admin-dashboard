"use client"

import { Button } from "@/components/Button"
import { Searchbar } from "@/components/Searchbar"
import { RiDownloadLine } from "@remixicon/react"
import { Table } from "@tanstack/react-table"
import * as React from "react"
import { useDebouncedCallback } from "use-debounce"
import { DataTableFilter, FilterType } from "./DataTableFilter"
import { ViewOptions } from "./DataTableViewOptions"

export type DataTableFilterConfig = {
  columnId: string
  title: string
  type?: FilterType
  options?: {
    label: string
    value: string
  }[]
  formatter?: (value: unknown) => string
  inputPlaceholder?: string
}

export type DataTableToolbarConfig = {
  search?: {
    columnId: string
    placeholder: string
  }
  filters?: DataTableFilterConfig[]
  showViewOptions?: boolean
  onExport?: () => void
  primaryAction?: {
    label: string
    onClick: () => void
  }
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  config: DataTableToolbarConfig
}

export function Filterbar<TData>({
  table,
  config,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const searchColumn = config.search
    ? table.getColumn(config.search.columnId)
    : undefined
  const searchValue = searchColumn?.getFilterValue()
  const [searchTerm, setSearchTerm] = React.useState(
    typeof searchValue === "string" ? searchValue : "",
  )

  const debouncedSetFilterValue = useDebouncedCallback((value: string) => {
    searchColumn?.setFilterValue(value)
  }, 300)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)
    debouncedSetFilterValue(value)
  }

  React.useEffect(() => {
    setSearchTerm(typeof searchValue === "string" ? searchValue : "")
  }, [searchValue])

  const visibleFilters = (config.filters ?? []).filter((filter) =>
    table.getColumn(filter.columnId)?.getIsVisible(),
  )

  const hasLeftControls = visibleFilters.length > 0 || searchColumn
  const hasRightControls = Boolean(
    config.onExport || config.showViewOptions || config.primaryAction,
  )

  if (!hasLeftControls && !hasRightControls) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-x-6">
      <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:items-center">
        {visibleFilters.map((filter) => (
          <DataTableFilter
            key={filter.columnId}
            column={table.getColumn(filter.columnId)}
            title={filter.title}
            options={filter.options}
            type={filter.type}
            formatter={filter.formatter}
            inputPlaceholder={filter.inputPlaceholder}
          />
        ))}
        {config.search && searchColumn?.getIsVisible() && (
          <Searchbar
            type="search"
            placeholder={config.search.placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:max-w-[250px] sm:[&>input]:h-[30px]"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              debouncedSetFilterValue.cancel()
              table.resetColumnFilters()
              setSearchTerm("")
            }}
            className="border border-gray-200 px-2 font-semibold text-indigo-600 sm:border-none sm:py-1 dark:border-gray-800 dark:text-indigo-500"
          >
            Clear filters
          </Button>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {config.onExport && (
          <Button
            variant="secondary"
            className="hidden gap-x-2 px-2 py-1.5 text-sm sm:text-xs lg:flex"
            onClick={config.onExport}
          >
            <RiDownloadLine className="size-4 shrink-0" aria-hidden="true" />
            Export
          </Button>
        )}
        {config.showViewOptions && <ViewOptions table={table} />}
        {config.primaryAction && (
          <Button
            type="button"
            className="flex gap-x-2 px-2 py-1.5 text-sm sm:text-xs"
            onClick={config.primaryAction.onClick}
          >
            {config.primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}
