import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export async function GET() {
  console.log('[SESSION_API] Starting session check...');

  try {
    console.log('[SESSION_API] Getting cookies...');
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    console.log('[SESSION_API] Session token present:', !!sessionToken);

    if (!sessionToken) {
      console.log('[SESSION_API] No session token, returning null');
      return NextResponse.json({ user: null });
    }

    console.log('[SESSION_API] Hashing token...');
    const tokenHash = sha256(sessionToken);

    console.log('[SESSION_API] Querying database...');
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
    console.log('[SESSION_API] Database query result:', !!session);

    if (!session) {
      console.log('[SESSION_API] No valid session found');
      return NextResponse.json({ user: null });
    }

    console.log('[SESSION_API] Session found, returning user data');
    return NextResponse.json({
      user: session.user,
    });
  } catch (error) {
    console.error('[SESSION_API_ERROR] Full error:', error);
    console.error('[SESSION_API_ERROR] Error code:', (error as any)?.code);
    console.error('[SESSION_API_ERROR] Error message:', (error as any)?.message);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}