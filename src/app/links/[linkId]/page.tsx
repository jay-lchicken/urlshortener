import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EditLinkForm } from "@/components/links/edit-link-form"
import pool from "@/lib/db"

type PageProps = {
  params: { linkId: string }
}

export default async function Page({ params }: PageProps) {
  const user = await currentUser()
  if (!user) {
    return notFound()
  }

  const { linkId } = await params
  const linkIdNumber = Number(linkId)
  if (!Number.isFinite(linkIdNumber)) {
    return notFound()
  }

  const { rows } = await pool.query(
    `select id, original_url, tag, description, base_url
     from links
     where id = $1 and user_id = $2
     limit 1`,
    [linkIdNumber, user.id]
  )
  if (!rows.length) {
    return notFound()
  }

  const link = rows[0]

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">
                    Edit Link
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EditLinkForm
                    linkId={link.id as number}
                    originalUrl={link.original_url as string}
                    tag={link.tag as string}
                    description={link.description as string | null}
                    baseUrl={link.base_url as string}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
