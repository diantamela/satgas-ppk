import { NextRequest, NextResponse } from "next/server";

/** Baca role dari cookie tanpa akses DB (aman di Edge) */
export function readRoleFromCookie(req: NextRequest): "REKTOR" | "SATGAS" | "USER" | null {
  const roleCookie = req.cookies.get("role");
  console.log("🍪 Role cookie found:", roleCookie ? { name: roleCookie.name, value: roleCookie.value } : null);
  
  const r = roleCookie?.value;
  const validRole = r === "REKTOR" || r === "SATGAS" || r === "USER" ? r : null;
  
  console.log("👤 Parsed role:", validRole);
  return validRole;
}

/** Check if user has session */
export function hasSession(req: NextRequest): boolean {
  return req.cookies.has("session");
}

/** Auth check result */
export interface AuthResult {
  authenticated: boolean;
  role: "REKTOR" | "SATGAS" | "USER" | null;
  error?: NextResponse;
}

/** Perform authentication check */
export function checkAuth(req: NextRequest): AuthResult {
  const hasSessionCookie = hasSession(req);
  const role = readRoleFromCookie(req);

  console.log("🔍 Auth check details:", {
    hasSessionCookie,
    role,
    cookies: Object.fromEntries(req.cookies.getAll().map(c => [c.name, c.value]))
  });

  if (!hasSessionCookie) {
    console.log("❌ No session cookie found");
    return {
      authenticated: false,
      role: null,
      error: NextResponse.json({ error: "Unauthorized", details: "No session found" }, { status: 401 })
    };
  }

  if (!role) {
    console.log("❌ No role found in cookie");
    return {
      authenticated: false,
      role: null,
      error: NextResponse.json({ error: "Unauthorized", details: "No role found" }, { status: 401 })
    };
  }

  console.log("✅ Authentication successful");
  return {
    authenticated: true,
    role
  };
}

/** Check if user has required role */
export function checkRole(role: "REKTOR" | "SATGAS" | "USER" | null, requiredRoles: ("REKTOR" | "SATGAS" | "USER")[]): boolean {
  return role !== null && requiredRoles.includes(role);
}

/** Create forbidden response */
export function forbiddenResponse(): NextResponse {
  return NextResponse.json({ error: "Forbidden. Role not authorized." }, { status: 403 });
}