"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createFavoriteAction } from "./actions"
import { Button } from "@/components/Button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/Dialog"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"

export function FavoriteFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [country, setCountry] = useState("")
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedUserId = Number(userId)
    const normalizedCountry = country.trim()

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      setError("User ID must be a positive integer.")
      return
    }
    if (normalizedCountry.length < 1 || normalizedCountry.length > 255) {
      setError("Country must contain between 1 and 255 characters.")
      return
    }

    setError(undefined)
    startTransition(() => {
      void (async () => {
        const result = await createFavoriteAction({
          user_id: normalizedUserId,
          country: normalizedCountry,
        })
        if (!result.ok) {
          setError(result.error)
          return
        }
        onOpenChange(false)
        setUserId("")
        setCountry("")
        router.refresh()
      })()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add favorite</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Changes are sent to the Core API immediately.
            </DialogDescription>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="favorite-user-id" className="font-medium">User ID</Label>
                <Input id="favorite-user-id" type="number" min="1" step="1" value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="1" className="mt-2" disabled={isPending} autoFocus />
              </div>
              <div>
                <Label htmlFor="favorite-country" className="font-medium">Country</Label>
                <Input id="favorite-country" value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Japan" className="mt-2" disabled={isPending} />
              </div>
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </DialogHeader>
          <DialogFooter className="mt-6">
            <DialogClose asChild><Button type="button" variant="secondary" className="mt-2 w-full sm:mt-0 sm:w-fit" disabled={isPending}>Cancel</Button></DialogClose>
            <Button type="submit" className="w-full sm:w-fit" isLoading={isPending} loadingText="Saving">Add favorite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
