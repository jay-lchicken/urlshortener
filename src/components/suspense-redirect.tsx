"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type SuspenseRedirectProps = {
  destination: string
  time: number
}

export function SuspenseRedirect({
  destination,
  time,
}: SuspenseRedirectProps) {
  const initialSeconds = useMemo(
    () => (Number.isFinite(time) ? Math.max(0, Math.floor(time)) : 0),
    [time]
  )
  const [remaining, setRemaining] = useState(initialSeconds)
  const progress =
    initialSeconds === 0
      ? 100
      : Math.min(
          100,
          Math.max(0, ((initialSeconds - remaining) / initialSeconds) * 100)
        )

  useEffect(() => {
    if (remaining <= 0) {
      if (destination) {
        window.location.assign(destination)
      }
      return
    }

    const timer = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [remaining, destination])

  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted" />
      <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-16 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
      <div className="relative mx-auto flex min-h-svh w-full max-w-4xl items-center px-6 py-16">
        <Card className="relative w-full overflow-hidden border-border/70 bg-card/80">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
          <CardHeader className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle>Hang tight</CardTitle>
                <p className="text-sm text-muted-foreground">
                  We are preparing your destination.
                </p>
              </div>
              <Badge className="bg-secondary text-secondary-foreground">
                Redirecting
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative flex flex-col gap-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Destination
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-foreground">
                {destination}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Redirecting in
                  </p>
                  <p className="text-3xl font-semibold tabular-nums text-foreground">
                    {remaining}s
                  </p>
                </div>
                <Button asChild>
                  <a href={destination}>Go now</a>
                </Button>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1">
                Safe preview
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1">
                UTM aware
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1">
                Secure redirect
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              If the redirect does not start automatically, use the button above.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
