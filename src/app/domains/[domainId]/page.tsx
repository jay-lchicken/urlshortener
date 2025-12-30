import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import pool from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DomainUsersTable } from "@/components/domains/domain-users-table"
import { AddDomainUserButton } from "@/components/domains/add-domain-user-button"

type PageProps = {
  params: { domainId: string }
}

export default async function Page({ params }: PageProps) {
  const user = await currentUser()
  if (!user) {
    return notFound()
  }
  const { domainId } = await params
  const domainIdNumber = Number(domainId)
  if (!Number.isFinite(domainIdNumber)) {
    return notFound()
  }
  const domainIdText = String(domainIdNumber)
  const domainResult = await pool.query(
    `select id, host, verified, owner_id
     from domains
     where id = $1 and verified = true
     limit 1`,
    [domainIdNumber]
  )

  if (!domainResult.rows.length) {
    return notFound()
  }
  const domain = domainResult.rows[0]
  const isOwner = (domain.owner_id as string) === user.id
  const isAdmin = isOwner === true
  if (!isAdmin) {
    return notFound()
  }
  const usersResult = await pool.query(
    `select user_id, email
     from domain_user
     where domain_id::text = $1
     order by  user_id`,
    [domainIdText]
  )

  const domainUsers = usersResult.rows.map((row) => ({
    userId: row.user_id as string,
    email: (row.email as string | null) ?? null,
    isOwner: (row.user_id as string) === (domain.owner_id as string),
  }))
  const ownerEmail = user.primaryEmailAddress?.emailAddress ?? null
  const hasOwnerRow = domainUsers.some((row) => row.isOwner)
  if (!hasOwnerRow) {
    domainUsers.push({
      userId: domain.owner_id as string,
      email: ownerEmail,
      isOwner: true,
    })
  }
  const sortedUsers = [...domainUsers].sort((a, b) => {
    if (a.isOwner === b.isOwner) return 0
    return a.isOwner ? -1 : 1
  })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl font-semibold">
                      {domain.host as string}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Domain details
                    </div>
                  </div>
                  <Badge variant={domain.verified ? "default" : "outline"}>
                    {domain.verified ? "Verified" : "Pending"}
                  </Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Manage who can create links with this domain.
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle className="text-xl font-semibold">Users</CardTitle>
                  {isAdmin ? (
                    <AddDomainUserButton domainId={domainIdNumber} />
                  ) : null}
                </CardHeader>
                <CardContent>
                  <DomainUsersTable
                    data={sortedUsers}
                    domainId={domainIdNumber}
                    isAdmin={isAdmin}
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
