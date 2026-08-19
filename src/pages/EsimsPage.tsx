import { useCallback, useEffect, useMemo, useState } from 'react'
import { RiAddLine } from '@remixicon/react'

import {
  createEsim,
  deleteEsim,
  listEsims,
  updateEsim,
} from '../api/esims'
import { listUsers } from '../api/users'
import { EsimFormDialog } from '../components/EsimFormDialog'
import { EsimTable } from '../components/EsimTable'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import type { Esim, EsimInput, EsimSortKey } from '../types/esims'
import type { SortDirection } from '../types/sort'
import type { User } from '../types/user'

type DialogMode = 'add' | 'edit' | null

export function EsimsPage() {
  const [esims, setEsims] = useState<Esim[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<EsimSortKey>('imsi')
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('ascending')

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedEsim, setSelectedEsim] = useState<Esim | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const userEmails = useMemo(
    () => new Map(users.map((user) => [user.id, user.email])),
    [users],
  )

  const getUserLabel = useCallback(
    (userId: number) => userEmails.get(userId) ?? `User #${userId}`,
    [userEmails],
  )

  async function loadPageData() {
    setLoading(true)
    setPageError(null)

    try {
      const [esimResult, userResult] = await Promise.all([
        listEsims(),
        listUsers(),
      ])

      setEsims(esimResult)
      setUsers(userResult)
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : 'Unable to load eSIMs',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPageData()
  }, [])

  function openAddDialog() {
    setSelectedEsim(null)
    setFormError(null)
    setDialogMode('add')
  }

  function openEditDialog(esim: Esim) {
    setSelectedEsim(esim)
    setFormError(null)
    setDialogMode('edit')
  }

  function handleDialogOpenChange(open: boolean) {
    if (!open && !saving) {
      setDialogMode(null)
      setSelectedEsim(null)
      setFormError(null)
    }
  }

  async function handleSave(input: EsimInput) {
    setSaving(true)
    setFormError(null)

    try {
      if (dialogMode === 'add') {
        await createEsim(input)
      } else if (dialogMode === 'edit' && selectedEsim) {
        await updateEsim(selectedEsim.id, input)
      }

      await loadPageData()
      setDialogMode(null)
      setSelectedEsim(null)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save eSIM',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(esim: Esim) {
    const confirmed = window.confirm(
      `Delete eSIM ${esim.imsi}? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingId(esim.id)
    setPageError(null)

    try {
      await deleteEsim(esim.id)
      await loadPageData()
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : 'Unable to delete eSIM',
      )
    } finally {
      setDeletingId(null)
    }
  }

  function handleSort(column: EsimSortKey) {
    if (column === sortKey) {
      setSortDirection((current) =>
        current === 'ascending' ? 'descending' : 'ascending',
      )
      return
    }

    setSortKey(column)
    setSortDirection('ascending')
  }

  const filteredEsims = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return esims
    }

    return esims.filter((esim) =>
      [esim.id, getUserLabel(esim.userId), esim.imsi]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [esims, search, getUserLabel])

  const visibleEsims = useMemo(() => {
    const copy = [...filteredEsims]

    copy.sort((left, right) => {
      const leftValue = sortKey === 'user'
        ? getUserLabel(left.userId)
        : left[sortKey]
      const rightValue = sortKey === 'user'
        ? getUserLabel(right.userId)
        : right[sortKey]
      const comparison = String(leftValue).localeCompare(
        String(rightValue),
        undefined,
        { numeric: true, sensitivity: 'base' },
      )

      return sortDirection === 'ascending' ? comparison : -comparison
    })

    return copy
  }, [filteredEsims, sortKey, sortDirection, getUserLabel])

  if (loading) {
    return (
      <div
        className="rounded-lg border border-gray-800 bg-gray-950 p-12 text-center text-sm text-gray-400"
        role="status"
      >
        Loading eSIMs...
      </div>
    )
  }

  if (pageError) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-900 bg-red-950/40 p-6 text-red-200"
      >
        <p>{pageError}</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadPageData()}
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">eSIMs</h1>
          <p className="mt-2 text-sm text-gray-400">
            View and manage all eSIM records.
          </p>
        </div>

        <Button type="button" onClick={openAddDialog} className="gap-1.5">
          <RiAddLine className="size-4" aria-hidden="true" />
          Add eSIM
        </Button>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          value={search}
          placeholder="Search by ID, user, or IMSI..."
          aria-label="Search eSIMs"
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:max-w-md"
        />
        <span className="text-sm text-gray-400">
          {visibleEsims.length} eSIMs
        </span>
      </div>

      <div className="mt-4">
        <EsimTable
          esims={visibleEsims}
          users={users}
          hasSearch={search.trim().length > 0}
          sortKey={sortKey}
          sortDirection={sortDirection}
          deletingId={deletingId}
          onSort={handleSort}
          onEdit={openEditDialog}
          onDelete={(esim) => void handleDelete(esim)}
        />
      </div>

      {dialogMode && (
        <EsimFormDialog
          key={`${dialogMode}-${selectedEsim?.id ?? 'new'}`}
          mode={dialogMode}
          esim={selectedEsim}
          users={users}
          open={true}
          saving={saving}
          error={formError}
          onOpenChange={handleDialogOpenChange}
          onSubmit={handleSave}
        />
      )}
    </section>
  )
}
