"use client"

import * as React from "react"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {SettingsIcon} from "lucide-react";
import { Card } from "./ui/card";
import { ModeToggle } from "./theme-mode-toggle";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem key={"settings"}>
              <SidebarMenuButton asChild>
                <Sheet>
                <SheetTrigger asChild>
                  <SidebarMenuButton>
                    <SettingsIcon/>
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>
                        Manage your settings.
                    </SheetDescription>
                    <Card className={"flex flex-row p-4 justify-between items-center"}>
                      <h1>Theme</h1>
                        <ModeToggle />
                    </Card>

                  </SheetHeader>
                </SheetContent>
              </Sheet>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
