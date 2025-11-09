// satgas-ppks/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest, getUserRoleFromSession } from '@/lib/auth/auth-utils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 0) SELALU loloskan route AUTH API ---
  // Supaya POST /api/auth/signin /signup tidak di-redirect ke /sign-in
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // --- 0b) Asset & files umum: biarkan lewat ---
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next();
  }

  // --- 1) Public Routes (tanpa login) ---
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/laporkan-kasus',
    '/cek-status',
    '/edukasi',
    '/kontak',
    '/tentang',
  ];

  const isPublicRoute = publicRoutes.some((route) => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // --- 2) Ambil "session" (versi edge-safe: hanya cek cookie) & role (dari cookie 'role' jika ada) ---
  const session = await getSessionFromRequest(request); // { token?: string } | null
  const userRole = getUserRoleFromSession(session); // 'REKTOR' | 'SATGAS' | 'USER'

  // --- 3) Proteksi API non-auth (respon JSON, TIDAK redirect) ---
  if (pathname.startsWith('/api/')) {
    // Allow public API tertentu
    if (pathname.startsWith('/api/reports/check-status')) {
      return NextResponse.next();
    }

    // Wajib sesi untuk API lainnya
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC spesifik untuk API admin/documents/notifications/reports
    if (
      pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/documents') ||
      pathname.startsWith('/api/notifications') ||
      pathname.startsWith('/api/reports')
    ) {
      if (userRole !== 'SATGAS' && userRole !== 'REKTOR') {
        return NextResponse.json({ error: 'Forbidden. Role not authorized.' }, { status: 403 });
      }
    }

    return NextResponse.next();
  }

  // --- 4) Halaman privat: redirect ke /sign-in jika belum login ---
  if (!session && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // --- 5) User sudah login tapi masuk /sign-in /sign-up: arahkan sesuai role ---
  if (session && (pathname === '/sign-in' || pathname === '/sign-up')) {
    // Semua user yang login diarahkan ke dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // --- 6) Proteksi /dashboard: semua user yang login bisa akses ---
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    // Semua user yang login bisa akses dashboard
    // Role-based access control ditangani di dalam dashboard
  }

  // --- 7) Rektor-only routes ---
  const rektorSpecificRoutes = ['/dashboard/rektor'];
  if (rektorSpecificRoutes.some((route) => pathname.startsWith(route))) {
    if (userRole !== 'REKTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Matcher: proses SEMUA kecuali asset statis utama (API tetap diproses sesuai logika di atas)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
