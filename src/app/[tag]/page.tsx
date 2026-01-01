import {redirect, notFound} from "next/navigation"
import pool from "@/lib/db"
import {headers} from "next/headers"
import {getMongoClient} from "@/lib/mongodb"
import {getCachedURL, setCachedURL} from "@/lib/cache";

type PageProps = {
    params: { tag: string }
}

function normalizeHost(input: string): string {
    const trimmed = input.trim().toLowerCase()
    const withoutProtocol = trimmed.replace(/^https?:\/\//i, "")
    return withoutProtocol.split(/[/?#]/)[0].replace(/\/+$/, "")
}

function sanitizeHeaderKey(key: string): string {
    const replacedDots = key.replace(/\./g, "_")
    if (replacedDots.startsWith("$")) {
        return `_${replacedDots.slice(1)}`
    }
    return replacedDots
}

export default async function Page({params}: PageProps) {
    const {tag} = await params
    const h = await headers()
    const proto = h.get("x-forwarded-proto") || "http"
    const host = h.get("x-forwarded-host") || h.get("host") || ""
    const origin = normalizeHost(host ? host : "")
    const ip = h.get("x-forwarded-for") || h.get("x-real-ip") || ""
    const referer = h.get("referer") || h.get("referrer") || ""
    if (!tag) {
        return notFound()
    }
    let originalUrl: string
    let linkId: number
    const cachedOriginalURL = await getCachedURL(origin, tag)
    if (cachedOriginalURL) {
        console.log("Cache hit for original URL")
        originalUrl = cachedOriginalURL.originalUrl
        linkId = cachedOriginalURL.linkId


    } else {
        console.log("Cache miss for original URL, querying database")
        const {rows} = await pool.query(
            `select original_url, id
             from links
             where tag = $1
               and base_url = $2 limit 1`,
            [tag, origin]
        )
        if (!rows.length) {
            return notFound()
        }
        linkId = rows[0].id as number
        originalUrl = rows[0].original_url as string
        const linkData = {
            originalUrl,
            linkId
        }
        setCachedURL(origin, tag, linkData)


    }


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
        const safeHeaderEntries = Object.fromEntries(
            Object.entries(headerEntries).map(([key, value]) => [
                sanitizeHeaderKey(key),
                value,
            ])
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
            referer,
            headers: safeHeaderEntries,
            ip,
            ...safeHeaderEntries
        })
        console.log("Success")
    } catch (error) {
        console.error("Failed to log redirect", error)
    }

    redirect(originalUrl)
}
