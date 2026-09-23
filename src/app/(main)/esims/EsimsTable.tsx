"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { DataTable } from "@/components/ui/data-table/DataTable"
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar"
import { EsimFormDialog } from "./EsimFormDialog"
import { deleteEsimAction } from "./actions"
import type { EsimRead } from "./types"
import { getEsimColumns } from "./columns"

const toolbarOptions = {
  search: {
    columnId: "imsi",
    placeholder: "Search eSIMs...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig

export function EsimsTable({ esims }: { esims: EsimRead[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<EsimRead>()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string>()
  const [isDeleting, startDelete] = useTransition()
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
          {esims.length} eSIM{esims.length === 1 ? "" : "s"}
        </p>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <DataTable
        columns={getEsimColumns({ onEdit: setEditing, onDelete: remove })}
        data={esims}
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
      <EsimFormDialog
        mode="edit"
        esim={editing}
        open={editing !== undefined}
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
