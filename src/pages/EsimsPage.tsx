import { useEffect, useMemo, useState } from 'react'
import { RiAddLine } from '@remixicon/react'

import { Button } from '@/shared/ui/Button'
import { StatusPanel } from '@/shared/ui/StatusPanel'

import {
  createEsim,
  deleteEsim,
  listEsims,
  updateEsim,
} from '../api/esims'
import { listAccounts } from '../api/accounts'
import { listUsers } from '../api/users'
import { EsimFormDialog } from '../components/EsimFormDialog'
import { EsimTable } from '../components/EsimTable'
import type { Account } from '../types/accounts'
import type {
  Esim,
  EsimInput,
  EsimTableRow,
} from '../types/esims'
import type { User } from '../types/user'

type DialogMode = 'add' | 'edit' | null

export function EsimsPage() {
  const [esims, setEsims] = useState<Esim[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedEsim, setSelectedEsim] = useState<Esim | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  )

  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  )

  const tableRows = useMemo<EsimTableRow[]>(
    () =>
      esims.map((esim) => {
        const accountName = accountsById.get(esim.accountId)?.name

        return {
          ...esim,
          esim,
          userLabel:
            esim.userId === null
              ? 'Unassigned'
              : usersById.get(esim.userId)?.email ?? `User #${esim.userId}`,
          accountLabel: accountName
            ? `${accountName} (ID: ${esim.accountId})`
            : `Account #${esim.accountId}`,
        }
      }),
    [accountsById, esims, usersById],
  )

  async function loadPageData() {
    setLoading(true)
    setPageError(null)

    try {
      const [esimResult, accountResult, userResult] = await Promise.all([
        listEsims(),
        listAccounts(),
        listUsers(),
      ])

      setEsims(esimResult)
      setAccounts(accountResult)
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

  if (loading) {
    return (
      <StatusPanel variant="loading">
        Loading eSIMs...
      </StatusPanel>
    )
  }

  if (pageError) {
    return (
      <StatusPanel
        variant="error"
        onRetry={() => void loadPageData()}
      >
        {pageError}
      </StatusPanel>
    )
  }

  return (
    <section className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-50">
            eSIMs
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            View and manage all eSIM records.
          </p>
        </div>

        <Button type="button" onClick={openAddDialog} className="gap-1.5">
          <RiAddLine className="size-4" aria-hidden="true" />
          Add eSIM
        </Button>
      </header>

      <div className="mt-8">
        <EsimTable
          rows={tableRows}
          deletingId={deletingId}
          onEdit={openEditDialog}
          onDelete={(esim) => void handleDelete(esim)}
        />
      </div>

      {dialogMode && (
        <EsimFormDialog
          key={`${dialogMode}-${selectedEsim?.id ?? 'new'}`}
          mode={dialogMode}
          esim={selectedEsim}
          accounts={accounts}
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
