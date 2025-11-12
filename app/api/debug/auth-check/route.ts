import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/auth-utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Try fetching the session using Better Auth helper via our utility function
    const session = await getSessionFromRequest(request);

    // Check if session is valid and return appropriate response
    if (!session || !session.user) {
      return NextResponse.json({ ok: false, session: null });
    }

    return NextResponse.json({ ok: true, session });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
