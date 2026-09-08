import type { ReactNode } from 'react'

import { cx } from '@/shared/lib/utils'
import { Button } from './Button'

type StatusPanelProps = {
  children: ReactNode
  variant: 'loading' | 'error'
  onRetry?: () => void
}

export function StatusPanel({
  children,
  variant,
  onRetry,
}: StatusPanelProps) {
  const isError = variant === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={cx(
        'mx-auto max-w-7xl rounded-lg border bg-white shadow-sm dark:bg-gray-900',
        isError
          ? 'border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/80 dark:bg-red-950/30 dark:text-red-200 sm:p-8'
          : 'border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:p-12',
      )}
    >
      <p>{children}</p>
      {isError && onRetry && (
        <Button
          type="button"
          variant="secondary"
          onClick={onRetry}
          className="mt-4"
        >
          Try again
        </Button>
      )}
    </div>
  )
}
