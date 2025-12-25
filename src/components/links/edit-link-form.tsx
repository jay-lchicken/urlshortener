"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EditLinkFormProps = {
  linkId: number
  originalUrl: string
  tag: string
  description: string | null
  baseUrl: string
}

export function EditLinkForm({
  linkId,
  originalUrl,
  tag,
  description,
  baseUrl,
}: EditLinkFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [linkValue, setLinkValue] = useState(originalUrl)
  const [tagValue, setTagValue] = useState(tag)
  const [descriptionValue, setDescriptionValue] = useState(description ?? "")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const trimmedLink = linkValue.trim()
    const trimmedTag = tagValue.trim()
    const trimmedDescription = descriptionValue.trim()

    if (!trimmedLink || !trimmedTag) {
      toast.error("Please enter a link and a tag.")
      setIsSubmitting(false)
      return
    }
    if (!trimmedLink.startsWith("http")) {
      toast.error("Please enter a valid link.")
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch(`/api/links/${linkId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link: trimmedLink,
          tag: trimmedTag,
          description: trimmedDescription,
          baseUrl,
        }),
      })

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        toast.error(errorBody?.error ?? "Failed to update link.")
        return
      }

      toast.success("Link updated.")
      router.push("/links")
      router.refresh()
    } catch (error) {
      console.error("Failed to update link", error)
      toast.error("Failed to update link.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="edit-link">Original Link</Label>
        <Input
          id="edit-link"
          name="link"
          value={linkValue}
          onChange={(event) => setLinkValue(event.target.value)}
          placeholder="https://helloworldexample.com"
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="edit-tag">URL Tag</Label>
        <Input
          id="edit-tag"
          name="tag"
          value={tagValue}
          onChange={(event) => setTagValue(event.target.value)}
          placeholder="example"
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="edit-description">Description (optional)</Label>
        <Input
          id="edit-description"
          name="description"
          value={descriptionValue}
          onChange={(event) => setDescriptionValue(event.target.value)}
          placeholder="A short description for this link"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Save changes
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/links")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
