"use client"

import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import Link from "next/link";

type LandingCtaProps = {
  isAuthenticated: boolean
}

export function LandingCta({ isAuthenticated }: LandingCtaProps) {
  if (isAuthenticated) {
    return (
      <>
        <Button size="lg" asChild>
          <Link href="/dashboard">Open dashboard</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/links">View links</Link>
        </Button>
      </>
    )
  }

  return (
    <>
      <SignInButton mode="modal">
        <Button size="lg">Log in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="lg" variant="outline">
          Create an account
        </Button>
      </SignUpButton>
    </>
  )
}
