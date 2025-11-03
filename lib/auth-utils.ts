// Utility helpers to normalize role and extract role from various session shapes
export function getNormalizedRoleFromSession(session: any): string | null {
  console.log('getNormalizedRoleFromSession - Input session:', session);

  if (!session) {
    console.log('getNormalizedRoleFromSession - No session provided');
    return null;
  }

  const raw =
    session?.user?.role ??
    session?.user?.data?.role ??
    session?.user?.metadata?.role ??
    session?.role ??
    session?.user?.user?.role ??
    null;

  console.log('getNormalizedRoleFromSession - Raw role value:', raw);

  if (!raw) {
    console.log('getNormalizedRoleFromSession - No raw role found');
    return null;
  }

  try {
    const normalized = String(raw).toUpperCase();
    console.log('getNormalizedRoleFromSession - Normalized role:', normalized);
    return normalized;
  } catch (e) {
    console.log('getNormalizedRoleFromSession - Error normalizing role:', e);
    return null;
  }
}

export function isRoleAllowed(session: any, allowedRoles: string[] = ['SATGAS', 'REKTOR']): boolean {
  const role = getNormalizedRoleFromSession(session);
  if (!role) return false;
  return allowedRoles.map(r => r.toUpperCase()).includes(role);
}
// lib/auth-utils.ts
import { auth } from './auth';

/**
 * Helper function to get session from request headers
 * This wraps the Better Auth API call to handle session retrieval properly
 */
export async function getSessionFromRequest(request: Request) {
  try {
    console.log('getSessionFromRequest - Attempting to get session');
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log('getSessionFromRequest - Session data:', session);

    // The api.getSession returns the session data directly, not a Response object
    if (session && session.user) {
      console.log('getSessionFromRequest - Valid session found');
      return session;
    }

    // If no valid session, return null
    console.log('getSessionFromRequest - No valid session found');
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Helper function to extract user role from session object
 * This ensures consistent access to user role across the application
 */
export function getUserRole(session: any): string {
  if (!session || !session.user) {
    return 'USER'; // Default role if no session or user
  }
  
  // Role is stored in session.user based on our auth configuration
  return session.user.role || 'USER';
}

/**
 * Type guard to check if user has specific role
 */
export function hasRole(session: any, role: string): boolean {
  return getUserRole(session) === role;
}

/**
 * Check if user has admin roles (SATGAS or REKTOR)
 */
export function isAdmin(session: any): boolean {
  const userRole = getUserRole(session);
  return userRole === 'SATGAS' || userRole === 'REKTOR';
}