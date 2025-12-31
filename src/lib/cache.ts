import redis from './redis';
import pool from './db';

const DEFAULT_TTL = 1800; // 30 minutes in seconds
const HOURS_TTL = 3600; // 1 hour for user hours
const REQUESTS_TTL = 3600; // 1 hour for user requests

function buildTagKey(baseUrl: string, tag: string) {
  const normalizedBaseUrl = baseUrl
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  return `TAG[${normalizedBaseUrl}/${tag}]`;
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
