"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {AlertDialogTrigger} from "@radix-ui/react-alert-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../ui/alert-dialog"

type LinkRow = {
  id: number
  originalUrl: string
  tag: string
  description: string | null
  createdAt: string
}

export function LinksTable({ data }: { data: LinkRow[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  async function handleDelete(linkId: number) {

    setDeletingId(linkId)
    try {
      const res = await fetch(`/api/links/${linkId}`, { method: "DELETE" })
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        toast.error(errorBody?.error ?? "Failed to delete link.")
        return
      }

      toast.success("Link deleted.")
      setIsDeleteDialogOpen(false);
      router.refresh()
    } catch (error) {
      console.error("Failed to delete link", error)
      toast.error("Failed to delete link.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Tag</TableHead>
            <TableHead>Original URL</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  <Badge variant="outline">{row.tag}</Badge>
                </TableCell>
                <TableCell className="max-w-[360px] truncate">
                  <a
                    href={row.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {row.originalUrl}
                  </a>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.description || "—"}
                </TableCell>
                <TableCell className=" text-muted-foreground">
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell className="text-right flex flex-row gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Open</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href={`/links/${row.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/links/${row.id}/logs`}>
                            View Analytics
                          </Link>
                        </DropdownMenuItem>
                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => setIsDeleteDialogOpen(open)}>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(event) => event.preventDefault()}
                          >
                          Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will delete your link.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button loading={deletingId!=null} onClick={() => void handleDelete(row.id)} className="">
              Delete
            </Button>

        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No links yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
