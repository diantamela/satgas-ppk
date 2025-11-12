// app/api/auth/signout/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getSessionFromRequest } from '@/lib/auth/auth-utils'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await getSessionFromRequest(req)

    if (session) {
      // Delete the session from database
      await prisma.session.delete({
        where: { tokenHash: session.tokenHash }
      })
    }

    // Clear the session cookie
    const res = NextResponse.json({
      ok: true,
      message: 'Signout berhasil'
    })

    res.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    return res
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json({
      ok: false,
      message: 'Terjadi kesalahan saat signout'
    }, { status: 500 })
  }
}

