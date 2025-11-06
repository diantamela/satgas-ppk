// satgas-ppks/lib/auth-utils.ts

import { auth } from './auth'; // Mengimpor instance auth utama

// Hapus import { Session } from 'next-auth'; untuk mengatasi Error 2307, 
// dan gunakan tipe 'any' atau buat tipe Session kustom Anda.

// --- Helper Role Normalization ---

/**
 * Utility helpers to normalize role and extract role from various session shapes
 */
export function getNormalizedRoleFromSession(session: any): string | null {
  // Logika normalisasi role yang kompleks
  const raw =
    session?.user?.role ??
    session?.user?.data?.role ??
    session?.user?.metadata?.role ??
    session?.role ??
    session?.user?.user?.role ??
    "USER"; // Default role

  if (!raw) return "USER"; // Default role jika tidak ditemukan

  try {
    return String(raw).toUpperCase();
  } catch (e) {
    console.error("Error normalizing role:", e);
    return "USER"; // Default role jika error
  }
}

// --- Fungsi untuk Middleware ---

/**
 * Helper function to get session from request headers (Used by middleware)
 */
export async function getSessionFromRequest(request: Request): Promise<any | null> {
  try {
    // Menggunakan Type Assertion pada auth untuk mengakses properti api
    const authInstance: any = auth;
    const session = await authInstance.api.getSession({
      headers: request.headers,
    });
    if (session && session.user) {
      return session;
    }
    return null;
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}

// --- Fungsi Baru untuk Route Handlers (API) dan Server Components ---

/**
 * Helper function to get the current session directly in Route Handlers or Server Components.
 */
export async function getSession(): Promise<any | null> {
    try {
        // Mendapatkan session dari instance auth
        const authInstance: any = auth;
        const session = await authInstance.api.getSession({
            headers: new Headers(),
        });
        
        if (session && session.user) {
            return session;
        }
        return null;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
}

// --- Helper Role Extraction dan Guards ---

/**
 * Helper function to extract user role from session object
 */
export function getUserRole(session: any): string {
    // Menggunakan fungsi normalisasi untuk konsistensi
    const normalizedRole = getNormalizedRoleFromSession(session);
    return normalizedRole || 'USER'; // Default role
}

/**
 * Check if user has admin roles (SATGAS or REKTOR)
 */
export function isAdmin(session: any): boolean {
  const userRole = getUserRole(session);
  return userRole === 'SATGAS' || userRole === 'REKTOR';
}

/**
 * Type guard to check if user has specific role
 */
export function hasRole(session: any, role: string): boolean {
    const userRole = getUserRole(session);
    // Perbandingan harus UPPERCASE
    return userRole === role.toUpperCase();
}

/**
 * Check if the session role is included in the list of allowed roles.
 */
export function isRoleAllowed(session: any, allowedRoles: string[] = ['SATGAS', 'REKTOR']): boolean {
  const role = getUserRole(session); 
  if (!role || role === 'USER') return false; 
  return allowedRoles.map(r => r.toUpperCase()).includes(role);
}