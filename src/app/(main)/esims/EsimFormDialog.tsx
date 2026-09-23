"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/Button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/Dialog"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Checkbox } from "@/components/Checkbox"
import { createEsimAction, updateEsimAction } from "./actions"
import type { EsimRead } from "./types"

export function EsimFormDialog({ mode, esim, open, onOpenChange }: { mode: "create" | "edit"; esim?: EsimRead; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [accountId, setAccountId] = useState("")
  const [imsi, setImsi] = useState("")
  const [name, setName] = useState("")
  const [token, setToken] = useState("")
  const [charging, setCharging] = useState(false)
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setAccountId(esim?.account_id.toString() ?? "")
    setImsi(esim?.imsi ?? "")
    setName(esim?.name ?? "")
    setToken(esim?.token ?? "")
    setCharging(esim?.use_account_for_charging ?? false)
    setError(undefined)
  }, [esim, open])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedAccountId = Number(accountId)
    const normalizedImsi = imsi.trim()
    const normalizedName = name.trim()
    const normalizedToken = token.trim()
    if (!Number.isInteger(normalizedAccountId) || normalizedAccountId <= 0) return setError("Account ID must be a positive integer.")
    if (!normalizedImsi || normalizedImsi.length > 255) return setError("IMSI is required and must be 255 characters or fewer.")
    if (normalizedName.length > 255 || (normalizedName.length === 0 && name.length > 0)) return setError("Name must be between 1 and 255 characters when provided.")
    if (normalizedToken.length > 8) return setError("Token must be 8 characters or fewer.")
    setError(undefined)
    startTransition(() => { void (async () => {
      const result = mode === "create"
        ? await createEsimAction({ account_id: normalizedAccountId, imsi: normalizedImsi, name: normalizedName || null, token: normalizedToken || null, use_account_for_charging: charging })
        : await updateEsimAction(esim!.id, { account_id: normalizedAccountId, imsi: normalizedImsi, name: normalizedName || null, token: normalizedToken || null, use_account_for_charging: charging })
      if (!result.ok) return setError(result.error)
      onOpenChange(false)
      router.refresh()
    })() })
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg"><form onSubmit={submit}><DialogHeader>
    <DialogTitle>{mode === "create" ? "Add eSIM" : "Edit eSIM"}</DialogTitle>
    <DialogDescription className="mt-1 text-sm leading-6">Changes are sent to the Core API immediately.</DialogDescription>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div><Label htmlFor="esim-account-id" className="font-medium">Account ID</Label><Input id="esim-account-id" type="number" min="1" step="1" value={accountId} onChange={(event) => setAccountId(event.target.value)} className="mt-2" disabled={isPending} /></div>
      <div><Label htmlFor="esim-imsi" className="font-medium">IMSI</Label><Input id="esim-imsi" value={imsi} onChange={(event) => setImsi(event.target.value)} className="mt-2" disabled={isPending} /></div>
    </div>
    <div className="mt-4"><Label htmlFor="esim-name" className="font-medium">Name</Label><Input id="esim-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Optional label" className="mt-2" disabled={isPending} autoFocus /></div>
    <div className="mt-4"><Label htmlFor="esim-token" className="font-medium">Token</Label><Input id="esim-token" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Optional, max 8 characters" className="mt-2" disabled={isPending} /></div>
    <label className="mt-4 flex items-center gap-2 text-sm"><Checkbox checked={charging} onCheckedChange={(checked) => setCharging(checked === true)} disabled={isPending} />Use account for charging</label>
    {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </DialogHeader><DialogFooter className="mt-6"><DialogClose asChild><Button type="button" variant="secondary" className="mt-2 w-full sm:mt-0 sm:w-fit" disabled={isPending}>Cancel</Button></DialogClose><Button type="submit" className="w-full sm:w-fit" isLoading={isPending} loadingText="Saving">{mode === "create" ? "Add eSIM" : "Save changes"}</Button></DialogFooter></form></DialogContent></Dialog>
}
