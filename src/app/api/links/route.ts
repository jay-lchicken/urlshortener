import { NextResponse } from "next/server"
import {auth, currentUser} from "@clerk/nextjs/server"
import pool from "@/lib/db"

function isAlphanumeric(str: string): boolean {
  return /^[a-z0-9]+$/i.test(str);
}

export async function POST(req: Request) {
  const  user  = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { link?: string; tag?: string; description?: string, baseUrl?: string }
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

  if (!/^https?:\/\//i.test(link)) {
    return NextResponse.json({ error: "Invalid link URL" }, { status: 400 })
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
  try {
    const existingTag = await pool.query(
        `select id from links where tag = $1 and base_url = $2 limit 1`,
        [tag, baseURL]
    );
    if (existingTag.rowCount || 0 > 0) {
      return NextResponse.json(
          { error: "Tag already in use. Please choose a different tag." },
          { status: 400 }
      );
    }
  } catch (error) {
    console.error("Failed to check existing tag", error)
    return NextResponse.json(
        { error: "Failed to create link" },
        { status: 500 }
    )
  }

  try {
    const result = await pool.query(
      `insert into links (user_id, original_url, tag, description, base_url)
       values ($1, $2, $3, $4, $5)
       returning id, user_id, original_url, tag, description, created_at`,
      [user.id, link, tag, description || null, baseURL]
    )

    return NextResponse.json({ link: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Failed to create link", error)
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    )
  }
}
