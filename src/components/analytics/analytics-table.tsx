"use client"

import Link from "next/link"

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

type AnalyticsRow = {
  id: number
  tag: string
  originalUrl: string
  description: string | null
  createdAt: string
  clicks: number
  lastAt: string | null
}

function formatValue(value: string | null | undefined) {
  return value?.trim() ? value : "—"
}

export function AnalyticsTable({ data }: { data: AnalyticsRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Tag</TableHead>
            <TableHead>Original URL</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">Last Click</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  <Badge variant="outline">{row.tag}</Badge>
                </TableCell>
                <TableCell className="max-w-[320px] truncate">
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
                  {formatValue(row.description)}
                </TableCell>
                <TableCell className="text-right">{row.clicks}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.lastAt ? new Date(row.lastAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/links/${row.id}`}>Edit</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/links/${row.id}/logs`}>Logs</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No links yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
