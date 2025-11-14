import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    const roleCookie = cookieStore.get('role')?.value;

    if (!sessionToken) {
      return NextResponse.json({
        hasSession: false,
        roleCookie,
        message: 'No session token found'
      });
    }

    const tokenHash = sha256(sessionToken);

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

    if (!session) {
      return NextResponse.json({
        hasSession: false,
        roleCookie,
        message: 'Session not found in database'
      });
    }

    return NextResponse.json({
      hasSession: true,
      sessionData: {
        user: session.user,
        expiresAt: session.expiresAt
      },
      roleCookie,
      normalizedRole: session.user.role?.toUpperCase()
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      message: 'Error checking session'
    }, { status: 500 });
  }
}