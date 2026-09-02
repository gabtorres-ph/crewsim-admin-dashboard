import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

export const focusInput = [
  'focus-visible:ring-2',
  'focus-visible:ring-blue-200 dark:focus-visible:ring-blue-400/40',
  'focus-visible:border-blue-500 dark:focus-visible:border-blue-400',
]

export const focusRing = [
  'outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2',
  'focus-visible:outline-blue-500 dark:focus-visible:outline-blue-400',
]

export const hasErrorInput = [
  'ring-2',
  'border-red-500 dark:border-red-400',
  'ring-red-200 dark:ring-red-400/40',
]
