import { NextRequest, NextResponse } from "next/server";

/** Baca role dari cookie tanpa akses DB (aman di Edge) */
export function readRoleFromCookie(req: NextRequest): "REKTOR" | "SATGAS" | "USER" | null {
  const r = req.cookies.get("role")?.value;
  return r === "REKTOR" || r === "SATGAS" || r === "USER" ? r : null;
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

  if (!hasSessionCookie) {
    return {
      authenticated: false,
      role: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

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