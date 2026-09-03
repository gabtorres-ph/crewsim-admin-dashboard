import { useState, type FormEvent, type ReactNode } from 'react'
import { RiCloseLine } from '@remixicon/react'

import { Button } from '@/shared/ui/Button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { SelectNative } from '@/shared/ui/SelectNative'

import type { Account } from '../types/accounts'
import type { Esim, EsimInput } from '../types/esims'
import type { User } from '@/features/users/model'

type EsimFormDialogProps = { mode: 'add' | 'edit'; esim: Esim | null; accounts?: Account[]; users: User[]; open: boolean; saving: boolean; error: string | null; onOpenChange: (open: boolean) => void; onSubmit: (input: EsimInput) => Promise<void> }
type OptionalBoolean = '' | 'true' | 'false'
type EsimFormValue = { userId: string; accountId: string; imsi: string; name: string; token: string; networkstatus: string; smdpserver: string; activationcode: string; imei: string; imeiDevice: string; balance: string; isesim: OptionalBoolean; useAccountForCharging: OptionalBoolean; allowData: OptionalBoolean; createdate: string }

const EMPTY_FORM: EsimFormValue = { userId: '', accountId: '', imsi: '', name: '', token: '', networkstatus: '', smdpserver: '', activationcode: '', imei: '', imeiDevice: '', balance: '', isesim: '', useAccountForCharging: '', allowData: '', createdate: '' }

function toDateTimeLocal(value: string | null): string { if (!value) return ''; const date = new Date(value); if (Number.isNaN(date.getTime())) return ''; return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16) }
function initialFormValue(esim: Esim | null): EsimFormValue {
  if (!esim) return { ...EMPTY_FORM }
  return { userId: esim.userId === null ? '' : String(esim.userId), accountId: String(esim.accountId), imsi: esim.imsi, name: esim.name ?? '', token: esim.token ?? '', networkstatus: esim.networkstatus ?? '', smdpserver: esim.smdpserver ?? '', activationcode: esim.activationcode ?? '', imei: esim.imei ?? '', imeiDevice: esim.imeiDevice ?? '', balance: esim.balance === null ? '' : String(esim.balance), isesim: esim.isesim === null ? '' : String(esim.isesim) as OptionalBoolean, useAccountForCharging: String(esim.useAccountForCharging) as OptionalBoolean, allowData: esim.allowData === null ? '' : String(esim.allowData) as OptionalBoolean, createdate: toDateTimeLocal(esim.createdate) }
}
function optionalText(value: string): string | undefined { return value.trim() || undefined }
function optionalDateTime(value: string): string | undefined { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? undefined : date.toISOString() }
function isPositiveInteger(value: string) { return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0 }

