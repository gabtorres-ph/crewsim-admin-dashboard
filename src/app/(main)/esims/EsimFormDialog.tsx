"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/Button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/Dialog"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Checkbox } from "@/components/Checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { fetchAccountOptionsAction } from "../accounts/actions"
import { createEsimAction, saveEsimAction } from "./actions"
import type { EsimSaveActionResult } from "./actions"
import type { EsimCreate, EsimMoveFailure, EsimMoveResult, EsimRead } from "./types"

function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (number: number) => String(number).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function normalizeNullableString(value: string): string | null | undefined {
  const normalized = value.trim()
  if (!normalized) return value ? undefined : null
  return normalized.length <= 255 ? normalized : undefined
}

function normalizeNullableInteger(value: string): number | null | undefined {
  if (!value) return null
  const normalized = Number(value)
  return Number.isInteger(normalized) ? normalized : undefined
}

function normalizeNullableDatetime(value: string): string | null | undefined {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

type AccountOption = { id: number; name: string }

function describeMoveFailure(failure: EsimMoveFailure | undefined): string {
  if (!failure) return "The transfer outcome is unknown."
  if (failure.status === 422 && Array.isArray(failure.detail)) {
    return failure.detail.map((issue) => issue.msg).join("; ")
  }
  if (
    failure.status === 502 &&
    Array.isArray(failure.detail.moved_imsis) &&
    typeof failure.detail.failed_imsi === "string" &&
    Array.isArray(failure.detail.not_attempted_imsis)
  ) {
    const { moved_imsis, failed_imsi, not_attempted_imsis } = failure.detail
    return [
      `Completed: ${moved_imsis.length ? moved_imsis.join(", ") : "none"}.`,
      `Failed: ${failed_imsi}.`,
      `Not attempted: ${not_attempted_imsis.length ? not_attempted_imsis.join(", ") : "none"}.`,
    ].join(" ")
  }
  if (failure.status === 502) return failure.detail.message
  return typeof failure.detail === "string" ? failure.detail : failure.detail.map((issue) => issue.msg).join("; ")
}

function describeSaveFailure(result: EsimSaveActionResult): string {
  if (result.move.status === "failed") {
    return `${result.move.error} ${describeMoveFailure(result.move.failure)} Refresh the page before retrying.`
  }
  if (result.update.status === "failed" && result.move.status === "completed") {
    return `Account transfer completed. The remaining eSIM changes were not saved: ${result.update.error}. You can save again to retry only the remaining changes.`
  }
  return result.update.status === "failed" ? result.update.error : "The eSIM could not be saved."
}

type EsimFormDialogProps = {
  mode: "create" | "edit"
  esim?: EsimRead
  open: boolean
  onOpenChange: (open: boolean) => void
  onMoveCompleted?: (results: EsimMoveResult[]) => void
}

export function EsimFormDialog({ mode, esim, open, onOpenChange, onMoveCompleted }: EsimFormDialogProps) {
  const router = useRouter()
  const [accountId, setAccountId] = useState("")
  const [savedAccountId, setSavedAccountId] = useState<number>()
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
  const [accountsError, setAccountsError] = useState<string>()
  const [accountLoadAttempt, setAccountLoadAttempt] = useState(0)
  const [reconciliationRequired, setReconciliationRequired] = useState(false)
  const [imsi, setImsi] = useState("")
  const [name, setName] = useState("")
  const [token, setToken] = useState("")
  const [charging, setCharging] = useState(false)
  const [mobilePlanId, setMobilePlanId] = useState("")
  const [activationDate, setActivationDate] = useState("")
  const [lastUsageDate, setLastUsageDate] = useState("")
  const [subscriberStatus, setSubscriberStatus] = useState("")
  const [lastNetworkDate, setLastNetworkDate] = useState("")
  const [lastMcc, setLastMcc] = useState("")
  const [lastMnc, setLastMnc] = useState("")
  const [lastCellId, setLastCellId] = useState("")
  const [lastLac, setLastLac] = useState("")
  const [lastRat, setLastRat] = useState("")
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setAccountId(esim?.account_id.toString() ?? "")
    setSavedAccountId(esim?.account_id)
    setImsi(esim?.imsi ?? "")
    setName(esim?.name ?? "")
    setToken(esim?.token ?? "")
    setCharging(esim?.use_account_for_charging ?? false)
    setMobilePlanId(esim?.mobileplanid?.toString() ?? "")
    setActivationDate(toDateTimeLocal(esim?.activationdate))
    setLastUsageDate(toDateTimeLocal(esim?.lastusagedate))
    setSubscriberStatus(esim?.subscriber_status ?? "")
    setLastNetworkDate(toDateTimeLocal(esim?.lastnetworkdate))
    setLastMcc(esim?.lastmcc ?? "")
    setLastMnc(esim?.lastmnc ?? "")
    setLastCellId(esim?.lastcellid?.toString() ?? "")
    setLastLac(esim?.lastlac?.toString() ?? "")
    setLastRat(esim?.lastrat ?? "")
    setError(undefined)
    setReconciliationRequired(false)
  }, [esim, open])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setIsLoadingAccounts(true)
    setAccountsError(undefined)

    void fetchAccountOptionsAction().then((result) => {
      if (cancelled) return
      if (result.ok) setAccounts(result.accounts)
      else setAccountsError(result.error)
      setIsLoadingAccounts(false)
    }).catch(() => {
      if (cancelled) return
      setAccountsError("Could not load accounts.")
      setIsLoadingAccounts(false)
    })

    return () => { cancelled = true }
  }, [accountLoadAttempt, open])

  const sortedAccounts = [...accounts].sort(
    (left, right) => left.name.localeCompare(right.name) || left.id - right.id,
  )
  const selectedAccountExists = sortedAccounts.some((account) => account.id === Number(accountId))
  const currentAccountMissing =
    mode === "edit" &&
    savedAccountId !== undefined &&
    !isLoadingAccounts &&
    !accountsError &&
    !sortedAccounts.some((account) => account.id === savedAccountId)
  const accountSelectionUnavailable =
    isLoadingAccounts ||
    Boolean(accountsError) ||
    sortedAccounts.length === 0 ||
    !selectedAccountExists ||
    reconciliationRequired

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (reconciliationRequired) return setError("Refresh the page and reopen this eSIM before attempting another account transfer.")
    const normalizedAccountId = Number(accountId)
    const normalizedImsi = imsi.trim()
    const normalizedName = name.trim()
    const normalizedToken = token.trim()
    const mobileplanid = normalizeNullableInteger(mobilePlanId)
    const lastcellid = normalizeNullableInteger(lastCellId)
    const lastlac = normalizeNullableInteger(lastLac)
    const activationdate = normalizeNullableDatetime(activationDate)
    const lastusagedate = normalizeNullableDatetime(lastUsageDate)
    const lastnetworkdate = normalizeNullableDatetime(lastNetworkDate)
    const subscriber_status = normalizeNullableString(subscriberStatus)
    const lastmcc = normalizeNullableString(lastMcc)
    const lastmnc = normalizeNullableString(lastMnc)
    const lastrat = normalizeNullableString(lastRat)
    if (!selectedAccountExists) return setError("Select an existing account.")
    if (currentAccountMissing && normalizedAccountId === savedAccountId) return setError("The current account is unavailable. Select another account.")
    if (!normalizedImsi || normalizedImsi.length > 255) return setError("IMSI is required and must be 255 characters or fewer.")
    if (normalizedName.length > 255 || (normalizedName.length === 0 && name.length > 0)) return setError("Name must be between 1 and 255 characters when provided.")
    if (normalizedToken.length > 8) return setError("Token must be 8 characters or fewer.")
    if ([mobileplanid, lastcellid, lastlac].some((value) => value === undefined)) return setError("Mobile plan ID, last cell ID, and last LAC must be integers when provided.")
    if ([activationdate, lastusagedate, lastnetworkdate].some((value) => value === undefined)) return setError("Dates must be valid dates and times.")
    if ([subscriber_status, lastmcc, lastmnc, lastrat].some((value) => value === undefined)) return setError("Subscriber status, MCC, MNC, and RAT must contain 1 to 255 characters when provided.")
    const input: EsimCreate = { account_id: normalizedAccountId, imsi: normalizedImsi, name: normalizedName || null, token: normalizedToken || null, use_account_for_charging: charging, mobileplanid, activationdate, lastusagedate, subscriber_status, lastnetworkdate, lastmcc, lastmnc, lastcellid, lastlac, lastrat }
    setError(undefined)
    startTransition(() => { void (async () => {
      if (mode === "create") {
        const result = await createEsimAction(input)
        if (!result.ok) return setError(result.error)
      } else {
        if (!esim || savedAccountId === undefined) return setError("The saved eSIM is unavailable. Close and reopen the dialog.")
        const result = await saveEsimAction({ ...esim, account_id: savedAccountId }, input)
        if (result.move.status === "completed") {
          setSavedAccountId(result.move.results[0].account_id)
          onMoveCompleted?.(result.move.results)
        }
        if (!result.ok) {
          if (result.reconciliationRequired) {
            setReconciliationRequired(true)
            router.refresh()
          }
          return setError(describeSaveFailure(result))
        }
      }
      onOpenChange(false)
      router.refresh()
    })() })
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><form onSubmit={submit}><DialogHeader>
    <DialogTitle>{mode === "create" ? "Add eSIM" : "Edit eSIM"}</DialogTitle>
    <DialogDescription className="mt-1 text-sm leading-6">Changes are sent to the Core API immediately.</DialogDescription>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Field label="Account ID" id="esim-account-id"><Select value={accountId} onValueChange={(value) => { setAccountId(value); setError(undefined) }} disabled={isPending || isLoadingAccounts || reconciliationRequired}><SelectTrigger id="esim-account-id" aria-describedby="esim-account-help"><SelectValue placeholder={isLoadingAccounts ? "Loading accounts…" : "Select an account"} /></SelectTrigger><SelectContent>{currentAccountMissing && <SelectItem value={String(savedAccountId)} disabled>Current account unavailable (ID: {savedAccountId})</SelectItem>}{sortedAccounts.map((account) => <SelectItem key={account.id} value={String(account.id)}>{account.name || "Unnamed account"} (ID: {account.id})</SelectItem>)}</SelectContent></Select><div id="esim-account-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">{isLoadingAccounts ? "Loading available accounts…" : accountsError ? <><span>{accountsError}</span><Button type="button" variant="ghost" className="ml-2 px-1 py-0" onClick={() => setAccountLoadAttempt((attempt) => attempt + 1)} disabled={isPending}>Retry</Button></> : sortedAccounts.length === 0 ? "No accounts are available. Create or refresh an account, then try again." : currentAccountMissing ? "The current account is unavailable. Select another account before saving." : "Select the account for this eSIM."}</div></Field>
      <Field label="IMSI" id="esim-imsi"><Input id="esim-imsi" value={imsi} onChange={(event) => setImsi(event.target.value)} className="mt-2" disabled={isPending} /></Field>
    </div>
    <Field label="Name" id="esim-name" className="mt-4"><Input id="esim-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Optional label" className="mt-2" disabled={isPending} autoFocus /></Field>
    <Field label="Token" id="esim-token" className="mt-4"><Input id="esim-token" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Optional, max 8 characters" className="mt-2" disabled={isPending} /></Field>
    <label className="mt-4 flex items-center gap-2 text-sm"><Checkbox checked={charging} onCheckedChange={(checked) => setCharging(checked === true)} disabled={isPending} />Use account for charging</label>
    <fieldset className="mt-6 border-t pt-4"><legend className="text-sm font-semibold">Plan and network activity</legend><div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Field label="Mobile plan ID" id="esim-mobile-plan-id"><Input id="esim-mobile-plan-id" type="number" step="1" value={mobilePlanId} onChange={(event) => setMobilePlanId(event.target.value)} disabled={isPending} /></Field>
      <Field label="Subscriber status" id="esim-subscriber-status"><Input id="esim-subscriber-status" value={subscriberStatus} onChange={(event) => setSubscriberStatus(event.target.value)} maxLength={255} disabled={isPending} /></Field>
      <Field label="Activation date" id="esim-activation-date"><Input id="esim-activation-date" type="datetime-local" value={activationDate} onChange={(event) => setActivationDate(event.target.value)} disabled={isPending} /></Field>
      <Field label="Last usage date" id="esim-last-usage-date"><Input id="esim-last-usage-date" type="datetime-local" value={lastUsageDate} onChange={(event) => setLastUsageDate(event.target.value)} disabled={isPending} /></Field>
      <Field label="Last network date" id="esim-last-network-date"><Input id="esim-last-network-date" type="datetime-local" value={lastNetworkDate} onChange={(event) => setLastNetworkDate(event.target.value)} disabled={isPending} /></Field>
      <Field label="Last MCC" id="esim-last-mcc"><Input id="esim-last-mcc" value={lastMcc} onChange={(event) => setLastMcc(event.target.value)} maxLength={255} disabled={isPending} /></Field>
      <Field label="Last MNC" id="esim-last-mnc"><Input id="esim-last-mnc" value={lastMnc} onChange={(event) => setLastMnc(event.target.value)} maxLength={255} disabled={isPending} /></Field>
      <Field label="Last RAT" id="esim-last-rat"><Input id="esim-last-rat" value={lastRat} onChange={(event) => setLastRat(event.target.value)} maxLength={255} disabled={isPending} /></Field>
      <Field label="Last cell ID" id="esim-last-cell-id"><Input id="esim-last-cell-id" type="number" step="1" value={lastCellId} onChange={(event) => setLastCellId(event.target.value)} disabled={isPending} /></Field>
      <Field label="Last LAC" id="esim-last-lac"><Input id="esim-last-lac" type="number" step="1" value={lastLac} onChange={(event) => setLastLac(event.target.value)} disabled={isPending} /></Field>
    </div></fieldset>
    {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </DialogHeader><DialogFooter className="mt-6"><DialogClose asChild><Button type="button" variant="secondary" className="mt-2 w-full sm:mt-0 sm:w-fit" disabled={isPending}>Cancel</Button></DialogClose><Button type="submit" className="w-full sm:w-fit" disabled={accountSelectionUnavailable} isLoading={isPending} loadingText="Saving">{mode === "create" ? "Add eSIM" : "Save changes"}</Button></DialogFooter></form></DialogContent></Dialog>
}

function Field({ label, id, className, children }: { label: string; id: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><Label htmlFor={id} className="font-medium">{label}</Label><div className="mt-2">{children}</div></div>
}
