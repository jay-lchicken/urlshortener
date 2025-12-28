import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { promises as dns, setServers } from "dns"
import pool from "@/lib/db"

type RouteContext = {
  params: Promise<{ domainId: string }>
}

function normalizeDnsValue(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "")
}



setServers(["8.8.8.8", "1.1.1.1"])

export async function POST(_req: NextRequest, context: RouteContext) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { domainId } = await context.params
  const domainIdNumber = Number(domainId)
  if (!Number.isFinite(domainIdNumber)) {
    return NextResponse.json({ error: "Invalid domain id" }, { status: 400 })
  }
  const cnameTarget = normalizeDnsValue(
    process.env.DOMAIN_CNAME_TARGET ?? ""
  )
  if (!cnameTarget) {
    return NextResponse.json(
      { error: "CNAME target is not configured." },
      { status: 500 }
    )
  }

  let host: string
  try {
    const result = await pool.query(
      `select host, verified from domains where id = $1 and owner_id = $2 limit 1`,
      [domainIdNumber, user.id]
    )
    if (!result.rows.length) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }
    if (result.rows[0].verified) {
      return NextResponse.json({ verified: true }, { status: 200 })
    }
    host = result.rows[0].host as string
  } catch (error) {
    console.error("Failed to load domain", error)
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    )
  }

  const txtName = `_linxy.${host}`
  const txtValue = `linxy-verification=${domainIdNumber}`

  let txtOk = false
  let cnameOk = false
  let txtError: unknown = null
  let cnameError: unknown = null

  try {
    const txtRecords = await dns.resolveTxt(txtName)
    const flattened = txtRecords
      .flat()
      .map((entry) => entry.trim())
    txtOk = flattened.includes(txtValue)
  } catch (error) {
    txtError = error
    console.error("TXT lookup failed", error)
  }

  try {
    const cnameRecords = await dns.resolveCname(host)
    cnameOk = cnameRecords
      .map(normalizeDnsValue)
      .includes(cnameTarget)
  } catch (error) {
    cnameError = error
    console.error("CNAME lookup failed", error)
  }




  if (!txtOk || !cnameOk) {
    return NextResponse.json(
      {
        error:
          "DNS records not found. Ensure TXT and CNAME records are set and try again.",
        details: {
          txtName,
          txtValue,
          cnameTarget,
          txtOk,
          cnameOk,
          txtError: txtError
            ? (txtError as Error).message ?? String(txtError)
            : null,
          cnameError: cnameError
            ? (cnameError as Error).message ?? String(cnameError)
            : null,
        },
      },
      { status: 400 }
    )
  }

  try {
    await pool.query(
      `update domains set verified = true where id = $1 and owner_id = $2`,
      [domainIdNumber, user.id]
    )
  } catch (error) {
    console.error("Failed to update domain verification", error)
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    )
  }
  try {
    await pool.query(
      `insert into domain_user (domain_id, user_id, email) values ($1, $2, $3)`,
      [domainIdNumber, user.id, user.primaryEmailAddress?.emailAddress ?? null]
    )
  } catch (error) {
    console.error("Failed to add domain to domain_user", error)
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    )
  }

  return NextResponse.json({ verified: true }, { status: 200 })
}
