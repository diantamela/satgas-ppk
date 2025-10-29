// Utility helpers to normalize role and extract role from various session shapes
export function getNormalizedRoleFromSession(session: any): string | null {
  if (!session) return null;
  const raw =
    session?.user?.role ??
    session?.user?.data?.role ??
    session?.user?.metadata?.role ??
    session?.role ??
    session?.user?.user?.role ??
    null;
  if (!raw) return null;
  try {
    return String(raw).toUpperCase();
  } catch (e) {
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
    const response = await auth.$get('session', {
      headers: request.headers,
    });
    
    // If the response is successful, parse the JSON
    if (response.ok) {
      return await response.json();
    }
    
    // If not successful, return null
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