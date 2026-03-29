import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LandingCta } from "@/components/landing-cta"
import Link from "next/link";
import { getMongoClient } from "@/lib/mongodb";
import { getCachedTotalClicks, setCachedTotalClicks } from "@/lib/cache";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Link2, BarChart3, Users, ArrowRight, Zap, Shield, Globe, MousePointerClick } from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Branded short links",
    description: "Custom domains, clean slugs, and share-ready previews that make every link unmistakably yours.",
  },
  {
    icon: BarChart3,
    title: "Live click analytics",
    description: "Track location, referrers, and device mix in real time with a dashboard built for clarity.",
  },
  {
    icon: Users,
    title: "Team-friendly workflows",
    description: "Invite teammates, manage domains, and collaborate on campaigns without stepping on toes.",
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

const stats = [
  { icon: Zap, label: "No credit card required" },
  { icon: Globe, label: "Unlimited redirects" },
  { icon: Shield, label: "GDPR-friendly analytics" },
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
  } else {
    console.log("CACHE HIT: totalClicks")
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      {/* Nav */}
      <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Linxy
        </Link>
        <div className="flex items-center gap-3">
          <LandingCta isAuthenticated={Boolean(userId)} />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted" />
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-[-5rem] top-24 h-80 w-80 rounded-full bg-accent/20 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[80px]" />

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-12 md:pt-20">
          <div className="flex flex-col items-center text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 text-sm font-medium">
              Linxy is now live
            </Badge>

            <h1 className="max-w-3xl text-balance font-bold leading-[1.1] text-4xl md:text-6xl lg:text-7xl">
              Short links that feel{" "}
              <ContainerTextFlip
                words={["handcrafted", "branded", "premium"]}
                interval={2500}
                animationDuration={700}
                textClassName="text-primary"
              />
            </h1>

            <p className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg lg:text-xl">
              Linxy keeps your brand in front of every click. Create beautiful
              short URLs, track performance in real time, and manage it all in
              one dashboard.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <LandingCta isAuthenticated={Boolean(userId)} />
              <Button size="lg" variant="outline" asChild>
                <Link href="/terms">
                  Read the terms
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2.5 rounded-full border border-border/60 bg-card/50 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm"
                >
                  <stat.icon className="h-4 w-4 text-primary" />
                  {stat.label}
                </div>
              ))}
              <div className="flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm">
                <MousePointerClick className="h-4 w-4 text-primary" />
                {totalClicks.toLocaleString()} clicks served
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Built for teams
          </p>
          <h2 className="max-w-xl text-3xl font-bold md:text-4xl">
            <TextGenerateEffect words={"Everything you need to ship confident links."} />
          </h2>
          <p className="max-w-lg text-muted-foreground">
            From custom domains to click-level insights, Linxy keeps every
            campaign accountable.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-3xl border border-border bg-card p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-lg font-semibold">{feature.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            Launch a short link in minutes.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col gap-5 rounded-3xl border border-border bg-card p-7 transition-all duration-300 hover:border-primary/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                {index + 1}
              </div>
              <div>
                <p className="text-lg font-semibold">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute -right-6 top-24 hidden text-muted-foreground/40 md:block">
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-10 md:p-14">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold md:text-3xl">
                Ready to shorten smarter?
              </h3>
              <p className="max-w-md text-muted-foreground">
                Create your first branded link and start measuring what matters today.
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap justify-center gap-3">
              <LandingCta isAuthenticated={Boolean(userId)} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Linxy</p>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
        </div>
      </footer>
    </main>
  )
}
