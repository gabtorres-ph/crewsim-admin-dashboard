import { useId, useState, type FormEvent, type ReactNode } from 'react'
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

type OptionalBoolean = '' | 'true' | 'false'

type UserFormValue = {
  email: string
  language: string
  currency: string
  timezone: string
  firstname: string
  lastname: string
  airline: string
  position: string
  referralcode: string
  referredby: string
  stripeid: string
  logtoid: string
  createdate: string
  newsletter: OptionalBoolean
  smsnotification: OptionalBoolean
  rateus: string
}

const EMPTY_FORM: UserFormValue = {
  email: '', language: '', currency: '', timezone: '', firstname: '',
  lastname: '', airline: '', position: '', referralcode: '', referredby: '',
  stripeid: '', logtoid: '', createdate: '', newsletter: '',
  smsnotification: '', rateus: '',
}

function toDateTimeLocal(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16)
}

function initialFormValue(user: User | null): UserFormValue {
  if (!user) return { ...EMPTY_FORM }

  return {
    email: user.email,
    language: user.language,
    currency: user.currency,
    timezone: user.timezone,
    firstname: user.firstname ?? '',
    lastname: user.lastname ?? '',
    airline: user.airline ?? '',
    position: user.position ?? '',
    referralcode: user.referralcode ?? '',
    referredby: user.referredby === null ? '' : String(user.referredby),
    stripeid: user.stripeid ?? '',
    logtoid: user.logtoid ?? '',
    createdate: toDateTimeLocal(user.createdate),
    newsletter: user.newsletter === null ? '' : String(user.newsletter) as OptionalBoolean,
    smsnotification: user.smsnotification === null ? '' : String(user.smsnotification) as OptionalBoolean,
    rateus: toDateTimeLocal(user.rateus),
  }
}

function optionalText(value: string): string | undefined {
  return value.trim() || undefined
}

