import { useEffect, useMemo, useState } from 'react'
import { RiCloseLine } from '@remixicon/react'

import { listAccountEsims } from '../api/accounts'
import type { Account } from '../types/accounts'
import type { Esim } from '../types/esims'
import type { User } from '../types/user'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/Dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from './ui/Table'

type AccountEsimsDialogProps = {
  account: Account
  users: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountEsimsDialog({
  account,
  users,
  open,
  onOpenChange,
}: AccountEsimsDialogProps) {
  const [esims, setEsims] = useState<Esim[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadVersion, setLoadVersion] = useState(0)

  const userEmails = useMemo(
    () => new Map(users.map((user) => [user.id, user.email])),
    [users],
  )

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false

    async function loadEsims() {
      setLoading(true)
      setError(null)

      try {
        const result = await listAccountEsims(account.id)

        if (!cancelled) {
          setEsims(result)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load account eSIMs',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadEsims()

    return () => {
      cancelled = true
    }
  }, [account.id, loadVersion, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white text-gray-950 dark:bg-white">
        <DialogHeader className="flex-row items-start justify-between gap-x-4">
          <div>
            <DialogTitle className="text-2xl text-gray-950">
              {account.name} eSIMs
            </DialogTitle>
            <DialogDescription className="mt-2 text-gray-500">
              eSIMs assigned to account #{account.id}.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              aria-label="Close dialog"
              className="shrink-0 text-gray-600"
            >
              <RiCloseLine className="size-5" aria-hidden="true" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="mt-6">
          {loading && (
            <div
              role="status"
              className="rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500"
            >
              Loading eSIMs...
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"
            >
              <p>{error}</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setLoadVersion((version) => version + 1)}
                className="mt-4"
              >
                Try again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <AccountEsimsTable esims={esims} userEmails={userEmails} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AccountEsimsTable({
  esims,
  userEmails,
}: {
  esims: Esim[]
  userEmails: Map<number, string>
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>IMSI</TableHeaderCell>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Balance</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {esims.map((esim) => (
              <TableRow key={esim.id}>
                <TableCell className="font-mono">{esim.imsi}</TableCell>
                <TableCell>
                  {esim.userId === null
                    ? 'Unassigned'
                    : userEmails.get(esim.userId) ?? `User #${esim.userId}`}
                </TableCell>
                <TableCell>{esim.networkstatus ?? '—'}</TableCell>
                <TableCell>
                  {esim.balance === null ? '—' : esim.balance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {esims.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-gray-500">
                  No eSIMs are assigned to this account.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableRoot>
    </div>
  )
}
