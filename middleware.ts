import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for the frontend-domain auth cookie (set after login)
    // The actual backend session/accessToken cookie lives on the backend domain
    // and can't be read by Next.js middleware, so we use this indicator cookie
    const loggedIn = request.cookies.get('sliqpay_logged_in');
    
    if (!loggedIn) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

// Only run middleware on dashboard routes
export const config = {
  matcher: '/dashboard/:path*',
};
