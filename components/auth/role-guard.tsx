'use client';

import { useSession } from '@/lib/auth/auth-client';
import { getNormalizedRoleFromSession } from '@/lib/auth/auth-utils';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function RoleGuard({ children, requiredRoles = [] }: RoleGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Memoize expensive calculations
  const userRole = useMemo(() => getNormalizedRoleFromSession(session), [session]);
  const normalizedRequiredRoles = useMemo(() => requiredRoles.map(r => r.toUpperCase()), [requiredRoles]);
  const hasRequiredRole = useMemo(() => 
    requiredRoles.length === 0 || normalizedRequiredRoles.includes(userRole || ''), 
    [requiredRoles, normalizedRequiredRoles, userRole]
  );

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
    } else if (!isPending && session && !hasRequiredRole) {
      router.push('/');
    }
  }, [session, isPending, router, hasRequiredRole]); // Remove requiredRoles from dependencies

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700 mb-4"></div>
          <p className="text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700 mb-4"></div>
          <p className="text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (requiredRoles.length > 0 && !hasRequiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700 mb-4"></div>
          <p className="text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  // Render children if user has required role
  return <>{children}</>;
}