export function EsimFormDialog(props: EsimFormDialogProps) {
  const { mode, esim, accounts = [], users, open, saving, error, onOpenChange, onSubmit } = props
  const [form, setForm] = useState<EsimFormValue>(() => initialFormValue(esim))
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EsimFormValue, string>>>({})
  function updateField<Field extends keyof EsimFormValue>(field: Field, value: EsimFormValue[Field]) { setForm((current) => ({ ...current, [field]: value })); setFieldErrors((current) => ({ ...current, [field]: undefined })) }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const accountId = form.accountId.trim(), userId = form.userId.trim(), imsi = form.imsi.trim(), token = optionalText(form.token), balance = form.balance.trim()
    const errors: Partial<Record<keyof EsimFormValue, string>> = {}
    if (!isPositiveInteger(accountId)) errors.accountId = 'Account is required.'
    if (userId && !isPositiveInteger(userId)) errors.userId = 'User ID must be a positive integer.'
    if (!imsi) errors.imsi = 'IMSI is required.'
    else if (imsi.length > 255) errors.imsi = 'IMSI must be 255 characters or fewer.'
    if (token && token.length > 8) errors.token = 'Token must be 8 characters or fewer.'
    if (balance && !Number.isFinite(Number(balance))) errors.balance = 'Balance must be a number.'
    setFieldErrors(errors); if (Object.keys(errors).length) return
    const input: EsimInput = { accountId: Number(accountId), imsi }
    if (userId) input.userId = Number(userId)
    const textFields = ['name', 'token', 'networkstatus', 'smdpserver', 'activationcode', 'imei', 'imeiDevice'] as const
    textFields.forEach((field) => { const value = optionalText(form[field]); if (value !== undefined) input[field] = value })
    if (balance) input.balance = Number(balance)
    const createdate = optionalDateTime(form.createdate); if (createdate !== undefined) input.createdate = createdate
    if (form.isesim) input.isesim = form.isesim === 'true'
    if (form.useAccountForCharging) input.useAccountForCharging = form.useAccountForCharging === 'true'
    if (form.allowData) input.allowData = form.allowData === 'true'
    await onSubmit(input)
  }
  return <Dialog open={open} onOpenChange={(nextOpen) => { if (!saving) onOpenChange(nextOpen) }}><DialogContent className="max-w-3xl"><DialogHeader className="flex-row items-start justify-between gap-x-4"><div><DialogTitle className="text-2xl">{mode === 'add' ? 'Add eSIM' : 'Edit eSIM'}</DialogTitle><DialogDescription className="mt-2">Configure account, provisioning, and charging details.</DialogDescription></div><DialogClose asChild><Button type="button" variant="ghost" disabled={saving} aria-label="Close dialog" className="shrink-0"><RiCloseLine className="size-5" aria-hidden="true" /></Button></DialogClose></DialogHeader><form onSubmit={handleSubmit} noValidate><div className="grid gap-5 py-6 sm:grid-cols-2">
    <FormSelect label="Account" name="accountId" value={form.accountId} required saving={saving} error={fieldErrors.accountId} onChange={(value) => updateField('accountId', value)}><option value="" disabled>Select an account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} (ID: {account.id})</option>)}{esim && !accounts.some((account) => account.id === esim.accountId) && <option value={esim.accountId}>Account #{esim.accountId}</option>}</FormSelect>
    <FormSelect label="User" name="userId" value={form.userId} saving={saving} error={fieldErrors.userId} onChange={(value) => updateField('userId', value)}><option value="">Unassigned</option>{users.map((user) => <option key={user.id} value={user.id}>{user.email}</option>)}</FormSelect>
    <FormInput label="IMSI" name="imsi" value={form.imsi} maxLength={255} required saving={saving} error={fieldErrors.imsi} onChange={(value) => updateField('imsi', value)} />
    <FormInput label="Name" name="name" value={form.name} saving={saving} onChange={(value) => updateField('name', value)} />
    <FormInput label="Token" name="token" value={form.token} maxLength={8} saving={saving} error={fieldErrors.token} onChange={(value) => updateField('token', value)} />
    <FormInput label="Network status" name="networkstatus" value={form.networkstatus} saving={saving} onChange={(value) => updateField('networkstatus', value)} />
    <FormInput label="Balance" name="balance" type="number" step="any" value={form.balance} saving={saving} error={fieldErrors.balance} onChange={(value) => updateField('balance', value)} />
    <FormInput label="Created date" name="createdate" type="datetime-local" value={form.createdate} saving={saving} onChange={(value) => updateField('createdate', value)} />
    <FormInput label="SMDP server" name="smdpserver" value={form.smdpserver} saving={saving} onChange={(value) => updateField('smdpserver', value)} />
    <FormInput label="Activation code" name="activationcode" value={form.activationcode} saving={saving} onChange={(value) => updateField('activationcode', value)} />
    <FormInput label="IMEI" name="imei" value={form.imei} saving={saving} onChange={(value) => updateField('imei', value)} />
    <FormInput label="IMEI device" name="imeiDevice" value={form.imeiDevice} saving={saving} onChange={(value) => updateField('imeiDevice', value)} />
    <FormSelect label="Is eSIM" name="isesim" value={form.isesim} saving={saving} onChange={(value) => updateField('isesim', value as OptionalBoolean)}><option value="">Not set</option><option value="true">Yes</option><option value="false">No</option></FormSelect>
    <FormSelect label="Use account for charging" name="useAccountForCharging" value={form.useAccountForCharging} saving={saving} onChange={(value) => updateField('useAccountForCharging', value as OptionalBoolean)}><option value="">Not set</option><option value="true">Yes</option><option value="false">No</option></FormSelect>
    <FormSelect label="Allow data" name="allowData" value={form.allowData} saving={saving} onChange={(value) => updateField('allowData', value as OptionalBoolean)}><option value="">Not set</option><option value="true">Yes</option><option value="false">No</option></FormSelect>
  </div>{error && <div role="alert" className="mb-5 rounded-md border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}<DialogFooter><DialogClose asChild><Button type="button" variant="secondary" disabled={saving}>Cancel</Button></DialogClose><Button type="submit" isLoading={saving} loadingText="Saving">{mode === 'add' ? 'Add eSIM' : 'Save changes'}</Button></DialogFooter></form></DialogContent></Dialog>
}

type FormInputProps = { label: string; name: string; type?: string; value: string; required?: boolean; saving: boolean; error?: string; min?: string; step?: string; maxLength?: number; onChange: (value: string) => void }
function FormInput({ label, name, type = 'text', value, required, saving, error, min, step, maxLength, onChange }: FormInputProps) { const errorId = error ? `${name}-error` : undefined; return <label className="grid gap-2"><span className="text-sm font-medium text-gray-200">{label}</span><Input name={name} type={type} value={value} required={required} disabled={saving} min={min} step={step} maxLength={maxLength} hasError={Boolean(error)} aria-invalid={Boolean(error)} aria-describedby={errorId} onChange={(event) => onChange(event.target.value)} />{error && <span id={errorId} className="text-sm text-red-400">{error}</span>}</label> }
type FormSelectProps = { label: string; name: string; value: string; required?: boolean; saving: boolean; error?: string; onChange: (value: string) => void; children: ReactNode }
function FormSelect({ label, name, value, required, saving, error, onChange, children }: FormSelectProps) { const errorId = error ? `${name}-error` : undefined; return <label className="grid gap-2"><span className="text-sm font-medium text-gray-200">{label}</span><SelectNative name={name} value={value} required={required} disabled={saving} hasError={Boolean(error)} aria-invalid={Boolean(error)} aria-describedby={errorId} onChange={(event) => onChange(event.target.value)}>{children}</SelectNative>{error && <span id={errorId} className="text-sm text-red-400">{error}</span>}</label> }
