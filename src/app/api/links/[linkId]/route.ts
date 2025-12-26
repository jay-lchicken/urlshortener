import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import pool from "@/lib/db"
function isAlphanumeric(str: string): boolean {
  return /^[a-z0-9]+$/i.test(str);
}
type RouteContext = {
  params: { linkId: string }
}
export async function PUT(req: Request, context: RouteContext) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { linkId } = await context.params
  const linkIdNumber = Number(linkId)
  if (!Number.isFinite(linkIdNumber)) {
    return NextResponse.json({ error: "Invalid link id" }, { status: 400 })
  }
  let body: { link?: string; tag?: string; description?: string; baseUrl?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const link = (body.link ?? "").trim()
  const tag = (body.tag ?? "").trim()
  const description = (body.description ?? "").trim()
  const baseURL = (body.baseUrl ?? "").trim()

  if (!link || !tag || !baseURL) {
    return NextResponse.json(
      { error: "Link and tag are required" },
      { status: 400 }
    )
  }
  const reservedTags = ["admin", "login", "signup", "api", "links", "dashboard", "settings", "account", "help", "documentation", "robots.txt", "/"]
  if (!isAlphanumeric(tag)){
    return NextResponse.json(
      { error: "Tag must be alphanumeric." },
      { status: 400 }
    )
  }
  if (reservedTags.includes(tag)) {
    return NextResponse.json(
      { error: "Tag is reserved. Please choose a different tag." },
      { status: 400 }
    )
  }

  if (!/^https?:\/\//i.test(link)) {
    return NextResponse.json({ error: "Invalid link URL" }, { status: 400 })
  }

  try {
    const existingTag = await pool.query(
      `select id from links where tag = $1 and base_url = $2 and id <> $3 limit 1`,
      [tag, baseURL, linkIdNumber]
    )
    if ((existingTag.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "Tag already in use. Please choose a different tag." },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Failed to check existing tag", error)
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    )
  }

  try {
    const result = await pool.query(
      `update links
       set original_url = $1,
           tag = $2,
           description = $3
       where id = $4 and user_id = $5
       returning id`,
      [link, tag, description || null, linkIdNumber, user.id]
    )

    if (!result.rows.length) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    return NextResponse.json({ link: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Failed to update link", error)
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { linkId } = await context.params
  const linkIdNumber = Number(linkId)
  if (!Number.isFinite(linkIdNumber)) {
    return NextResponse.json({ error: "Invalid link id" }, { status: 400 })
  }

  try {
    const result = await pool.query(
      `delete from links where id = $1 and user_id = $2 returning id`,
      [linkIdNumber, user.id]
    )
    if (!result.rows.length) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }
    return NextResponse.json({ link: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Failed to delete link", error)
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    )
  }
}
