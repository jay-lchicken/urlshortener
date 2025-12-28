// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const authorisedURL = ["localhost", process.env.BASE_URL]; // example
const PROTECTED_PATHS = ["/admin", "/login", "/signup", "/api", "/links", "/dashboard", "/settings", "/account", "/help", "/documentation", "/robots.txt", "/", "/domains"];     // example

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl;
  const hostname = url.hostname;
  const isValidHost = authorisedURL.includes(hostname);
  console.log(hostname)
  const isProtectedPath = PROTECTED_PATHS.some(p => p === '/' ? url.pathname === '/' : url.pathname === p || url.pathname.startsWith(`${p}/`))
  if (!isValidHost && isProtectedPath) {
    return NextResponse.rewrite(new URL('/404', req.url));
  }


  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
