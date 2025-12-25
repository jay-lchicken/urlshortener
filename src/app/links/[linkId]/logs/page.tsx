import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { LogsTable } from "@/components/logs/logs-table"
import { Card, CardTitle } from "@/components/ui/card"
import { getMongoClient } from "@/lib/mongodb"
import pool from "@/lib/db"

type LogDoc = Record<string, unknown> & { _id: { toString: () => string } }

type PageProps = {
  params: { linkId: string }
}

function toStringValue(value: unknown): string | null {
  if (typeof value === "string") {
    return value
  }
  if (Array.isArray(value)) {
    return value.join(", ")
  }
  if (value === null || value === undefined) {
    return null
  }
  return String(value)
}

export default async function Page({ params }: PageProps) {
  const user = await currentUser()
  if (!user) {
    return notFound()
  }
  const { linkId } = await params
  const linkIdNumber = Number(linkId)
  if (!Number.isFinite(linkIdNumber)) {
    return notFound()
  }


  const { rows } = await pool.query(
    `select id from links where id = $1 and user_id = $2 limit 1`,
    [linkIdNumber, user.id]
  )
  if (!rows.length) {
    return notFound()
  }

  const client = await getMongoClient()
  const dbName = process.env.MONGODB_DB
  const db = dbName ? client.db(dbName) : client.db()
  const docs = (await db
    .collection("redirect_logs")
    .find({ linkId: { $in: [linkIdNumber, linkId] } })
    .sort({ at: -1 })
    .toArray()) as LogDoc[]

  const logs = docs.map((doc) => {
    const at =
      doc.at instanceof Date ? doc.at.toISOString() : toStringValue(doc.at)
    return {
      _id: doc._id.toString(),
      at,
      ip: toStringValue(doc.ip),
      originalUrl: toStringValue(doc.originalUrl),
    }
  })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              <Card className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  Redirect Logs
                </CardTitle>
              </Card>
              <LogsTable data={logs} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
