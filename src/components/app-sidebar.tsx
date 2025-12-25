import { currentUser } from "@clerk/nextjs/server"
import { AppSidebarClient } from "@/components/app-sidebar-client"
import type { SidebarProps } from "@/components/ui/sidebar"

export async function AppSidebar(props: SidebarProps) {
  const user = await currentUser()
  if (!user) {
    return null
  }

  const userData = {
    name: user?.fullName || user?.firstName || "User",
    email: user?.primaryEmailAddress?.emailAddress || "",
    avatar: user?.imageUrl || "",
  }

  return <AppSidebarClient user={userData} {...props} />
}
