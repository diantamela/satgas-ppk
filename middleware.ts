// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Baca role dari cookie tanpa akses DB (aman di Edge) */
function readRoleFromCookie(req: NextRequest): "REKTOR" | "SATGAS" | "USER" | null {
  const r = req.cookies.get("role")?.value;
  return r === "REKTOR" || r === "SATGAS" || r === "USER" ? r : null;
}

/** Apakah path ini aset publik yang harus dilewatkan */
function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/fonts/")
  );
}

/** Sanitasi nilai next agar tidak mengarah ke halaman auth dan memicu loop */
function sanitizeNext(nextPath: string) {
  if (!nextPath) return "";
  if (nextPath.startsWith("/sign-in") || nextPath.startsWith("/sign-up")) return "";
  return nextPath;
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Bebaskan preflight dan aset
  if (req.method === "OPTIONS" || isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  // Bebaskan seluruh auth API (signin/signup/signout/get-session, dsb)
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Rute publik (tanpa login)
  const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
    "/laporkan-kasus",
    "/cek-status",
    "/user/edukasi",
    "/user/kontak",
    "/tentang",
  ];
  const isPublic = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

  // Status sesi/role hanya dari cookie (jangan query DB di middleware)
  console.log('[MIDDLEWARE] Cookies present:', req.cookies.getAll().map(c => c.name));
  const hasSession = req.cookies.has("session");
  console.log('[MIDDLEWARE] hasSession (session):', hasSession);
  const role = readRoleFromCookie(req);
  console.log('[MIDDLEWARE] role from cookie:', role);

  // Proteksi API non-auth (JSON response, bukan redirect)
  if (pathname.startsWith("/api/")) {
    // API publik tertentu
    if (pathname.startsWith("/api/reports/check-status")) {
      return NextResponse.next();
    }

    // Wajib ada sesi untuk API lain
    if (!hasSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC dasar untuk admin/documents/notifications/reports
    if (
      pathname.startsWith("/api/admin") ||
      pathname.startsWith("/api/documents") ||
      pathname.startsWith("/api/notifications") ||
      pathname.startsWith("/api/reports")
    ) {
      if (role !== "SATGAS" && role !== "REKTOR") {
        return NextResponse.json({ error: "Forbidden. Role not authorized." }, { status: 403 });
      }
    }

    return NextResponse.next();
  }

  // Belum login dan bukan rute publik → ke /sign-in dengan ?next=...
  if (!hasSession && !isPublic) {
    const url = nextUrl.clone();
    url.pathname = "/sign-in";
    const intended = sanitizeNext(pathname + nextUrl.search);
    if (intended) url.searchParams.set("next", intended);
    return NextResponse.redirect(url);
  }

  // Commented out: Allow logged-in users to access sign-in/sign-up pages if needed
  // if (hasSession && (pathname === "/sign-in" || pathname === "/sign-up")) {
  //   const dest =
  //     role === "REKTOR" ? "/rektor/dashboard" :
  //     role === "SATGAS" ? "/satgas/dashboard" :
  //     "/user/dashboard";
  //   return NextResponse.redirect(new URL(dest, req.url));
  // }

  // Netralisasi /dashboard (jika ada link umum ke sini)
  if (pathname === "/dashboard") {
    const dest =
      role === "REKTOR" ? "/rektor/dashboard" :
      role === "SATGAS" ? "/satgas/dashboard" :
      "/user/dashboard";
    if (!hasSession) {
      const url = nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("next", "/dashboard");
      return NextResponse.redirect(url);
    }
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Proteksi rute khusus role
  if (pathname.startsWith("/rektor")) {
    if (role !== "REKTOR") return NextResponse.redirect(new URL("/rektor/dashboard", req.url));
  }
  if (pathname.startsWith("/satgas")) {
    if (role !== "SATGAS") return NextResponse.redirect(new URL("/satgas/dashboard", req.url));
  }
  if (pathname.startsWith("/user/dashboard")) {
    if (role !== "USER") {
      const dest =
        role === "REKTOR" ? "/rektor/dashboard" :
        role === "SATGAS" ? "/satgas/dashboard" :
        "/user/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Proses semua kecuali static bawaan Next/Image dan favicon
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
