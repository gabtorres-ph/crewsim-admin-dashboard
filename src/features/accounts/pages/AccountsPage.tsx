import { useEffect, useState } from 'react'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import type { Account } from '../model'
import { columns } from "@/shared/ui/data-table/columns"
import { listAccounts } from '../api'


export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadAccounts() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await listAccounts({ offset:0, limit: 100})

      if (isMounted) {
        setAccounts(data)
      }
    } catch(error) {
      if (isMounted) {
        setError(error instanceof Error ? error.message : 'Failed to load accounts.')
      }
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }

  loadAccounts()

  return () => {
    isMounted = false
  }
}, [])

  return (
    <section className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Accounts
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            View and manage account balances.
          </p>
        </div>
      </header>
      {isLoading && <p className="mt-6 text-sm text-gray-500">Loading accounts...</p>}

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {error}
        </p>
      )}

      {!isLoading && !error && (
      <DataTable
        data={accounts}
        columns={columns}
      />
      )}

    </section>
  )
}
