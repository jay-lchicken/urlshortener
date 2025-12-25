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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CreateNewLinkButton() {
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const [baseUrl, setBaseUrl] = useState(origin)
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const link = (formData.get("link") as string)?.trim()
      const tag = (formData.get("tag") as string)?.trim()
      const description = (formData.get("description") as string)?.trim()
      const selectedBaseUrl = (formData.get("baseUrl") as string)?.trim()

      if (!link || !tag) {
        toast.error("Please enter a link and a tag.")
        return
      }
      if (!link.startsWith("http")) {
        toast.error("Please enter a valid link.")
        return
      }

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, tag, description, baseUrl: selectedBaseUrl }),
      })

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        toast.error(errorBody?.error ?? "Failed to create link.")
        return
      }
      window.location.reload()

      toast.success("Link created.")
      setOpen(false)
    } catch (error) {
      console.error("Failed to submit link", error)
      toast.error("Failed to create link.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Create New Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>New Link</DialogTitle>
            <DialogDescription>
              Enter the link details below to create a new shortened link.
            </DialogDescription>
          </DialogHeader>
        <form onSubmit={handleSubmit} id={"create-link-form"} >
          <input type="hidden" name="baseUrl" value={baseUrl} />

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="link-1">Original Link</Label>
              <Input
                id="link-1"
                name="link"
                placeholder="https://helloworldexample.com"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="tag-1">URL Tag</Label>
              <div className="flex flex-row gap-2">
                <Select value={baseUrl} onValueChange={setBaseUrl}>
                  <SelectTrigger>
                    <SelectValue placeholder="URL" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={origin}>{origin}</SelectItem>
                  </SelectContent>
                </Select>
                <span className="mt-1">/</span>
                <Input id="tag-1" name="tag" placeholder="example" />
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description-1">Description (optional)</Label>
              <Input
                id="description-1"
                name="description"
                placeholder="A short description for this link"
              />
            </div>
                  </div>


        </form>
        <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting} form={"create-link-form"}>
              Save changes
            </Button>
          </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}
