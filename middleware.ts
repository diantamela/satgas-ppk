import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest, getUserRole } from '@/lib/auth-utils';

export async function middleware(request: NextRequest) {
  // Using Better Auth's built-in session handling via our utility function
  const session = await getSessionFromRequest(request);
  
  // Get user role from session using our utility function
  const userRole = getUserRole(session);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/sign-in', '/sign-up', '/laporkan-kasus', '/cek-status'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  // If user is not authenticated and trying to access a protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If user is authenticated and tries to access sign-in/sign-up, redirect to appropriate dashboard
  if (session && (request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up')) {
    if (userRole === 'SATGAS' || userRole === 'REKTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Regular user goes to a different page or home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Role-based access control for admin routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Only satgas and rektor can access dashboard
    if (userRole !== 'SATGAS' && userRole !== 'REKTOR') {
      // Regular users can't access dashboard - redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Specific role requirements for different dashboard sections
  if (request.nextUrl.pathname.startsWith('/dashboard/rektor')) {
    if (userRole !== 'REKTOR') {
      // Only rektor can access rektor dashboard sections
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Specific permissions for different dashboard sections
  if (request.nextUrl.pathname.startsWith('/dashboard/laporan')) {
    if (userRole !== 'SATGAS' && userRole !== 'REKTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/dashboard/investigasi')) {
    if (userRole !== 'SATGAS' && userRole !== 'REKTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/dashboard/rekomendasi')) {
    if (userRole !== 'SATGAS' && userRole !== 'REKTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/dashboard/anggota')) {
    if (userRole !== 'SATGAS' && userRole !== 'REKTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/dashboard/dokumen')) {
    if (userRole !== 'SATGAS' && userRole !== 'REKTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // API route protection
  if (request.nextUrl.pathname.startsWith('/api/reports') &&
      !request.nextUrl.pathname.includes('/check-status')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (userRole !== 'SATGAS' && userRole !== 'REKTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

// Specify which routes the middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
  // Force the middleware to run on the server, not edge runtime
  runtime: 'nodejs',
};