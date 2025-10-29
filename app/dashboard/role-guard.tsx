'use client';

import { useSession } from '@/lib/auth-client';
import { getNormalizedRoleFromSession } from '@/lib/auth-utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function RoleGuard({ children, requiredRoles = ['SATGAS', 'REKTOR'] }: RoleGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (!isPending && !session) {
      // Redirect to sign in if not authenticated
      router.push('/sign-in');
    } else if (session && !requiredRoles.map(r => r.toUpperCase()).includes(getNormalizedRoleFromSession(session) || '')) {
      // Redirect to home if user doesn't have required role
      router.push('/');
    }
  }, [session, isPending, router, requiredRoles]);

  // Show loading state while checking session
  if (isPending || (!session && !isPending) || (session && !requiredRoles.map(r => r.toUpperCase()).includes(getNormalizedRoleFromSession(session) || ''))) {
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