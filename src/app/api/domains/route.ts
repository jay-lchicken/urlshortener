import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import pool from "@/lib/db"

function normalizeHost(input: string): string {
  const trimmed = input.trim().toLowerCase()
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "")
  return withoutProtocol.split(/[/?#]/)[0].replace(/\/+$/, "")
}

function isValidHost(host: string): boolean {
  if (!host || host.length > 253) return false
  if (!/^[a-z0-9.-]+$/.test(host)) return false
  if (!host.includes(".")) return false
  return !host.split(".").some((label) => !label || label.length > 63)
}

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { host?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const host = normalizeHost(body.host ?? "")
  if (!host || !isValidHost(host)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 })
  }



  try {
    const existingHost = await pool.query(
      `select id from domains where host = $1 and owner_id = $2 limit 1`,
      [host, user.id]
    )
    if ((existingHost.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "Domain already exists." },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Failed to check existing host", error)
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    )
  }

  try {
    const result = await pool.query(
      `insert into domains (host, owner_id, verified)
       values ($1, $2, false)
       returning id, host, verified`,
      [host, user.id]
    )

    return NextResponse.json({ domain: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Failed to add host", error)
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    )
  }
}
