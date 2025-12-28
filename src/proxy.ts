// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const authorisedURL = ["localhost", process.env.BASE_URL];
const PROTECTED_PATHS = ["/admin", "/login", "/signup", "/api", "/links", "/dashboard", "/settings", "/account", "/help", "/documentation", "/robots.txt", "/", "/domains"];     // example

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl;
  const hostHeader = req.headers.get("host") || "";
  const hostname = hostHeader.split(":")[0];

  const authorisedURL = ["localhost", process.env.BASE_URL];
  const isValidHost = authorisedURL.includes(hostname);

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

  const isProtectedPath = PROTECTED_PATHS.some((p) =>
    p === "/"
      ? url.pathname === "/"
      : url.pathname === p || url.pathname.startsWith(`${p}/`)
  );

  if (!isValidHost && isProtectedPath) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
