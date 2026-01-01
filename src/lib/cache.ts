import redis from './redis';
import pool from './db';
import crypto from 'crypto';

const DEFAULT_TTL = 1800; // 30 minutes in seconds
const HOURS_TTL = 3600; // 1 hour for user hours
const REQUESTS_TTL = 3600; // 1 hour for user requests
const SCAN_CACHE_TTL = 172800; // 48 hours for virus scan results
const TOTAL_CLICKS_TTL = 300; // 5 minutes for landing page stats

function buildTagKey(baseUrl: string, tag: string) {
   const normalizedBaseUrl = baseUrl
     .trim()
     .toLowerCase()
     .replace(/^https?:\/\//i, "")
     .replace(/\/+$/, "");
   return `TAG[${normalizedBaseUrl}/${tag}]`;
}

function buildScanKey(url: string) {
   const digest = crypto.createHash("sha256").update(url).digest("hex")
   return `VT_SCAN:${digest}`
}

function buildTotalClicksKey() {
  return "TOTAL_CLICKS";
}

export async function getCachedURL(baseUrl: string, tag: string) {
  try {
    const cached = await redis.get(buildTagKey(baseUrl, tag));
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCachedURL(
  baseUrl: string,
  tag: string,
  data: any,
  ttl = DEFAULT_TTL
) {
  try {
    await redis.set(buildTagKey(baseUrl, tag), JSON.stringify(data), "EX", ttl);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function invalidateCachedURL(baseUrl: string, tag: string) {
   console.log("Cache invalidating:", baseUrl, tag);
   try {
     await redis.del(buildTagKey(baseUrl, tag));
   } catch (error) {
     console.error('Cache invalidate error:', error);
   }
}

export async function getCachedScan(url: string): Promise<boolean | null> {
   try {
     const cached = await redis.get(buildScanKey(url));
     if (cached === "malicious") return true;
     if (cached === "clean") return false;
     return null;
   } catch {
     return null;
   }
}

export async function setCachedScan(url: string, isMalicious: boolean): Promise<void> {
   try {
     await redis.set(buildScanKey(url), isMalicious ? "malicious" : "clean", "EX", SCAN_CACHE_TTL);
   } catch (error) {
     console.error('Scan cache set error:', error);
   }
}

export async function getCachedTotalClicks(): Promise<number | null> {
  try {
    const cached = await redis.get(buildTotalClicksKey());
    if (cached === null) {
      return null;
    }
    const parsed = Number(cached);
    return Number.isFinite(parsed) ? parsed : null;
  } catch (error) {
    console.error("Total clicks cache get error:", error);
    return null;
  }
}

export async function setCachedTotalClicks(total: number): Promise<void> {
  try {
    await redis.set(buildTotalClicksKey(), String(total), "EX", TOTAL_CLICKS_TTL);
  } catch (error) {
    console.error("Total clicks cache set error:", error);
  }
}
