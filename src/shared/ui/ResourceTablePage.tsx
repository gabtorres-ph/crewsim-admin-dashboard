import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/shared/ui/data-table/DataTable"

type ResourceTablePageProps<TData> = {
  title: string
  description: string
  columns: ColumnDef<TData>[]
  load: () => Promise<TData[]>
}

export function ResourceTablePage<TData>({
  title,
  description,
  columns,
  load,
}: ResourceTablePageProps<TData>) {
  const [data, setData] = useState<TData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)

        const nextData = await load()

        if (isMounted) {
          setData(nextData)
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : `Failed to load ${title.toLowerCase()}.`,
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [load, title])

  return (
    <section className="mx-auto w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </header>

      {isLoading && (
        <p className="mt-6 text-sm text-gray-500">Loading {title}...</p>
      )}

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <div className="mt-6">
          <DataTable data={data} columns={columns} />
        </div>
      )}
    </section>
  )
}
