import { redirect, notFound } from "next/navigation"
import pool from "@/lib/db"
import { headers } from "next/headers"
import { getMongoClient } from "@/lib/mongodb"

type PageProps = {
  params: { tag: string }
}

export default async function Page({ params }: PageProps) {
  const { tag } = await params
  const h = await headers()
  const proto = h.get("x-forwarded-proto") || "http"
  const host = h.get("x-forwarded-host") || h.get("host") || ""
  const origin = host ? `${proto}://${host}` : ""
  const ip = h.get("x-forwarded-for") || h.get("x-real-ip") || ""
  if (!tag) {
    return notFound()
  }



  const { rows } = await pool.query(
    `select original_url, id from links where tag = $1 and base_url = $2 limit 1`,
    [tag, origin]
  )
  if (!rows.length) {
    return notFound()
  }
  const linkId = rows[0].id as number

  const originalUrl = rows[0].original_url as string
  try {
    const SENSITIVE_HEADERS = [
      "cookie",
      "authorization",
      "x-clerk-auth-token",
      "x-clerk-auth-signature",
    ]

    const headerEntries = Object.fromEntries(
      Array.from(h.entries()).filter(([key]) => {
        const lower = key.toLowerCase()
        return !SENSITIVE_HEADERS.includes(lower)
      })
    )

    const client = await getMongoClient()
    const dbName = process.env.MONGODB_DB
    const db = dbName ? client.db(dbName) : client.db()
    await db.collection("redirect_logs").insertOne({
      linkId,
      tag,
      origin,
      originalUrl,
      at: new Date(),
      acceptLanguage: headerEntries["accept-language"] || "",
      headers: headerEntries,
      ...headerEntries, // each header becomes its own field
      ip,
    })
    console.log("Success")
  } catch (error) {
    console.error("Failed to log redirect", error)
  }

  redirect(originalUrl)
}
