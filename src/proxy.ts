import { clerkMiddleware } from '@clerk/nextjs/server';  
import { NextResponse } from 'next/server';  
  
function normalizeHost(host: string): string {  
  const trimmed = host.trim().toLowerCase();  
  return trimmed.split(':')[0];
}  
//Check if the host is the main domain. DOES NOT CHECK FOR EXTERNAL DOMAINS
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
  
export default clerkMiddleware((auth, req) => {  
  const url = req.nextUrl;  
  const hostHeader = req.headers.get("host") || "";  
    
  if (!hostHeader || hostHeader.length > 253) {
    return NextResponse.rewrite(new URL("/404", req.url));  
  }  
    
  const authorisedURL = ["localhost", process.env.BASE_URL].filter(Boolean) as string[];
  const isValidHostResult = isValidHost(hostHeader, authorisedURL);
  
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
  
  if (!isValidHostResult && isProtectedPath) {
    return NextResponse.rewrite(new URL("/404", req.url));  
  }  
  
  return NextResponse.next();  
});