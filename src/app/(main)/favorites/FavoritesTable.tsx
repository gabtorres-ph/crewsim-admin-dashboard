"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { DataTable } from "@/components/ui/data-table/DataTable"
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar"
import { deleteFavoriteAction } from "./actions"
import { getFavoriteColumns } from "./columns"
import { FavoriteFormDialog } from "./FavoriteFormDialog"
import type { FavoriteRead } from "./types"

const toolbarOptions = {
  search: { columnId: "country", placeholder: "Search favorites..." },
  showViewOptions: true,
} satisfies DataTableToolbarConfig

export function FavoritesTable({ favorites }: { favorites: FavoriteRead[] }) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [actionError, setActionError] = useState<string>()
  const [isDeleting, startDeleteTransition] = useTransition()

  function deleteFavorite(favorite: FavoriteRead) {
    if (!window.confirm(`Delete favorite “${favorite.country}” for user ${favorite.user_id}?`)) return
    setActionError(undefined)
    startDeleteTransition(() => {
      void (async () => {
        const result = await deleteFavoriteAction(favorite.id)
        if (!result.ok) {
          setActionError(result.error)
          return
        }
        router.refresh()
      })()
    })
  }

  const toolbar = {
    ...toolbarOptions,
    primaryAction: { label: "Add favorite", onClick: () => setIsCreateOpen(true) },
  } satisfies DataTableToolbarConfig

  return (
    <>
      <div className="mb-4"><p className="text-sm text-gray-500 dark:text-gray-400">{favorites.length} favorite{favorites.length === 1 ? "" : "s"}</p></div>
      {actionError && <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">{actionError}</p>}
      <DataTable columns={getFavoriteColumns(deleteFavorite)} data={favorites} emptyMessage="No favorites found." enableRowSelection getRowId={(favorite) => String(favorite.id)} pageSize={20} toolbar={toolbar} />
      <FavoriteFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      {isDeleting && <span className="sr-only" role="status">Deleting favorite</span>}
    </>
  )
}
