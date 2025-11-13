import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear the session and role cookies
    cookieStore.delete('session');
    cookieStore.delete('role');

    return NextResponse.json({ ok: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ ok: false, message: 'Sign out failed' }, { status: 500 });
  }
}