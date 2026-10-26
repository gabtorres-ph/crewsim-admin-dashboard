"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/Dialog"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { createUserAction, fetchUserFormOptionsAction, updateUserAction } from "./actions"
import type { UserRead } from "./types"

type UserFormDialogProps = {
  mode: "create" | "edit"
  user?: UserRead
  open: boolean
  onOpenChange: (open: boolean) => void
}

type LanguageOption = { id: number; name: string; iso1: string | null }
type CurrencyOption = { id: number; name: string; code: string }
type TimezoneOption = { name: string }

export function UserFormDialog({ mode, user, open, onOpenChange }: UserFormDialogProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [languageIso1, setLanguageIso1] = useState("")
  const [currencyCode, setCurrencyCode] = useState("")
  const [timezone, setTimezone] = useState("")
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [newsletter, setNewsletter] = useState(false)
  const [smsnotification, setSmsnotification] = useState(false)
  const [languages, setLanguages] = useState<LanguageOption[]>([])
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
  const [timezones, setTimezones] = useState<TimezoneOption[]>([])
  const [optionsError, setOptionsError] = useState<string>()
  const [optionLoadAttempt, setOptionLoadAttempt] = useState(0)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setEmail(user?.email ?? "")
    setLanguageIso1(user?.lang_iso1 ?? "")
    setCurrencyCode(user?.currency_code ?? "")
    setTimezone(user?.timezone ?? "")
    setFirstname(user?.firstname ?? "")
    setLastname(user?.lastname ?? "")
    setNewsletter(user?.newsletter ?? false)
    setSmsnotification(user?.smsnotification ?? false)
    setError(undefined)
  }, [open, user])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setIsLoadingOptions(true)
    setOptionsError(undefined)

    void fetchUserFormOptionsAction()
      .then((result) => {
        if (cancelled) return
        if (result.ok) {
          setLanguages(result.languages)
          setCurrencies(result.currencies)
          setTimezones(result.timezones)
        } else {
          setOptionsError(result.error)
        }
      })
      .catch(() => {
        if (!cancelled) setOptionsError("Could not load language, currency, and timezone options.")
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOptions(false)
      })

    return () => { cancelled = true }
  }, [open, optionLoadAttempt])

  const sortedLanguages = [...languages].sort((left, right) => left.name.localeCompare(right.name))
  const sortedCurrencies = [...currencies].sort((left, right) => left.name.localeCompare(right.name))
  const sortedTimezones = [...timezones].sort((left, right) => left.name.localeCompare(right.name))
  const languageAvailable = sortedLanguages.some((language) => language.iso1 === languageIso1)
  const currencyAvailable = sortedCurrencies.some((currency) => currency.code === currencyCode)
  const timezoneAvailable = sortedTimezones.some((option) => option.name === timezone)
  const hasSelectableLanguage = languages.some((language) => language.iso1?.trim().length === 2)
  const optionsUnavailable = isLoadingOptions || Boolean(optionsError) || !hasSelectableLanguage || !currencies.length || !timezones.length

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = {
      email: email.trim(),
      lang_iso1: languageIso1.trim(),
      currency_code: currencyCode.trim(),
      timezone: timezone.trim(),
    }
    if (!values.email || !values.lang_iso1 || !values.currency_code || !values.timezone) {
      return setError("Email, language, currency, and timezone are required.")
    }
    if (values.email.length > 255 || values.timezone.length > 255) {
      return setError("Email and timezone must be 255 characters or fewer.")
    }
    if (values.lang_iso1.length !== 2) return setError("Select a language with a two-character ISO code.")
    if (values.currency_code.length !== 3) return setError("Select a currency with a three-character code.")
    if (!languageAvailable || !currencyAvailable || !timezoneAvailable) {
      return setError("Select an available language, currency, and timezone.")
    }
    if (firstname.trim().length > 255 || lastname.trim().length > 255) {
      return setError("Names must be 255 characters or fewer.")
    }

    setError(undefined)
    startTransition(() => {
      void (async () => {
        const input = {
          ...values,
          firstname: firstname.trim() || null,
          lastname: lastname.trim() || null,
          newsletter,
          smsnotification,
        }
        const result = mode === "create" ? await createUserAction(input) : await updateUserAction(user!.id, input)
        if (!result.ok) return setError(result.error)
        onOpenChange(false)
        router.refresh()
      })()
    })
  }

  const selectDisabled = isPending || optionsUnavailable

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-2xl"><form onSubmit={submit}><DialogHeader>
    <DialogTitle>{mode === "create" ? "Add user" : "Edit user"}</DialogTitle>
    <DialogDescription className="mt-1 text-sm leading-6">Changes are sent to the Core API immediately.</DialogDescription>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Field id="user-email" label="Email"><Input id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@example.com" disabled={isPending} autoFocus /></Field>
      <Field id="user-language" label="Language"><Select value={languageIso1} onValueChange={(value) => { setLanguageIso1(value); setError(undefined) }} disabled={selectDisabled}><SelectTrigger id="user-language"><SelectValue placeholder={isLoadingOptions ? "Loading languages…" : "Select a language"} /></SelectTrigger><SelectContent>{languageIso1 && !languageAvailable && <SelectItem value={languageIso1} disabled>Current language unavailable ({languageIso1})</SelectItem>}{sortedLanguages.map((language) => language.iso1 ? <SelectItem key={language.id} value={language.iso1}>{language.name} ({language.iso1})</SelectItem> : <SelectItem key={language.id} value={`missing-iso1-${language.id}`} disabled>{language.name} (ISO code unavailable)</SelectItem>)}</SelectContent></Select></Field>
      <Field id="user-currency" label="Currency"><Select value={currencyCode} onValueChange={(value) => { setCurrencyCode(value); setError(undefined) }} disabled={selectDisabled}><SelectTrigger id="user-currency"><SelectValue placeholder={isLoadingOptions ? "Loading currencies…" : "Select a currency"} /></SelectTrigger><SelectContent>{currencyCode && !currencyAvailable && <SelectItem value={currencyCode} disabled>Current currency unavailable ({currencyCode})</SelectItem>}{sortedCurrencies.map((currency) => <SelectItem key={currency.id} value={currency.code}>{currency.name} ({currency.code})</SelectItem>)}</SelectContent></Select></Field>
      <Field id="user-timezone" label="Timezone"><Select value={timezone} onValueChange={(value) => { setTimezone(value); setError(undefined) }} disabled={selectDisabled}><SelectTrigger id="user-timezone"><SelectValue placeholder={isLoadingOptions ? "Loading timezones…" : "Select a timezone"} /></SelectTrigger><SelectContent>{timezone && !timezoneAvailable && <SelectItem value={timezone} disabled>Current timezone unavailable ({timezone})</SelectItem>}{sortedTimezones.map((option) => <SelectItem key={option.name} value={option.name}>{option.name}</SelectItem>)}</SelectContent></Select></Field>
      <Field id="user-firstname" label="First name"><Input id="user-firstname" value={firstname} onChange={(event) => setFirstname(event.target.value)} placeholder="Optional" disabled={isPending} /></Field>
      <Field id="user-lastname" label="Last name"><Input id="user-lastname" value={lastname} onChange={(event) => setLastname(event.target.value)} placeholder="Optional" disabled={isPending} /></Field>
    </div>
    <fieldset className="mt-5">
      <legend className="text-sm font-medium text-gray-900 dark:text-gray-50">Notifications</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2"><Checkbox id="user-newsletter" checked={newsletter} onCheckedChange={(checked) => setNewsletter(checked === true)} disabled={isPending} /><Label htmlFor="user-newsletter">Newsletter</Label></div>
        <div className="flex items-center gap-2"><Checkbox id="user-smsnotification" checked={smsnotification} onCheckedChange={(checked) => setSmsnotification(checked === true)} disabled={isPending} /><Label htmlFor="user-smsnotification">SMS notifications</Label></div>
      </div>
    </fieldset>
    {optionsError && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{optionsError}<Button type="button" variant="ghost" className="ml-2 px-1 py-0" onClick={() => setOptionLoadAttempt((attempt) => attempt + 1)} disabled={isPending}>Retry</Button></p>}
    {!isLoadingOptions && !optionsError && (!hasSelectableLanguage || !currencies.length || !timezones.length) && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">Language, currency, and timezone options must all be available before a user can be saved.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </DialogHeader><DialogFooter className="mt-6"><DialogClose asChild><Button type="button" variant="secondary" className="mt-2 w-full sm:mt-0 sm:w-fit" disabled={isPending}>Cancel</Button></DialogClose><Button type="submit" className="w-full sm:w-fit" disabled={isPending || optionsUnavailable} isLoading={isPending} loadingText="Saving">{mode === "create" ? "Add user" : "Save changes"}</Button></DialogFooter></form></DialogContent></Dialog>
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div><Label htmlFor={id} className="font-medium">{label}</Label><div className="mt-2">{children}</div></div>
}
