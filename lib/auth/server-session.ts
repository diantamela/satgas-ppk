import { prisma } from '@/lib/database/prisma';
import crypto from 'crypto';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/**
 * Server-side function to get session from request (for API routes)
 */
export async function getSessionFromRequest(request: Request): Promise<any | null> {
  try {
    // Extract session token from cookies
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    // Parse cookies to find session token
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    const sessionToken = cookies['session'];
    if (!sessionToken) return null;

    const tokenHash = sha256(sessionToken);

    // Find valid session with user data
    const session = await prisma.session.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!session) return null;

    return {
      user: session.user,
    };
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}

/**
 * Server-side function to get session (for server components)
 */
export async function getServerSession(): Promise<any | null> {
  try {
    // Import cookies dynamically to avoid issues
    const { cookies } = await import('next/headers');

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) return null;

    const tokenHash = sha256(sessionToken);

    // Find valid session with user data
    const session = await prisma.session.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!session) return null;

    return {
      user: session.user,
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}