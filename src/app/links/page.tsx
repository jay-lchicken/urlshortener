import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { LinksToolbar } from "@/components/links/links-toolbar"
import { LinksTable } from "@/components/links/links-table"
import pool from "@/lib/db"

export default async function Page() {
  const user = await currentUser()
  if (!user) {
    return notFound()
  }

  const { rows } = await pool.query(
    `select id, original_url, tag, description, created_at, base_url
     from links
     where user_id = $1
     order by created_at desc`,
    [user.id]
  )

  const links = rows.map((row) => ({
    id: row.id as number,
    originalUrl: row.original_url as string,
    tag: row.tag as string,
    description: row.description as string | null,
    createdAt: row.created_at as string,
    baseUrl: row.base_url as string,
  }))
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              <LinksToolbar />
              <LinksTable data={links} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
