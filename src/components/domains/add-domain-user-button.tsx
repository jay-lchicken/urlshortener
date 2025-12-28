"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

export function AddDomainUserButton({ domainId }: { domainId: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = (formData.get("email") as string)?.trim()

      if (!email) {
        toast.error("Please enter a email.")
        return
      }

      const res = await fetch(`/api/domains/${domainId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      })

      const body = await res.json().catch(() => null)

      if (!res.ok) {
        toast.error(body?.error ?? "Failed to add user.")
        return
      }

      if (body?.added === false) {
        toast.error(body?.message ?? "User already has access.")
        return
      }

      toast.success("User added to domain.")
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to add domain user", error)
      toast.error("Failed to add user.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            Add a user to this domain by their registered email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="add-domain-user-form">
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="user-id-input">Email</Label>
              <Input
                id="user-email-input"
                name="email"
                placeholder="example@example.com"
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            form="add-domain-user-form"
          >
            Add user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
