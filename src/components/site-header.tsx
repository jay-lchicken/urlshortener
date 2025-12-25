"use client"
import * as React from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
export function SiteHeader() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <nav className="flex items-center gap-1 text-base font-medium">
            <Breadcrumb>
  <BreadcrumbList>

    {segments.map((segment, index) => (
      <React.Fragment key={segment}>
        <BreadcrumbItem>
          <BreadcrumbLink href={"/" + segments.slice(0, index + 1).join("/")}>
            {segment.charAt(0).toUpperCase() + segment.slice(1)}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {index < segments.length - 1 && <BreadcrumbSeparator />}
      </React.Fragment>
    ))}
  </BreadcrumbList>
</Breadcrumb>

        </nav>
      </div>
    </header>
  )
}
