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
        'mx-auto max-w-7xl rounded-lg border bg-gray-900 shadow-sm',
        isError
          ? 'border-red-900/80 bg-red-950/30 p-6 text-red-200 sm:p-8'
          : 'border-gray-800 p-8 text-center text-sm text-gray-400 sm:p-12',
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
