import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Simply pass through with CSP headers
  const response = NextResponse.next();
  
  // Define CSP directives
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https: http://localhost:*",
    "frame-src 'self' https://auth.magic.link https://verify.magic.link",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
};
