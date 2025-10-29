'use client';

import { useSession } from '@/lib/auth-client';
import { getNormalizedRoleFromSession } from '@/lib/auth-utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RektorRoleGuardProps {
  children: React.ReactNode;
}

export function RektorRoleGuard({ children }: RektorRoleGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (!isPending && !session) {
      // Redirect to sign in if not authenticated
      router.push('/sign-in');
    } else if (session && getNormalizedRoleFromSession(session) !== 'REKTOR') {
      // Redirect to main dashboard if user doesn't have REKTOR role
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  // Show loading state while checking session
  if (isPending || (!session && !isPending) || (session && getNormalizedRoleFromSession(session) !== 'REKTOR')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700 mb-4"></div>
          <p className="text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  // Render children if user has REKTOR role
  return <>{children}</>;
}