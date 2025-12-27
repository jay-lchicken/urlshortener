"use client"

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
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CreateDomainButton({ cnameTarget }: { cnameTarget: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const host = (formData.get("host") as string)?.trim()

      if (!host) {
        toast.error("Please enter a domain.")
        return
      }

      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host }),
      })

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        toast.error(errorBody?.error ?? "Failed to add domain.")
        return
      }

      toast.success("Domain added.")
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to submit domain", error)
      toast.error("Failed to add domain.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Add New Domain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Domain</DialogTitle>
          <DialogDescription>
            Add a custom domain to use with your links.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="create-domain-form">
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="host-1">Domain</Label>
              <Input
                id="host-1"
                name="host"
                placeholder="links.example.com"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Set a CNAME from your domain to {cnameTarget || "your target"}
              . You will also add a TXT record after saving.
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
            form="create-domain-form"
          >
            Save domain
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
