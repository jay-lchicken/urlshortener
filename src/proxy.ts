import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

function normalizeHost(host: string): string {
  const trimmed = host.trim().toLowerCase();
  return trimmed.split(':')[0];
}

function getBaseHost(): string | null {
  const raw = process.env.BASE_URL?.trim();
  if (!raw) {
    return null;
  }
  try {
    if (raw.includes("://")) {
      return normalizeHost(new URL(raw).host);
    }
  } catch {

  }
  return normalizeHost(raw);
}

function isValidHost(hostname: string, authorisedURLs: string[]): boolean {
  const normalized = normalizeHost(hostname);

  if (authorisedURLs.includes(normalized)) {
    return true;
  }

  if (!/^[a-z0-9.-]+$/.test(normalized)) {
    return false;
  }

  return false;
}

const PROTECTED_PATHS = [
  "/admin",
  "/login",
  "/signup",
  "/api",
  "/links",
  "/dashboard",
  "/settings",
  "/account",
  "/help",
  "/documentation",
  "/robots.txt",
  "/",
  "/domains",
];

function coreHandler(req: NextRequest) {
  const url = req.nextUrl;
  const hostHeader = req.headers.get("host") || "";

  const pathSegments = url.pathname.split('/').filter(Boolean);
  if (pathSegments.length === 1 && !PROTECTED_PATHS.includes(`/${pathSegments[0]}`)) {
    return NextResponse.next();
  }

  if (!hostHeader || hostHeader.length > 253) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  const baseHost = getBaseHost();
  const authorisedURL = ["localhost", baseHost].filter(Boolean) as string[];
  const isValidHostResult = isValidHost(hostHeader, authorisedURL);

  const isProtectedPath = PROTECTED_PATHS.some((p) =>
    p === "/"
      ? url.pathname === "/"
      : url.pathname === p || url.pathname.startsWith(`${p}/`)
  );

  if (!isValidHostResult && isProtectedPath) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  return NextResponse.next();
}

const clerkHandler = clerkMiddleware((auth, req) => coreHandler(req));

export default function middleware(req: NextRequest, evt: NextFetchEvent) {
  const hostHeader = req.headers.get("host") || "";
  const normalizedHost = normalizeHost(hostHeader);
  const baseHost = getBaseHost();
  const shouldInitClerk = baseHost
    ? normalizedHost === baseHost || normalizedHost === "localhost"
    : normalizedHost === "localhost";

  if (!shouldInitClerk) {
    return coreHandler(req);
  }

  return clerkHandler(req, evt);
}
