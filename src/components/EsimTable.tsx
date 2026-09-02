import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react'

import type { Esim, EsimSortKey, EsimTableRow } from '../types/esims'
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
  rows: EsimTableRow[]
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
  rows,
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
                column="accountId"
                label="Account"
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
              <SortableEsimHeader
                column="networkstatus"
                label="Status"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableEsimHeader
                column="balance"
                label="Balance"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <TableHeaderCell>Provisioning</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.userLabel}</TableCell>
                <TableCell>{row.accountLabel}</TableCell>
                <TableCell className="font-mono">{row.imsi}</TableCell>
                <TableCell>{row.networkstatus ?? '—'}</TableCell>
                <TableCell>
                  {row.balance === null ? '—' : row.balance.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="grid gap-0.5 text-xs">
                    <span>{row.smdpserver ?? 'No SMDP server'}</span>
                    {row.activationcode && (
                      <span className="font-mono text-gray-500">
                        {row.activationcode}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={deletingId === row.id}
                      onClick={() => onEdit(row.esim)}
                      className="gap-1.5"
                      aria-label={`Edit eSIM ${row.imsi}`}
                    >
                      <RiEditLine className="size-4" aria-hidden="true" />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      isLoading={deletingId === row.id}
                      loadingText="Deleting"
                      disabled={deletingId !== null}
                      onClick={() => onDelete(row.esim)}
                      className="gap-1.5 text-red-400 hover:bg-red-950 hover:text-red-300 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                      aria-label={`Delete eSIM ${row.imsi}`}
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

            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
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
