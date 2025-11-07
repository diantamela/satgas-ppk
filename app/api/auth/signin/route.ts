// app/api/auth/signin/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const runtime = 'nodejs'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // Temporarily reduce to 1 for testing
})

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

async function parseBody(req: NextRequest) {
  console.log('Parsing request body...');
  console.log('Content-Type:', req.headers.get('content-type'));
  console.log('Accept:', req.headers.get('accept'));

  // Coba JSON dulu
  try {
    const json = await req.json()
    console.log('JSON body:', json);
    const parsed = schema.safeParse(json)
    if (parsed.success) {
      console.log('JSON parsing successful');
      return parsed.data
    } else {
      console.log('JSON parsing failed:', parsed.error);
      return null
    }
  } catch (e) {
    console.log('JSON parsing error:', e);
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await parseBody(req)
    if (!data) {
      return NextResponse.json({ ok: false, message: 'Payload tidak valid' }, { status: 400 })
    }

    const email = data.email.toLowerCase() // Normalisasi email ke lowercase
    const password = data.password

    // Ensure database connection
    await prisma.$connect()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ ok: false, message: 'Email atau password salah.' }, { status: 401 })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return NextResponse.json({ ok: false, message: 'Email atau password salah.' }, { status: 401 })

    // Buat session
    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = sha256(token)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 hari

    // Ambil header langsung dari req.headers (tanpa next/headers)
    const userAgent = req.headers.get('user-agent') || ''
    const ip = req.headers.get('x-forwarded-for') || ''

    await prisma.session.create({
      data: { userId: user.id, tokenHash, expiresAt, userAgent, ip },
    })

    // Deteksi submit via form HTML (redirect) vs fetch (JSON)
    const isHtmlSubmit =
      (req.headers.get('accept') || '').includes('text/html') ||
      (req.headers.get('content-type') || '').includes('application/x-www-form-urlencoded')

    console.log('Signin successful for user:', user.email, 'role:', user.role);

    if (isHtmlSubmit) {
      console.log('HTML form submit detected, redirecting to dashboard');
      const res = NextResponse.redirect(new URL('/dashboard', req.url))
      res.cookies.set('session', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: expiresAt,
      })
      return res
    } else {
      console.log('JSON API call detected, returning success response');
      const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } })
      res.cookies.set('session', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: expiresAt,
      })
      return res
    }
  } catch (err: any) {
    console.error('[SIGNIN_ERROR]', err?.code || '', err?.message || err)
    return NextResponse.json({ ok: false, message: 'Signin gagal (500).' }, { status: 500 })
  }
}
