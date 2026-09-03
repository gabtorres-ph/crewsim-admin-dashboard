import { useState, type FormEvent } from 'react'
import { RiCloseLine } from '@remixicon/react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'

import type { Account, AccountCreateInput } from '../model'

type AccountFormDialogProps = {
  mode: 'add' | 'edit'
  account: Account | null
  open: boolean
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AccountCreateInput) => Promise<void>
}

type AccountFormValue = {
  name: string
  balance: string
}

const EMPTY_FORM: AccountFormValue = {
  name: '',
  balance: '',
}

function initialFormValue(account: Account | null): AccountFormValue {
  if (!account) {
    return { ...EMPTY_FORM }
  }

  return {
    name: account.name,
    balance: String(account.balance),
  }
}

export function AccountFormDialog({
  mode,
  account,
  open,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: AccountFormDialogProps) {
  const [form, setForm] = useState<AccountFormValue>(() =>
    initialFormValue(account),
  )
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AccountFormValue, string>>
  >({})

  function updateField<Field extends keyof AccountFormValue>(
    field: Field,
    value: AccountFormValue[Field],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = form.name.trim()
    const balance = form.balance.trim()
    const errors: Partial<Record<keyof AccountFormValue, string>> = {}

    if (!name) {
      errors.name = 'Name is required.'
    } else if (name.length > 255) {
      errors.name = 'Name must be 255 characters or fewer.'
    }

    if (!balance || !Number.isFinite(Number(balance))) {
      errors.balance = 'Balance must be a finite number.'
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    await onSubmit({ name, balance: Number(balance) })
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
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex-row items-start justify-between gap-x-4">
          <div>
            <DialogTitle className="text-2xl">
              {mode === 'add' ? 'Add account' : 'Edit account'}
            </DialogTitle>
            <DialogDescription className="mt-2">
              Configure the account name and balance.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              aria-label="Close dialog"
              className="shrink-0"
            >
              <RiCloseLine className="size-5" aria-hidden="true" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 py-6">
            <FormInput
              label="Name"
              name="name"
              value={form.name}
              required
              maxLength={255}
              saving={saving}
              error={fieldErrors.name}
              onChange={(value) => updateField('name', value)}
            />
            <FormInput
              label="Balance"
              name="balance"
              type="number"
              step="any"
              value={form.balance}
              required
              saving={saving}
              error={fieldErrors.balance}
              onChange={(value) => updateField('balance', value)}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-md border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={saving}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              isLoading={saving}
              loadingText="Saving"
            >
              {mode === 'add' ? 'Add account' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type FormInputProps = {
  label: string
  name: string
  type?: string
  value: string
  required?: boolean
  saving: boolean
  error?: string
  step?: string
  maxLength?: number
  onChange: (value: string) => void
}

function FormInput({
  label,
  name,
  type = 'text',
  value,
  required,
  saving,
  error,
  step,
  maxLength,
  onChange,
}: FormInputProps) {
  const errorId = error ? `${name}-error` : undefined

  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-gray-200">{label}</span>
      <Input
        name={name}
        type={type}
        value={value}
        required={required}
        disabled={saving}
        step={step}
        maxLength={maxLength}
        hasError={Boolean(error)}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <span id={errorId} className="text-sm text-red-400">
          {error}
        </span>
      )}
    </label>
  )
}
