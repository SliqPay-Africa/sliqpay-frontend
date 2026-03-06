import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Simply pass through
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
