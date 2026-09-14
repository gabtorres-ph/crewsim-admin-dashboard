import type { User } from "../model"
import { useState, useEffect } from "react"
import { listUsers } from '../api'
import { DataTable } from "@/shared/ui/data-table/DataTable"
import { columns } from "@/features/users/components/columns"

export function UsersPage() {
  const [user, setUser] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await listUsers({ offset:0, limit: 100})

        if (isMounted) {
          setUser(data)
        }
      } catch(error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message: 'Failed to load esims.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
      }

    loadUsers()

    return () => {
      isMounted = false
    }
  }, [])


  return (
    <section className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Users
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            View and manage Users
          </p>
        </div>
      </header>
      {isLoading && <p className="mt-6 text-sm text-gray-500">Loading Accounts...</p>}

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {error}
        </p>
      )}

      {!isLoading && !error && (
      <DataTable
        data={user}
        columns={columns}
      />
      )}

    </section>
  )
}