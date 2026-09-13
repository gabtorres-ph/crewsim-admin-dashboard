import type { Esim } from "../model"
import { useState, useEffect } from "react"
import { listEsims } from '../api'
import { DataTable } from "@/shared/ui/data-table/DataTable"
import { columns } from "@/features/esims/components/columns"

export function EsimsPage() {
  const [esims, setEsims] = useState<Esim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadEsims() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await listEsims({ offset:0, limit: 100})

        if (isMounted) {
          setEsims(data)
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

    loadEsims()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            ESims
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            View and manage ESims
          </p>
        </div>
      </header>
      {isLoading && <p className="mt-6 text-sm text-gray-500">Loading ESims...</p>}

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {error}
        </p>
      )}

      {!isLoading && !error && (
      <DataTable
        data={esims}
        columns={columns}
      />
      )}
    </section>
  )
}