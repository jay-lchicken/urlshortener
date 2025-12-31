import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LandingCta } from "@/components/landing-cta"
import Link from "next/link";

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

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted" />
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-10 top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-16 md:pt-24">
          <div className="flex flex-col gap-6">
            <Badge className="w-fit bg-secondary text-secondary-foreground">
              Linxy link intelligence
            </Badge>
            <div className="flex flex-col gap-4">
              <h1 className="text-balance text-4xl font-semibold leading-tight md:text-6xl">
                Short links that feel handcrafted, not cookie-cutter.
              </h1>
              <p className="max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
                Linxy keeps your brand in front of every click. Create beautiful
                short URLs, track performance in real time, and manage it all in
                one dashboard.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LandingCta isAuthenticated={Boolean(userId)} />
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Unlimited redirects
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                GDPR-friendly analytics
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card/60 p-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Built for teams
              </p>
              <h2 className="text-2xl font-semibold">
                Everything you need to ship confident links.
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
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
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
              className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6"
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
