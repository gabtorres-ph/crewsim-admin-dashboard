import { useMemo } from 'react'
import { RiDeleteBinLine, RiEditLine } from '@remixicon/react'
import type {
  ColumnDef,
  SortFn,
  SortingState,
  TableFeatures,
} from '@tanstack/react-table'

import { Button } from '@/shared/ui/Button'
import { DataTable, type DataTableSelectFilter } from '@/shared/ui/DataTable'

import type { Esim, EsimTableRow } from '../types/esims'

const unspecifiedNetworkStatus = '__unspecified_network_status__'
const initialSorting: SortingState = [{ id: 'imsi', desc: false }]

function compareTableValues(left: unknown, right: unknown) {
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function searchableValue(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

const localeNumericSort: SortFn<TableFeatures, EsimTableRow> = (
  left,
  right,
  columnId,
) => compareTableValues(left.getValue(columnId), right.getValue(columnId))

type EsimTableProps = {
  rows: EsimTableRow[]
  deletingId: number | null
  onEdit: (esim: Esim) => void
  onDelete: (esim: Esim) => void
}

export function EsimTable({
  rows,
  deletingId,
  onEdit,
  onDelete,
}: EsimTableProps) {
  const columns = useMemo<
    ColumnDef<TableFeatures, EsimTableRow, unknown>[]
  >(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableColumnFilter: false,
        sortFn: localeNumericSort,
      },
      {
        id: 'user',
        accessorKey: 'userLabel',
        header: 'User',
        enableColumnFilter: false,
        sortFn: localeNumericSort,
      },
      {
        id: 'account',
        accessorKey: 'accountLabel',
        header: 'Account',
        enableColumnFilter: false,
        sortFn: localeNumericSort,
      },
      {
        accessorKey: 'imsi',
        header: 'IMSI',
        enableColumnFilter: false,
        sortFn: localeNumericSort,
        cell: ({ getValue }) => (
          <span className="font-mono">{getValue<string>()}</span>
        ),
      },
      {
        id: 'networkstatus',
        accessorKey: 'networkstatus',
        header: 'Status',
        sortFn: localeNumericSort,
        filterFn: (row, columnId, filterValue) => {
          const status = row.getValue<string | null>(columnId)

          return filterValue === unspecifiedNetworkStatus
            ? status === null
            : status === filterValue
        },
        cell: ({ getValue }) => getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        enableColumnFilter: false,
        sortFn: localeNumericSort,
        cell: ({ getValue }) => {
          const balance = getValue<number | null>()

          return balance === null ? '—' : balance.toLocaleString()
        },
      },
      {
        id: 'provisioning',
        header: 'Provisioning',
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <div className="grid gap-0.5 text-xs">
            <span>{row.original.smdpserver ?? 'No SMDP server'}</span>
            {row.original.activationcode && (
              <span className="font-mono text-gray-500">
                {row.original.activationcode}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const tableRow = row.original

          return (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={deletingId === tableRow.id}
                onClick={() => onEdit(tableRow.esim)}
                className="gap-1.5"
                aria-label={`Edit eSIM ${tableRow.imsi}`}
              >
                <RiEditLine className="size-4" aria-hidden="true" />
                Edit
              </Button>

              <Button
                type="button"
                variant="ghost"
                isLoading={deletingId === tableRow.id}
                loadingText="Deleting"
                disabled={deletingId !== null}
                onClick={() => onDelete(tableRow.esim)}
                className="gap-1.5 text-red-400 hover:bg-red-950 hover:text-red-300 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                aria-label={`Delete eSIM ${tableRow.imsi}`}
              >
                <RiDeleteBinLine className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          )
        },
      },
    ],
    [deletingId, onDelete, onEdit],
  )

  const filters = useMemo<DataTableSelectFilter[]>(() => {
    const statusOptions = [
      ...new Set(
        rows.flatMap((row) =>
          row.networkstatus === null ? [] : [row.networkstatus],
        ),
      ),
    ]
      .sort((left, right) => left.localeCompare(right))
      .map((status) => ({ label: status, value: status }))

    if (rows.some((row) => row.networkstatus === null)) {
      statusOptions.push({
        label: 'Unspecified',
        value: unspecifiedNetworkStatus,
      })
    }

    return [
      {
        columnId: 'networkstatus',
        label: 'Status',
        options: statusOptions,
      },
    ]
  }, [rows])

  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => String(row.id)}
      initialSorting={initialSorting}
      search={{
        label: 'Search eSIMs',
        placeholder: 'Search by ID, user, account, or IMSI...',
        filterFn: (row, _columnId, filterValue) => {
          const query = String(filterValue).trim().toLowerCase()
          const tableRow = row.original

          if (!query) {
            return true
          }

          return [
            tableRow.id,
            tableRow.userLabel,
            tableRow.userId,
            tableRow.accountLabel,
            tableRow.accountId,
            tableRow.imsi,
            tableRow.name,
            tableRow.networkstatus,
            tableRow.balance,
            tableRow.smdpserver,
            tableRow.activationcode,
            tableRow.imei,
            tableRow.imeiDevice,
          ]
            .map(searchableValue)
            .join(' ')
            .toLowerCase()
            .includes(query)
        },
      }}
      filters={filters}
      emptyState={{
        noData: 'No eSIMs have been added yet.',
        noResults: 'No eSIMs match your search.',
      }}
    />
  )
}
