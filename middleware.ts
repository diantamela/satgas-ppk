// satgas-ppks/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest, getUserRole } from '@/lib/auth-utils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Public Routes: Semua rute yang boleh diakses TANPA LOGIN
  // Termasuk rute statis, sign-in/up, dan semua halaman informasi/edukasi
  const publicRoutes = [
    '/', 
    '/sign-in', 
    '/sign-up',
    '/laporkan-kasus', // Form pelaporan harus bisa diakses publik
    '/cek-status', 
    '/edukasi', 
    '/kontak', 
    '/tentang',
  ];

  // Cek apakah path saat ini adalah rute publik (termasuk sub-path-nya)
  // Misalnya, '/edukasi' mencakup '/edukasi' dan '/edukasi/definisi'
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // --- Autentikasi dan Redirects ---

  const session = await getSessionFromRequest(request);
  const userRole = getUserRole(session);
  
  // 2. Rute API Protection: Lindungi semua API kecuali yang diizinkan (misalnya, auth)
  // Catatan: API Auth biasanya sudah di-handle oleh library Auth Anda
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    // Izinkan API untuk cek status (akses publik)
    if (pathname.startsWith('/api/reports/check-status')) {
      return NextResponse.next();
    }

    // Lindungi API lainnya
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 3. Redirect ke Sign-In jika mencoba mengakses Rute Terlindungi tanpa sesi
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  // --- Logika Role-Based Access Control (RBAC) ---

  // 4. Redirect Authenticated User dari Sign-in/Sign-up
  if (session && (pathname === '/sign-in' || pathname === '/sign-up')) {
    // Arahkan ke dashboard utama untuk SATGAS/REKTOR
    if (userRole === 'SATGAS' || userRole === 'REKTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Arahkan pengguna non-staf ke homepage atau rute lain (misalnya /cek-status)
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 5. Dashboard Protection (Melindungi seluruh /dashboard)
  if (pathname.startsWith('/dashboard')) {
    // Check sudah dilakukan di step 3, tapi cek ulang untuk kejelasan
    if (!session) { 
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    // Semua rute /dashboard memerlukan peran SATGAS atau REKTOR
    if (userRole !== 'SATGAS' && userRole !== 'REKTOR') {
      // Redirect pengguna biasa (misalnya MAHASISWA) yang entah bagaimana mengakses /dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // 6. Akses Khusus REKTOR (Menggunakan logika OR yang lebih bersih)
  const rektorSpecificRoutes = ['/dashboard/rektor']; // Cek rute yang hanya untuk REKTOR
  
  if (rektorSpecificRoutes.some(route => pathname.startsWith(route))) {
    if (userRole !== 'REKTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // 7. API Role Protection yang lebih spesifik
  // (Asumsi semua API dashboard hanya diakses oleh SATGAS/REKTOR)
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/documents') || pathname.startsWith('/api/notifications') || pathname.startsWith('/api/reports')) {
    if (userRole !== 'SATGAS' && userRole !== 'REKTOR') {
      return NextResponse.json({ error: 'Forbidden. Role not authorized.' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Pastikan ini menangkap SEMUA rute, sehingga middleware dapat memeriksa dan mengabaikan rute publik secara internal.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  // runtime: 'nodejs', // Opsi ini tidak diperlukan di Next.js 13+ default (Edge), 
  // tapi jika Anda yakin butuh Node.js runtime, biarkan. Saya hapus agar default.
};