"use client"

import { MailIcon, PlusCircleIcon, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {useRouter, usePathname} from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Service Hours Log"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              onClick={() => router.push('/links?new=true')}
            >
              <PlusCircleIcon />
              <span>New Link</span>
            </SidebarMenuButton>

          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>

          {items.map((item) => {


            return(
                <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} onClick={() => router.push(item.url)} isActive={pathname.toLowerCase().startsWith(item.url)  }
>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            )
          })}

        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
