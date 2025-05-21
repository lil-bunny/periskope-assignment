import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('🔵 Middleware: Processing request for path:', req.nextUrl.pathname);

  // Skip middleware for callback route
  if (req.nextUrl.pathname === '/auth/callback') {
    console.log('✅ Middleware: Skipping callback route');
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('🔵 Middleware: Session status:', session ? 'Found' : 'Not found');

  // If accessing auth page and session exists, redirect to home
  if (req.nextUrl.pathname.startsWith('/auth') && session) {
    console.log('🔵 Middleware: Redirecting to home (session exists)');
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If accessing protected routes and no session, redirect to auth
  if (!req.nextUrl.pathname.startsWith('/auth') && !session) {
    console.log('🔵 Middleware: Redirecting to auth (no session)');
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  console.log('✅ Middleware: Proceeding with request');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 