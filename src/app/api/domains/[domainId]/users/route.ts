import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import pool from "@/lib/db"
import { clerkClient } from '@clerk/nextjs/server'

type RouteContext = {
  params: Promise<{ domainId: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  const user = await currentUser()
  const client = await clerkClient()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { domainId } = await context.params
  const domainIdNumber = Number(domainId)
  if (!Number.isFinite(domainIdNumber)) {
    return NextResponse.json({ error: "Invalid domain id" }, { status: 400 })
  }
  const domainIdText = String(domainIdNumber)
  let body: { email: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  if (!body.email || !body.email.trim()) {
    return NextResponse.json(
      { error: "Email address is required" },
      { status: 400 }
    )
  }
  let ownerId: string
  try {
    const domainResult = await pool.query(
      `select owner_id from domains where id = $1 and verified = true limit 1`,
      [domainIdNumber]
    )
    if (!domainResult.rows.length) {
      return NextResponse.json({ error: "Domain not found or verified yet" }, { status: 404 })
    }
    ownerId = domainResult.rows[0].owner_id as string
  } catch (error) {
    console.error("Failed to load domain", error)
    return NextResponse.json(
      { error: "Failed to add user" },
      { status: 500 }
    )
  }

  const isAdmin = ownerId === user.id

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const users = await client.users.getUserList({
    emailAddress: [body.email]
  })
  const userId = users.data.length > 0 ? users.data[0].id : null
    if (!userId) {
        return NextResponse.json(
        { error: "User with that email address not found" },
        { status: 404 }
        )
    }





  try {
    const existing = await pool.query(
      `select 1 from domain_user where domain_id::text = $1 and user_id = $2 limit 1`,
      [domainIdText, userId]
    )
    if (existing.rows.length) {
      return NextResponse.json(
        { added: false, message: "User already has access." },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Failed to check existing domain user", error)
    return NextResponse.json(
      { error: "Failed to add user" },
      { status: 500 }
    )
  }

  try {
    await pool.query(
      `insert into domain_user (domain_id, user_id, email) values ($1, $2, $3)`,
      [domainIdText, userId, body.email]
    )
  } catch (error) {
    console.error("Failed to add domain user", error)
    return NextResponse.json(
      { error: "Failed to add user" },
      { status: 500 }
    )
  }

  return NextResponse.json({ added: true }, { status: 201 })
}








export async function DELETE(req: NextRequest, context: RouteContext) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { domainId } = await context.params
  const domainIdNumber = Number(domainId)
  if (!Number.isFinite(domainIdNumber)) {
    return NextResponse.json({ error: "Invalid domain id" }, { status: 400 })
  }
  const domainIdText = String(domainIdNumber)

  let body: { userId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const targetUserId = body.userId?.trim()
  if (!targetUserId) {
    return NextResponse.json(
      { error: "User id is required" },
      { status: 400 }
    )
  }

  let ownerId: string
  let host: string
  try {
    const domainResult = await pool.query(
      `select owner_id,host from domains where id = $1 limit 1`,
      [domainIdNumber]
    )
    if (!domainResult.rows.length) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }
    ownerId = domainResult.rows[0].owner_id as string
    host = domainResult.rows[0].host as string
  } catch (error) {
    console.error("Failed to load domain", error)
    return NextResponse.json(
      { error: "Failed to remove user" },
      { status: 500 }
    )
  }

  const isAdmin = ownerId === user.id
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (targetUserId === ownerId) {
    return NextResponse.json(
      { error: "Cannot remove the owner." },
      { status: 400 }
    )
  }

  try {
    const result = await pool.query(
      `delete from domain_user where domain_id::text = $1 and user_id = $2`,
      [domainIdText, targetUserId]
    )
    const result2 = await pool.query(`delete from links where base_url = $1 and user_id = $2`, [host, targetUserId])
    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "User not found for this domain." },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("Failed to remove domain user", error)
    return NextResponse.json(
      { error: "Failed to remove user" },
      { status: 500 }
    )
  }

  return NextResponse.json({ removed: true }, { status: 200 })
}
