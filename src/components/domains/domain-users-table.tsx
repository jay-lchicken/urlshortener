"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export type DomainUserRow = {
  userId: string
  email: string | null
  isOwner: boolean
}

type DomainUsersTableProps = {
  data: DomainUserRow[]
  domainId: number
  isAdmin: boolean
}

export function DomainUsersTable({
  data,
  domainId,
  isAdmin,
}: DomainUsersTableProps) {
  const router = useRouter()
  const [removeDialogUserId, setRemoveDialogUserId] = useState<string | null>(
    null
  )
  const [transferDialogUserId, setTransferDialogUserId] = useState<string | null>(
    null
  )
  const [processingUserId, setProcessingUserId] = useState<string | null>(null)
  const [processingAction, setProcessingAction] = useState<
    "remove" | "transfer" | null
  >(null)

  async function handleRemove(userId: string) {
    setProcessingUserId(userId)
    setProcessingAction("remove")
    try {
      const res = await fetch(`/api/domains/${domainId}/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.error ?? "Failed to remove member.")
        return
      }
      toast.success("Member removed.")
      setRemoveDialogUserId(null)
      router.refresh()
    } catch (error) {
      console.error("Failed to remove domain member", error)
      toast.error("Failed to remove member.")
    } finally {
      setProcessingUserId(null)
      setProcessingAction(null)
    }
  }

  async function handleTransferOwnership(userId: string) {
    setProcessingUserId(userId)
    setProcessingAction("transfer")
    try {
      const res = await fetch(`/api/domains/${domainId}/owner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.error ?? "Failed to transfer ownership.")
        return
      }
      toast.success("Ownership transferred.")
      setTransferDialogUserId(null)
      router.refresh()
    } catch (error) {
      console.error("Failed to transfer ownership", error)
      toast.error("Failed to transfer ownership.")
    } finally {
      setProcessingUserId(null)
      setProcessingAction(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row) => (
              <TableRow key={row.userId}>
                <TableCell className="font-medium">
                  {row.email ?? (row.isOwner ? "Owner" : "Unknown user")}
                </TableCell>
                <TableCell>
                  {row.isOwner ? <Badge>Owner</Badge> : "Member"}
                </TableCell>
                <TableCell className="text-right">
                  {isAdmin && !row.isOwner ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <AlertDialog
                            open={transferDialogUserId === row.userId}
                            onOpenChange={(open) =>
                              setTransferDialogUserId(open ? row.userId : null)
                            }
                          >
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(event) => event.preventDefault()}
                              >
                                Transfer ownership
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Transfer ownership?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  The new owner will have full control, and you
                                  will lose admin access to this domain.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <Button
                                  loading={
                                    processingUserId === row.userId &&
                                    processingAction === "transfer"
                                  }
                                  onClick={() =>
                                    void handleTransferOwnership(row.userId)
                                  }
                                >
                                  Transfer ownership
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog
                            open={removeDialogUserId === row.userId}
                            onOpenChange={(open) =>
                              setRemoveDialogUserId(open ? row.userId : null)
                            }
                          >
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={(event) => event.preventDefault()}
                              >
                                Remove member
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remove this member?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This user will lose access to create links
                                  with this domain.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <Button
                                  variant="destructive"
                                  loading={
                                    processingUserId === row.userId &&
                                    processingAction === "remove"
                                  }
                                  onClick={() => void handleRemove(row.userId)}
                                >
                                  Remove member
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No users added yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
