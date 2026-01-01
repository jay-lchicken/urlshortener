"use client"

import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import {RippleButton, RippleButtonRipples} from "@/components/animate-ui/components/buttons/ripple";

type LandingCtaProps = {
  isAuthenticated: boolean
}

export function LandingCta({ isAuthenticated }: LandingCtaProps) {
  if (isAuthenticated) {
    return (
      <>
          <RippleButton size="lg" >
  <Link href="/dashboard">Open dashboard</Link>
  <RippleButtonRipples color={"--primary"} />
</RippleButton>
          <RippleButton size="lg" variant={"outline"}>
  <Link href="/links">View links</Link>
  <RippleButtonRipples color={"--primary"} />
</RippleButton>


      </>
    )
  }

  return (
    <>
        <SignInButton mode="modal">
        <RippleButton size="lg" >
  Log In
  <RippleButtonRipples color={"--primary"} />
</RippleButton>
      </SignInButton>


      <SignUpButton mode="modal">
        <RippleButton size="lg" variant={"outline"}>
  Create an account
  <RippleButtonRipples color={"--primary"} />
</RippleButton>
      </SignUpButton>
    </>
  )
}
