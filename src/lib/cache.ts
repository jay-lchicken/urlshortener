import redis from './redis';
import pool from './db';

const DEFAULT_TTL = 1800; // 30 minutes in seconds
const HOURS_TTL = 3600; // 1 hour for user hours
const REQUESTS_TTL = 3600; // 1 hour for user requests


export async function getCachedURL(tag: string) {
  try {
    const cached = await redis.get(`TAG[${tag}]`);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCachedURL(tag: string, data: any, ttl = DEFAULT_TTL) {
  try {
    await redis.set(`TAG[${tag}]`, JSON.stringify(data), 'EX', ttl);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function invalidateCachedURL(tag: string) {
  console.log('Cache invalidating:', tag);
  try {
    await redis.del(`TAG[${tag}]`);
  } catch (error) {
    console.error('Cache invalidate error:', error);
  }
}