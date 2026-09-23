"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/Button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"

import { createAccountAction, updateAccountAction } from "./actions"
import type { AccountRead } from "./types"

type AccountFormDialogProps = {
  mode: "create" | "edit"
  account?: AccountRead
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountFormDialog({
  mode,
  account,
  open,
  onOpenChange,
}: AccountFormDialogProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [balance, setBalance] = useState("")
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setName(account?.name ?? "")
    setBalance(account?.balance.toString() ?? "0")
    setError(undefined)
  }, [account, open])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = name.trim()
    const normalizedBalance = Number(balance)

    if (!normalizedName) {
      setError("Account name is required.")
      return
    }

    if (!Number.isFinite(normalizedBalance)) {
      setError("Balance must be a valid number.")
      return
    }

    setError(undefined)
    startTransition(() => {
      void (async () => {
        const result =
          mode === "create"
            ? await createAccountAction({
                name: normalizedName,
                balance: normalizedBalance,
              })
            : await updateAccountAction(account!.id, {
                name: normalizedName,
                balance: normalizedBalance,
              })

        if (!result.ok) {
          setError(result.error)
          return
        }

        onOpenChange(false)
        router.refresh()
      })()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add account" : "Edit account"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Changes are sent to the local Core API immediately.
            </DialogDescription>
            <div className="mt-4">
              <Label htmlFor="account-name" className="font-medium">
                Name
              </Label>
              <Input
                id="account-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme account"
                className="mt-2"
                disabled={isPending}
                autoFocus
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="account-balance" className="font-medium">
                Balance
              </Label>
              <Input
                id="account-balance"
                type="number"
                step="any"
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                className="mt-2"
                disabled={isPending}
              />
            </div>
            {error && (
              <p
                role="alert"
                className="mt-3 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}
          </DialogHeader>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button
                type="button"
                className="mt-2 w-full sm:mt-0 sm:w-fit"
                variant="secondary"
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="w-full sm:w-fit"
              isLoading={isPending}
              loadingText="Saving"
            >
              {mode === "create" ? "Add account" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
