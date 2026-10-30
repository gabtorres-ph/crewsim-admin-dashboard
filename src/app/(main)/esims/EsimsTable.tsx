"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Button } from "@/components/Button"
import { DataTable } from "@/components/ui/data-table/DataTable"
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar"
import { EsimFormDialog } from "./EsimFormDialog"
import { EsimDetailsDialog } from "./EsimDetailsDialog"
import { EsimNetworkStatusDialog } from "./EsimNetworkStatusDialog"
import { deleteEsimAction, refreshEsimAction } from "./actions"
import type { EsimMoveResult, EsimRead } from "./types"
import { getEsimColumns } from "./columns"

const toolbarOptions = {
  search: {
    columnId: "imsi",
    placeholder: "Search eSIMs...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig

export function EsimsTable({ esims, users, usersError }: {
  esims: EsimRead[]
  users: { id: number; email: string }[]
  usersError?: string
}) {
  const router = useRouter()
  const userEmailsById = useMemo(
    () => new Map(users.map(({ id, email }) => [id, email])),
    [users],
  )
  const [isRetryingUsers, startUsersRetry] = useTransition()
  const [tableEsims, setTableEsims] = useState(esims)
  const [editing, setEditing] = useState<EsimRead>()
  const [viewing, setViewing] = useState<EsimRead>()
  const [viewingNetworkStatus, setViewingNetworkStatus] = useState<EsimRead>()
  const [networkStatusReloadKey, setNetworkStatusReloadKey] = useState(0)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string>()
  const [refreshSummary, setRefreshSummary] = useState<string>()
  const [refreshingEsimIds, setRefreshingEsimIds] = useState<ReadonlySet<number>>(() => new Set())
  const refreshingEsimIdsRef = useRef(new Set<number>())
  const [isDeleting, startDelete] = useTransition()

  useEffect(() => {
    setTableEsims(esims)
  }, [esims])

  function applyMoveResults(results: EsimMoveResult[]) {
    const accountIdsByImsi = new Map(results.map((result) => [result.imsi, result.account_id]))
    setTableEsims((currentEsims) => currentEsims.map((esim) => {
      const accountId = accountIdsByImsi.get(esim.imsi)
      return accountId === undefined ? esim : { ...esim, account_id: accountId }
    }))
    router.refresh()
  }

  async function refresh(esim: EsimRead) {
    if (refreshingEsimIdsRef.current.has(esim.id)) return

    refreshingEsimIdsRef.current.add(esim.id)
    setRefreshingEsimIds(new Set(refreshingEsimIdsRef.current))
    setError(undefined)
    setRefreshSummary(undefined)

    try {
      const result = await refreshEsimAction(esim.imsi)
      if (!result.ok) {
        setError(`Could not refresh eSIM “${esim.name ?? esim.imsi}”: ${result.error}`)
        return
      }
      setRefreshSummary(`Refreshed eSIM “${esim.name ?? esim.imsi}”.`)
      setNetworkStatusReloadKey((current) => current + 1)
      router.refresh()
    } catch {
      setError(`Could not refresh eSIM “${esim.name ?? esim.imsi}”. Please try again.`)
    } finally {
      refreshingEsimIdsRef.current.delete(esim.id)
      setRefreshingEsimIds(new Set(refreshingEsimIdsRef.current))
    }
  }

  function remove(esim: EsimRead) {
    if (!window.confirm(`Delete eSIM “${esim.name ?? esim.imsi}”?`)) return
    setError(undefined)
    startDelete(() => {
      void (async () => {
        const result = await deleteEsimAction(esim.id)
        if (!result.ok) return setError(result.error)
        router.refresh()
      })()
    })
  }
  const toolbar = {
    ...toolbarOptions,
    primaryAction: {
      label: "Add eSIM",
      onClick: () => setCreating(true),
    },
  } satisfies DataTableToolbarConfig

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tableEsims.length} eSIM{tableEsims.length === 1 ? "" : "s"}
        </p>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {refreshSummary && (
        <p role="status" className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {refreshSummary}
        </p>
      )}
      {refreshingEsimIds.size > 0 && (
        <p role="status" className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Refreshing {refreshingEsimIds.size} eSIM{refreshingEsimIds.size === 1 ? "" : "s"}…
        </p>
      )}
      {usersError && (
        <div className="mb-4 flex items-center gap-2">
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {usersError}
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => startUsersRetry(() => router.refresh())}
            disabled={isRetryingUsers}
            isLoading={isRetryingUsers}
            loadingText="Retrying"
          >
            Retry
          </Button>
        </div>
      )}
      <DataTable
        columns={getEsimColumns({
          onView: setViewing,
          onEdit: setEditing,
          onDelete: remove,
          onRefresh: refresh,
          onNetworkStatus: setViewingNetworkStatus,
          refreshingEsimIds,
          userEmailsById,
        })}
        data={tableEsims}
        emptyMessage="No eSIMs found."
        enableRowSelection
        getRowId={(esim) => String(esim.id)}
        pageSize={20}
        toolbar={toolbar}
      />
      <EsimFormDialog
        mode="create"
        open={creating}
        onOpenChange={setCreating}
      />
      <EsimDetailsDialog
        esim={viewing}
        userEmailsById={userEmailsById}
        onOpenChange={(open) => {
          if (!open) setViewing(undefined)
        }}
      />
      <EsimNetworkStatusDialog
        esim={viewingNetworkStatus}
        reloadKey={networkStatusReloadKey}
        onOpenChange={(open) => {
          if (!open) setViewingNetworkStatus(undefined)
        }}
      />
      <EsimFormDialog
        mode="edit"
        esim={editing}
        users={users}
        usersError={usersError}
        open={editing !== undefined}
        onMoveCompleted={applyMoveResults}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined)
        }}
      />
      {isDeleting && (
        <span className="sr-only" role="status">
          Deleting eSIM
        </span>
      )}
    </>
  )
}
