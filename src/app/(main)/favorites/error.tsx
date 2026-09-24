"use client"

import * as React from "react"
import { Button } from "@/components/Button"

export default function FavoritesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Favorites could not be loaded</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Check the Core API connection and try again.</p>
      <Button className="mt-4" onClick={reset}>Retry</Button>
    </div>
  )
}
