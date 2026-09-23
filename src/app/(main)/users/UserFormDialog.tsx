"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/Button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/Dialog"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { createUserAction, updateUserAction } from "./actions"
import type { UserRead } from "./types"

type UserFormDialogProps = {
  mode: "create" | "edit"
  user?: UserRead
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserFormDialog({ mode, user, open, onOpenChange }: UserFormDialogProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [language, setLanguage] = useState("")
  const [currency, setCurrency] = useState("")
  const [timezone, setTimezone] = useState("")
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setEmail(user?.email ?? "")
    setLanguage(user?.language ?? "en")
    setCurrency(user?.currency ?? "USD")
    setTimezone(user?.timezone ?? "UTC")
    setFirstname(user?.firstname ?? "")
    setLastname(user?.lastname ?? "")
    setError(undefined)
  }, [open, user])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = { email: email.trim(), language: language.trim(), currency: currency.trim(), timezone: timezone.trim() }
    if (Object.values(values).some((value) => !value)) return setError("Email, language, currency, and timezone are required.")
    if (Object.values(values).some((value) => value.length > 255)) return setError("Required fields must be 255 characters or fewer.")
    if (firstname.length > 255 || lastname.length > 255) return setError("Names must be 255 characters or fewer.")

    setError(undefined)
    startTransition(() => {
      void (async () => {
        const input = { ...values, firstname: firstname.trim() || null, lastname: lastname.trim() || null }
        const result = mode === "create" ? await createUserAction(input) : await updateUserAction(user!.id, input)
        if (!result.ok) return setError(result.error)
        onOpenChange(false)
        router.refresh()
      })()
    })
  }

  const fields = [
    ["user-email", "Email", email, setEmail, "user@example.com"],
    ["user-language", "Language", language, setLanguage, "en"],
    ["user-currency", "Currency", currency, setCurrency, "USD"],
    ["user-timezone", "Timezone", timezone, setTimezone, "UTC"],
    ["user-firstname", "First name", firstname, setFirstname, "Optional"],
    ["user-lastname", "Last name", lastname, setLastname, "Optional"],
  ] as const

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-2xl"><form onSubmit={submit}><DialogHeader>
    <DialogTitle>{mode === "create" ? "Add user" : "Edit user"}</DialogTitle>
    <DialogDescription className="mt-1 text-sm leading-6">Changes are sent to the Core API immediately.</DialogDescription>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {fields.map(([id, label, value, setter, placeholder]) => <div key={id}><Label htmlFor={id} className="font-medium">{label}</Label><Input id={id} value={value} onChange={(event) => setter(event.target.value)} placeholder={placeholder} className="mt-2" disabled={isPending} autoFocus={id === "user-email"} /></div>)}
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </DialogHeader><DialogFooter className="mt-6"><DialogClose asChild><Button type="button" variant="secondary" className="mt-2 w-full sm:mt-0 sm:w-fit" disabled={isPending}>Cancel</Button></DialogClose><Button type="submit" className="w-full sm:w-fit" isLoading={isPending} loadingText="Saving">{mode === "create" ? "Add user" : "Save changes"}</Button></DialogFooter></form></DialogContent></Dialog>
}
