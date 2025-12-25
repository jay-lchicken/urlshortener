"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type ClicksChartPoint = {
  date: string
  clicks: number
}

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function formatDayLabel(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  return date.toLocaleDateString(undefined, { weekday: "short" })
}

function formatTooltipLabel(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function ClicksChart({ data }: { data: ClicksChartPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clicks Over Time (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDayLabel}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={formatTooltipLabel}
                />
              }
            />
            <Area
              dataKey="clicks"
              type="monotone"
              fill="var(--color-clicks)"
              fillOpacity={0.2}
              stroke="var(--color-clicks)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
