import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LandingCta } from "@/components/landing-cta"
import Link from "next/link";
import { getMongoClient } from "@/lib/mongodb";
import { getCachedTotalClicks, setCachedTotalClicks } from "@/lib/cache";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import {TextGenerateEffect} from "@/components/ui/text-generate-effect";

const features = [
  {
    title: "Branded short links",
    description: "Custom domains, clean slugs, and share-ready previews.",
  },
  {
    title: "Live click analytics",
    description: "Track location, referrers, and device mix in real time.",
  },
  {
    title: "Team-friendly workflows",
    description: "Invite teammates, manage domains, and ship together.",
  },
]

const steps = [
  {
    title: "Paste a long URL",
    description: "Drop in anything from product pages to campaign links.",
  },
  {
    title: "Choose your brand",
    description: "Pick a domain and set a clean, memorable slug.",
  },
  {
    title: "Share and measure",
    description: "Launch the link and watch the clicks roll in.",
  },
]

export default async function HomePage() {
  const { userId } = await auth()
  let totalClicks = await getCachedTotalClicks()
  if (totalClicks === null) {
    console.log("CACHE MISS: totalClicks")
    try {
      const client = await getMongoClient()
      const dbName = process.env.MONGODB_DB
      const db = dbName ? client.db(dbName) : client.db()
      totalClicks = await db.collection("redirect_logs").countDocuments()
      await setCachedTotalClicks(totalClicks)
    } catch {
      totalClicks = 0
    }
  }else {
    console.log("CACHE HIT: totalClicks")
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted" />
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-6 top-32 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-16 md:pt-24">
          <div className="grid gap-10 md:items-center">
            <div className="flex flex-col gap-6">
              <Badge className="w-fit bg-secondary text-secondary-foreground">
                Linxy is now live!
              </Badge>
              <div className="flex flex-col gap-4">
                <h1 className="text-balance font-semibold leading-tight text-3xl md:text-5xl">
                  Short links that feel
                  <br />
                  <ContainerTextFlip
                    words={["handcrafted", "branded", "premium"]}
                    interval={2500}
                    animationDuration={700}
                    textClassName="text-primary"
                  />
                  {", not cookie-cutter."}
                </h1>
                <p className="max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
                  Linxy keeps your brand in front of every click. Create beautiful
                  short URLs, track performance in real time, and manage it all in
                  one dashboard.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <LandingCta isAuthenticated={Boolean(userId)} />
                <Button size="lg" variant="outline" asChild>
                  <Link href="/terms">Read the terms</Link>
                </Button>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Unlimited redirects
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  GDPR-friendly analytics
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3 font-medium text-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {totalClicks.toLocaleString()} clicks served
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Built for teams
          </p>
          <h2 className="text-3xl font-semibold">
            <TextGenerateEffect words={"Everything you need to ship confident links."}/>
          </h2>
          <p className="text-sm text-muted-foreground">
            From custom domains to click-level insights, Linxy keeps every
            campaign accountable.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Feature
              </p>
              <p className="mt-2 text-lg font-semibold">{feature.title}</p>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            How it works
          </p>
          <h2 className="text-3xl font-semibold">
            Launch a short link in minutes.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col gap-4 rounded-3xl border border-border bg-card p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-lg font-semibold">
                {index + 1}
              </div>
              <div>
                <p className="text-lg font-semibold">{step.title}</p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 ? (
                <div className="absolute right-6 top-7 hidden h-px w-20 bg-border md:block" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-20">
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/70 p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold">
              Ready to shorten smarter?
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your first branded link and start measuring today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LandingCta isAuthenticated={Boolean(userId)} />
            <Button size="lg" variant="outline" asChild>
              <Link href="/terms">Read the terms</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
