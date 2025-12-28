import { Card, CardTitle } from "@/components/ui/card"
import { CreateNewLinkButton } from "@/components/links/create-new-link-button"
import pool from "@/lib/db";
import {currentUser} from "@clerk/nextjs/server";
import {notFound} from "next/navigation";


export async function LinksToolbar() {
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
    <div>
      <Card className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          Links
        </CardTitle>
        <CreateNewLinkButton links={links.rows.map(row => row.host)}/>
      </Card>
    </div>
  )
}