function optionalDateTime(value: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function UserFormDialog(props: UserFormDialogProps) {
  const { mode, user, open, saving, error, onOpenChange, onSubmit } = props
  const [form, setForm] = useState<UserFormValue>(() => initialFormValue(user))
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserFormValue, string>>>({})
  const referredbyId = useId()
  const referralcodeId = useId()

  function updateField<Field extends keyof UserFormValue>(field: Field, value: UserFormValue[Field]) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = form.email.trim()
    const language = form.language.trim()
    const currency = form.currency.trim()
    const timezone = form.timezone.trim()
    const referralcode = optionalText(form.referralcode)
    const referredbyText = form.referredby.trim()
    const errors: Partial<Record<keyof UserFormValue, string>> = {}

    if (!email) errors.email = 'Email is required.'
    if (!language) errors.language = 'Language is required.'
    if (!currency) errors.currency = 'Currency is required.'
    if (!timezone) errors.timezone = 'Timezone is required.'
    if (referralcode && referralcode.length > 8) errors.referralcode = 'Referral code must be 8 characters or fewer.'
    if (referredbyText && (!/^\d+$/.test(referredbyText) || Number(referredbyText) <= 0 || !Number.isSafeInteger(Number(referredbyText)))) {
      errors.referredby = 'Referrer ID must be a positive integer.'
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const input: UserInput = { email, language, currency, timezone }
    const textFields = ['firstname', 'lastname', 'airline', 'position', 'stripeid', 'logtoid'] as const
    textFields.forEach((field) => {
      const value = optionalText(form[field])
      if (value !== undefined) input[field] = value
    })
    if (referralcode !== undefined) input.referralcode = referralcode
    if (referredbyText) input.referredby = Number(referredbyText)
    const createdate = optionalDateTime(form.createdate)
    const rateus = optionalDateTime(form.rateus)
    if (createdate !== undefined) input.createdate = createdate
    if (rateus !== undefined) input.rateus = rateus
    if (form.newsletter) input.newsletter = form.newsletter === 'true'
    if (form.smsnotification) input.smsnotification = form.smsnotification === 'true'
    await onSubmit(input)
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!saving) onOpenChange(nextOpen) }}>
      <DialogContent className="max-w-3xl bg-white text-gray-950 dark:bg-white">
        <DialogHeader className="flex-row items-start justify-between gap-x-4">
          <div>
            <DialogTitle className="text-2xl text-gray-950">{mode === 'add' ? 'Add user' : 'Edit user'}</DialogTitle>
            <DialogDescription className="mt-2 text-gray-500">Configure account and optional profile details.</DialogDescription>
          </div>
          <DialogClose asChild><Button type="button" variant="ghost" disabled={saving} aria-label="Close dialog" className="shrink-0 text-gray-600"><RiCloseLine className="size-5" aria-hidden="true" /></Button></DialogClose>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 py-6 sm:grid-cols-2">
            <FormInput label="Email" name="email" type="email" value={form.email} required saving={saving} error={fieldErrors.email} onChange={(value) => updateField('email', value)} />
            <FormInput label="Timezone" name="timezone" value={form.timezone} placeholder="Asia/Manila" required saving={saving} error={fieldErrors.timezone} onChange={(value) => updateField('timezone', value)} />
            <FormInput label="Language" name="language" value={form.language} placeholder="en" required saving={saving} error={fieldErrors.language} onChange={(value) => updateField('language', value)} />
            <FormInput label="Currency" name="currency" value={form.currency} placeholder="USD" required saving={saving} error={fieldErrors.currency} onChange={(value) => updateField('currency', value)} />
            <FormInput label="First name" name="firstname" value={form.firstname} saving={saving} onChange={(value) => updateField('firstname', value)} />
            <FormInput label="Last name" name="lastname" value={form.lastname} saving={saving} onChange={(value) => updateField('lastname', value)} />
            <FormInput label="Airline" name="airline" value={form.airline} saving={saving} onChange={(value) => updateField('airline', value)} />
            <FormInput label="Position" name="position" value={form.position} saving={saving} onChange={(value) => updateField('position', value)} />
            <FormInput label="Referral code" id={referralcodeId} name="referralcode" value={form.referralcode} maxLength={8} saving={saving} error={fieldErrors.referralcode} onChange={(value) => updateField('referralcode', value)} />
            <FormInput label="Referrer ID" id={referredbyId} name="referredby" type="number" min="1" step="1" value={form.referredby} saving={saving} error={fieldErrors.referredby} onChange={(value) => updateField('referredby', value)} />
            <FormInput label="Stripe ID" name="stripeid" value={form.stripeid} saving={saving} onChange={(value) => updateField('stripeid', value)} />
            <FormInput label="Logto ID" name="logtoid" value={form.logtoid} saving={saving} onChange={(value) => updateField('logtoid', value)} />
            <FormInput label="Created date" name="createdate" type="datetime-local" value={form.createdate} saving={saving} onChange={(value) => updateField('createdate', value)} />
            <FormInput label="Rate us date" name="rateus" type="datetime-local" value={form.rateus} saving={saving} onChange={(value) => updateField('rateus', value)} />
            <FormSelect label="Newsletter" name="newsletter" value={form.newsletter} saving={saving} onChange={(value) => updateField('newsletter', value as OptionalBoolean)}><option value="">Not set</option><option value="true">Yes</option><option value="false">No</option></FormSelect>
            <FormSelect label="SMS notifications" name="smsnotification" value={form.smsnotification} saving={saving} onChange={(value) => updateField('smsnotification', value as OptionalBoolean)}><option value="">Not set</option><option value="true">Yes</option><option value="false">No</option></FormSelect>
          </div>
          {error && <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <DialogFooter><DialogClose asChild><Button type="button" variant="secondary" disabled={saving}>Cancel</Button></DialogClose><Button type="submit" isLoading={saving}>{mode === 'add' ? 'Add user' : 'Save changes'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type FormInputProps = { label: string; name: string; id?: string; type?: string; value: string; placeholder?: string; required?: boolean; saving: boolean; error?: string; min?: string; step?: string; maxLength?: number; onChange: (value: string) => void }
function FormInput({ label, name, id, type = 'text', value, placeholder, required, saving, error, min, step, maxLength, onChange }: FormInputProps) {
  const errorId = error ? `${id ?? name}-error` : undefined
  return <label className="grid gap-2"><span className="text-sm font-medium text-gray-900">{label}</span><Input id={id} name={name} type={type} value={value} placeholder={placeholder} required={required} disabled={saving} min={min} step={step} maxLength={maxLength} hasError={Boolean(error)} aria-invalid={Boolean(error)} aria-describedby={errorId} onChange={(event) => onChange(event.target.value)} />{error && <span id={errorId} className="text-sm text-red-600">{error}</span>}</label>
}

type FormSelectProps = { label: string; name: string; value: string; required?: boolean; saving: boolean; error?: string; onChange: (value: string) => void; children: ReactNode }
function FormSelect({ label, name, value, required, saving, error, onChange, children }: FormSelectProps) {
  const errorId = error ? `${name}-error` : undefined
  return <label className="grid gap-2"><span className="text-sm font-medium text-gray-900">{label}</span><SelectNative name={name} value={value} required={required} disabled={saving} hasError={Boolean(error)} aria-invalid={Boolean(error)} aria-describedby={errorId} onChange={(event) => onChange(event.target.value)}>{children}</SelectNative>{error && <span id={errorId} className="text-sm text-red-600">{error}</span>}</label>
}
