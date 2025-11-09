'use client';

import { useSession } from '@/lib/auth/auth-client';
import { getNormalizedRoleFromSession } from '@/lib/auth/auth-utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function RoleGuard({ children, requiredRoles = [] }: RoleGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('RoleGuard - Session status:', { session: !!session, isPending });
    console.log('RoleGuard - User role:', getNormalizedRoleFromSession(session));
    console.log('RoleGuard - Required roles:', requiredRoles);

    if (!isPending && !session) {
      console.log('RoleGuard - Redirecting to sign-in: no session');
      router.push('/sign-in');
    } else if (session && requiredRoles.length > 0 && !requiredRoles.map(r => r.toUpperCase()).includes(getNormalizedRoleFromSession(session) || '')) {
      console.log('RoleGuard - Redirecting to home: insufficient role');
      router.push('/');
    } else if (session) {
      console.log('RoleGuard - Access granted');
    }
  }, [session, isPending, router, requiredRoles]);

  // Show loading state while checking session
  if (isPending) {
    console.log('RoleGuard - Showing loading state: session check in progress');
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
    console.log('RoleGuard - Showing loading state: no session');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700 mb-4"></div>
          <p className="text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  const userRole = getNormalizedRoleFromSession(session) || '';
  if (requiredRoles.length > 0 && !requiredRoles.map(r => r.toUpperCase()).includes(userRole)) {
    console.log('RoleGuard - Showing loading state: insufficient role');
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
  console.log('RoleGuard - Rendering children');
  return <>{children}</>;
}