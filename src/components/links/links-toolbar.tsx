import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { CreateNewLinkButton } from "@/components/links/create-new-link-button"
import pool from "@/lib/db";
import {currentUser} from "@clerk/nextjs/server";
import {notFound} from "next/navigation";
import { Badge } from "@/components/ui/badge";


export async function LinksToolbar({ totalLinks }: { totalLinks: number }) {
    const user = await currentUser()
    if (!user) {
        notFound()
    }
    const links = await pool.query(
    `select d.host
     from domain_user du
     join domains d on text(d.id) = du.domain_id
     where du.user_id = $1`,
    [user.id]
  )
    console.log(links)

  return (
    <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Links
          </CardTitle>
          <Badge variant="outline">{totalLinks} total</Badge>
        </div>
        <CardDescription>
          Keep your destinations tidy and your branded short links organized.
        </CardDescription>
      </div>
      <CreateNewLinkButton links={links.rows.map(row => row.host)}/>
    </Card>
  )
}
