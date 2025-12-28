import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DomainsTable } from "@/components/domains/domains-table"
import { DomainsToolbar } from "@/components/domains/domains-toolbar"
import { SiteHeader } from "@/components/site-header"
import pool from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"



export default async function Page() {
  const user = await currentUser()
  if (!user) {
    return notFound()
  }

  const cnameTarget = process.env.DOMAIN_CNAME_TARGET ?? ""
  const { rows } = await pool.query(
    `select id, host, verified
     from domains
     where owner_id = $1
     order by id desc`,
    [user.id]
  )
  const domains = rows.map((row) => ({
    id: row.id as number,
    host: row.host as string,
    verified: row.verified as boolean,
  }))

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              <DomainsToolbar cnameTarget={cnameTarget} />
              <DomainsTable data={domains} cnameTarget={cnameTarget} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
