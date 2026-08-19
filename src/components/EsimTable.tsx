import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react'

import type { Esim, EsimSortKey } from '../types/esims'
import type { SortDirection } from '../types/sort'
import { Button } from './ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from './ui/Table'

type EsimTableProps = {
  esims: Esim[]
  hasSearch: boolean
  sortKey: EsimSortKey
  sortDirection: SortDirection
  deletingId: number | null
  onSort: (column: EsimSortKey) => void
  onEdit: (esim: Esim) => void
  onDelete: (esim: Esim) => void
}

type SortableEsimHeaderProps = {
  column: EsimSortKey
  label: string
  sortKey: EsimSortKey
  sortDirection: SortDirection
  onSort: (column: EsimSortKey) => void
}

function SortableEsimHeader({
  column,
  label,
  sortKey,
  sortDirection,
  onSort,
}: SortableEsimHeaderProps) {
  const isActive = sortKey === column
  const SortIcon =
    sortDirection === 'ascending'
      ? RiArrowUpSLine
      : RiArrowDownSLine

  return (
    <TableHeaderCell aria-sort={isActive ? sortDirection : 'none'}>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        onClick={() => onSort(column)}
      >
        {label}
        {isActive && (
          <SortIcon className="size-4" aria-hidden="true" />
        )}
      </button>
    </TableHeaderCell>
  )
}

export function EsimTable({
  esims,
  hasSearch,
  sortKey,
  sortDirection,
  deletingId,
  onSort,
  onEdit,
  onDelete,
}: EsimTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
      <TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <SortableEsimHeader
                column="id"
                label="ID"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableEsimHeader
                column="user"
                label="User"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableEsimHeader
                column="imsi"
                label="IMSI"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {esims.map((esim) => (
              <TableRow key={esim.id}>
                <TableCell>{esim.id}</TableCell>
                <TableCell>{esim.user}</TableCell>
                <TableCell className="font-mono">{esim.imsi}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={deletingId === esim.id}
                      onClick={() => onEdit(esim)}
                      className="gap-1.5"
                      aria-label={`Edit eSIM ${esim.imsi}`}
                    >
                      <RiEditLine className="size-4" aria-hidden="true" />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      isLoading={deletingId === esim.id}
                      loadingText="Deleting"
                      disabled={deletingId !== null}
                      onClick={() => onDelete(esim)}
                      className="gap-1.5 text-red-400 hover:bg-red-950 hover:text-red-300 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                      aria-label={`Delete eSIM ${esim.imsi}`}
                    >
                      <RiDeleteBinLine
                        className="size-4"
                        aria-hidden="true"
                      />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {esims.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-12 text-center text-gray-400"
                >
                  {hasSearch
                    ? 'No eSIMs match your search.'
                    : 'No eSIMs have been added yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableRoot>
    </div>
  )
}
