import { useState, type FormEvent } from 'react'
import { RiCloseLine } from '@remixicon/react'

import type { User, UserInput } from '../types/user'
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

type UserFormDialogProps = {
  mode: 'add' | 'edit'
  user: User | null
  open: boolean
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UserInput) => Promise<void>
}

const EMPTY_FORM: UserInput = {
  email: '',
  language: '',
  currency: '',
  timezone: '',
}

function initialFormValue(user: User | null): UserInput {
  if (!user) {
    return EMPTY_FORM
  }

  return {
    email: user.email,
    language: user.language,
    currency: user.currency,
    timezone: user.timezone,
  }
}

export function UserFormDialog({
  mode,
  user,
  open,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: UserFormDialogProps) {
  const [form, setForm] = useState<UserInput>(() => initialFormValue(user))

  function updateField(field: keyof UserInput, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      email: form.email.trim(),
      language: form.language.trim(),
      currency: form.currency.trim(),
      timezone: form.timezone.trim(),
    })
  }

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
              {mode === 'add' ? 'Add user' : 'Edit user'}
            </DialogTitle>

            <DialogDescription className="mt-2 text-gray-500">
              Configure the user&apos;s basic account details.
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

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-6 sm:grid-cols-2">
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-gray-900">
                Email
              </span>
              <Input
                type="email"
                value={form.email}
                placeholder="name@company.com"
                required
                disabled={saving}
                onChange={(event) =>
                  updateField('email', event.target.value)
                }
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-gray-900">
                Language
              </span>
              <SelectNative
                value={form.language}
                required
                disabled={saving}
                onChange={(event) =>
                  updateField('language', event.target.value)
                }
              >
                <option value="">Select a language</option>
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="es">Spanish</option>
              </SelectNative>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-gray-900">
                Currency
              </span>
              <SelectNative
                value={form.currency}
                required
                disabled={saving}
                onChange={(event) =>
                  updateField('currency', event.target.value)
                }
              >
                <option value="">Select a currency</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="PHP">PHP - Philippine Peso</option>
              </SelectNative>
            </label>

            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-gray-900">
                Timezone
              </span>
              <Input
                type="text"
                value={form.timezone}
                placeholder="Asia/Manila"
                required
                disabled={saving}
                onChange={(event) =>
                  updateField('timezone', event.target.value)
                }
              />
            </label>
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

            <Button type="submit" isLoading={saving}>
              {mode === 'add' ? 'Add user' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
