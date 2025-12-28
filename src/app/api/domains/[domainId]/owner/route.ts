import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import pool from "@/lib/db"

type RouteContext = {
  params: Promise<{ domainId: string }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
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
  try {
    const domainResult = await pool.query(
      `select owner_id from domains where id = $1 limit 1`,
      [domainIdNumber]
    )
    if (!domainResult.rows.length) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }
    ownerId = domainResult.rows[0].owner_id as string
  } catch (error) {
    console.error("Failed to load domain", error)
    return NextResponse.json(
      { error: "Failed to transfer ownership" },
      { status: 500 }
    )
  }

  const isAdmin = ownerId === user.id
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (targetUserId === ownerId) {
    return NextResponse.json(
      { error: "User is already the owner." },
      { status: 400 }
    )
  }

  try {
    const memberResult = await pool.query(
      `select 1 from domain_user where domain_id::text = $1 and user_id = $2`,
      [domainIdText, targetUserId]
    )
    if (!memberResult.rows.length) {
      return NextResponse.json(
        { error: "User must already be a member of this domain." },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("Failed to validate domain member", error)
    return NextResponse.json(
      { error: "Failed to transfer ownership" },
      { status: 500 }
    )
  }

  try {
    await pool.query(`update domains set owner_id = $1 where id = $2`, [
      targetUserId,
      domainIdNumber,
    ])
  } catch (error) {
    console.error("Failed to transfer ownership", error)
    return NextResponse.json(
      { error: "Failed to transfer ownership" },
      { status: 500 }
    )
  }

  return NextResponse.json({ transferred: true }, { status: 200 })
}
