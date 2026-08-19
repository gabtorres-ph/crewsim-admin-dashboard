import { useId, useState, type FormEvent } from 'react'
import { RiCloseLine } from '@remixicon/react'

import type { Esim, EsimInput } from '../types/esims'
import type { User } from '../types/user'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/Dialog'
import { Input } from './ui/Input'
import { SelectNative } from './ui/SelectNative'

type EsimFormDialogProps = {
  mode: 'add' | 'edit'
  esim: Esim | null
  users: User[]
  open: boolean
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: EsimInput) => Promise<void>
}

const EMPTY_ESIM_FORM: EsimInput = {
  user: '',
  imsi: '',
}

function initialFormValue(esim: Esim | null): EsimInput {
  if (!esim) {
    return { ...EMPTY_ESIM_FORM }
  }

  return {
    user: esim.user,
    imsi: esim.imsi,
  }
}

export function EsimFormDialog({
  mode,
  esim,
  users,
  open,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: EsimFormDialogProps) {
  const [form, setForm] = useState<EsimInput>(() =>
    initialFormValue(esim),
  )
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof EsimInput, string>>
  >({})
  const userId = useId()
  const imsiId = useId()

  function updateField(field: keyof EsimInput, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const user = form.user.trim()
    const imsi = form.imsi.trim()
    const errors: Partial<Record<keyof EsimInput, string>> = {}

    if (!user) {
      errors.user = 'Select a user.'
    }

    if (!imsi) {
      errors.imsi = 'IMSI is required.'
    } else if (!/^\d+$/.test(imsi)) {
      errors.imsi = 'IMSI must contain digits only.'
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    await onSubmit({ user, imsi })
  }

  const userErrorId = fieldErrors.user ? `${userId}-error` : undefined
  const imsiErrorId = fieldErrors.imsi ? `${imsiId}-error` : undefined

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!saving) {
          onOpenChange(nextOpen)
        }
      }}
    >
      <DialogContent className="max-w-2xl bg-white text-gray-950 dark:bg-white">
        <DialogHeader className="flex-row items-start justify-between gap-x-4">
          <div>
            <DialogTitle className="text-2xl text-gray-950">
              {mode === 'add' ? 'Add eSIM' : 'Edit eSIM'}
            </DialogTitle>
            <DialogDescription className="mt-2 text-gray-500">
              Select the user and enter the IMSI.
            </DialogDescription>
          </div>

          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              aria-label="Close dialog"
              className="shrink-0 text-gray-600"
            >
              <RiCloseLine className="size-5" aria-hidden="true" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 py-6 sm:grid-cols-2">
            <div className="grid content-start gap-2">
              <label
                htmlFor={userId}
                className="text-sm font-medium text-gray-900"
              >
                User
              </label>
              <SelectNative
                id={userId}
                name="user"
                value={form.user}
                required
                disabled={saving}
                hasError={Boolean(fieldErrors.user)}
                aria-invalid={Boolean(fieldErrors.user)}
                aria-describedby={userErrorId}
                onChange={(event) =>
                  updateField('user', event.target.value)
                }
              >
                <option value="">
                  {users.length > 0
                    ? 'Select a user'
                    : 'No users available'}
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.email}>
                    {user.email}
                  </option>
                ))}
              </SelectNative>
              {fieldErrors.user && (
                <span id={userErrorId} className="text-sm text-red-600">
                  {fieldErrors.user}
                </span>
              )}
            </div>

            <div className="grid content-start gap-2">
              <label
                htmlFor={imsiId}
                className="text-sm font-medium text-gray-900"
              >
                IMSI
              </label>
              <Input
                id={imsiId}
                name="imsi"
                type="text"
                value={form.imsi}
                inputMode="numeric"
                autoComplete="off"
                placeholder="310150123456789"
                required
                disabled={saving}
                hasError={Boolean(fieldErrors.imsi)}
                aria-invalid={Boolean(fieldErrors.imsi)}
                aria-describedby={imsiErrorId}
                onChange={(event) =>
                  updateField('imsi', event.target.value)
                }
              />
              {fieldErrors.imsi && (
                <span id={imsiErrorId} className="text-sm text-red-600">
                  {fieldErrors.imsi}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              isLoading={saving}
              loadingText="Saving"
            >
              {mode === 'add' ? 'Add eSIM' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
