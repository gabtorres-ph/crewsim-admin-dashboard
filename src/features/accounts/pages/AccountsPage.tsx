import { useState } from 'react'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import type { Account } from '../model'
import { columns } from "@/shared/ui/data-table/columns"


export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])

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

      <DataTable
        data={accounts}
        columns={columns}
      />

    </section>
  )
}
