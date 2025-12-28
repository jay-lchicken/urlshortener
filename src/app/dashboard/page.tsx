import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsTable } from "@/components/analytics/analytics-table"
import { ClicksChart } from "@/components/analytics/clicks-chart"
import { getMongoClient } from "@/lib/mongodb"
import pool from "@/lib/db"

type AnalyticsStat = {
  id: number
  clicks: number
  lastAt: string | null
}

type MongoStat = {
  _id: unknown
  clicks: number
  lastAt?: Date
}

type ClicksByDay = {
  _id: string
  clicks: number
}

function toNumberId(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function getUtcDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default async function Page() {
  const user = await currentUser()
  if (!user) {
    return notFound()
  }

  const { rows } = await pool.query(
    `select id, original_url, tag, description, created_at, base_url
     from links
     where user_id = $1
     order by created_at desc`,
    [user.id]
  )

  const linkIds = rows.map((row) => row.id as number)
  const statsById = new Map<number, AnalyticsStat>()
  const clickSeries: { date: string; clicks: number }[] = []

  if (linkIds.length) {
    const client = await getMongoClient()
    const dbName = process.env.MONGODB_DB
    const db = dbName ? client.db(dbName) : client.db()
    const linkIdsWithStrings = linkIds.flatMap((id) => [id, String(id)])
    const stats = (await db
      .collection("redirect_logs")
      .aggregate([
        { $match: { linkId: { $in: linkIdsWithStrings } } },
        {
          $group: {
            _id: "$linkId",
            clicks: { $sum: 1 },
            lastAt: { $max: "$at" },
          },
        },
      ])
      .toArray()) as MongoStat[]

    stats.forEach((stat) => {
      const id = toNumberId(stat._id)
      if (id === null) {
        return
      }
      statsById.set(id, {
        id,
        clicks: stat.clicks ?? 0,
        lastAt: stat.lastAt ? stat.lastAt.toISOString() : null,
      })
    })

    const today = new Date()
    const endDate = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      )
    )
    const startDate = new Date(endDate)
    startDate.setUTCDate(startDate.getUTCDate() - 6)
    const endExclusive = new Date(endDate)
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1)

    const clicksByDay = (await db
      .collection("redirect_logs")
      .aggregate([
        {
          $match: {
            linkId: { $in: linkIdsWithStrings },
            at: { $gte: startDate, $lt: endExclusive },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$at" },
            },
            clicks: { $sum: 1 },
          },
        },
      ])
      .toArray()) as ClicksByDay[]

    const clicksByDate = new Map(
      clicksByDay.map((entry) => [entry._id, entry.clicks])
    )

    const cursor = new Date(startDate)
    for (let i = 0; i < 7; i += 1) {
      const dayKey = getUtcDayKey(cursor)
      clickSeries.push({
        date: dayKey,
        clicks: clicksByDate.get(dayKey) ?? 0,
      })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
  } else {
    const today = new Date()
    const endDate = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      )
    )
    const startDate = new Date(endDate)
    startDate.setUTCDate(startDate.getUTCDate() - 6)
    const cursor = new Date(startDate)
    for (let i = 0; i < 7; i += 1) {
      clickSeries.push({ date: getUtcDayKey(cursor), clicks: 0 })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
  }

  const analyticsRows = rows.map((row) => {
    const id = row.id as number
    const stats = statsById.get(id)
    return {
      id,
      originalUrl: row.original_url as string,
      tag: row.tag as string,
      description: row.description as string | null,
      createdAt: row.created_at as string,
      clicks: stats?.clicks ?? 0,
      lastAt: stats?.lastAt ?? null,
      baseUrl: row.base_url as string,
    }
  })

  const totalClicks = analyticsRows.reduce((acc, row) => acc + row.clicks, 0)

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tabular-nums">
                      {analyticsRows.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tabular-nums">
                      {totalClicks}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <ClicksChart data={clickSeries} />
              <AnalyticsTable data={analyticsRows} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
