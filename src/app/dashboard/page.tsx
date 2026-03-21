import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AnalyticsTable } from "@/components/analytics/analytics-table"
import { ClicksChart } from "@/components/analytics/clicks-chart"
import { getMongoClient } from "@/lib/mongodb"
import pool from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

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
  const totalLinks = analyticsRows.length
  const avgClicksPerLink = totalLinks ? Math.round(totalClicks / totalLinks) : 0
  const last7Clicks = clickSeries.reduce((acc, item) => acc + item.clicks, 0)
  const bestDay =
    clickSeries.length > 0
      ? clickSeries.reduce((best, item) =>
          item.clicks > best.clicks ? item : best
        )
      : null

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/70 p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Dashboard
                    </p>
                    <h1 className="text-3xl font-semibold">
                      Welcome back{user.firstName ? `, ${user.firstName}` : ""}.
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Here is the pulse on your links this week.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href="/links">Create link</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/domains">Manage domains</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-secondary text-secondary-foreground">
                    Live clicks
                  </Badge>
                  <Badge variant="outline">Last 7 days</Badge>
                  <Badge variant="outline">
                    Best day: {bestDay ? bestDay.date : "—"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="relative overflow-hidden">
                  <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
                  <CardHeader className="pb-0">
                    <CardTitle>Total Links</CardTitle>
                    <CardDescription>Active short links</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tabular-nums">
                      {totalLinks}
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                  <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-accent/25 blur-2xl" />
                  <CardHeader className="pb-0">
                    <CardTitle>Total Clicks</CardTitle>
                    <CardDescription>All-time traffic</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tabular-nums">
                      {totalClicks}
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                  <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
                  <CardHeader className="pb-0">
                    <CardTitle>Last 7 Days</CardTitle>
                    <CardDescription>Fresh engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tabular-nums">
                      {last7Clicks}
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                  <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-secondary/60 blur-2xl" />
                  <CardHeader className="pb-0">
                    <CardTitle>Avg per Link</CardTitle>
                    <CardDescription>Clicks per link</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tabular-nums">
                      {avgClicksPerLink}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <CardHeader className="border-b border-border">
                  <CardTitle>Weekly Momentum</CardTitle>
                  <CardDescription>
                    Track clicks day-by-day and spot spikes fast.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ClicksChart data={clickSeries} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border">
                  <CardTitle>Live Links</CardTitle>
                  <CardDescription>
                    Review every destination and see what is trending.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <AnalyticsTable data={analyticsRows} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
