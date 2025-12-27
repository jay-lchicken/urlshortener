"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type DomainRow = {
  id: number
  host: string
  verified: boolean
}

export function DomainsTable({
  data,
  cnameTarget,
}: {
  data: DomainRow[]
  cnameTarget: string
}) {
  const router = useRouter()
  const [verifyingId, setVerifyingId] = useState<number | null>(null)

  async function handleVerify(domainId: number) {
    setVerifyingId(domainId)
    try {
      const res = await fetch(`/api/domains/${domainId}/verify`, {
        method: "POST",
      })
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        toast.error(errorBody?.error ?? "Failed to verify domain.")
        return
      }
      toast.success("Domain verified.")
      router.refresh()
    } catch (error) {
      console.error("Failed to verify domain", error)
      toast.error("Failed to verify domain.")
    } finally {
      setVerifyingId(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Domain</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>DNS Records</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.host}</TableCell>
                <TableCell>
                  <Badge variant={row.verified ? "default" : "outline"}>
                    {row.verified ? "Verified" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div>
                    TXT <code>_linxy.{row.host}</code> ={" "}
                    <code>linxy-verification={row.id}</code>
                  </div>
                  <div>
                    CNAME <code>{row.host}</code> ={" "}
                    <code>{cnameTarget || "target"}</code>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    loading={verifyingId === row.id}
                    disabled={row.verified || !cnameTarget}
                    onClick={() => void handleVerify(row.id)}
                  >
                    Verify
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No domains yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
