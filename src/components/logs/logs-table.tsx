"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type LogRow = {
  _id: string
  at: string | null
  ip: string | null
  originalUrl: string | null
  referrer: string | null
}

function formatValue(value: string | null | undefined) {
  return value?.trim() ? value : "—"
}

export function LogsTable({ data }: { data: LogRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>IP</TableHead>
            <TableHead>Redirected URL</TableHead>
            <TableHead>Referrer</TableHead>
            <TableHead>TIme</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row) => {
              return (
                <TableRow key={row._id}>
                  <TableCell>{formatValue(row.ip)}</TableCell>
                  <TableCell className="max-w-[280px] truncate" title={row.originalUrl ?? ""}>
                    {formatValue(row.originalUrl)}
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate" title={row.referrer ?? "None"}>
                    {formatValue(row.referrer)}
                  </TableCell>
                  <TableCell>
                    {row.at ? new Date(row.at).toLocaleString() : "—"}
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No logs yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
