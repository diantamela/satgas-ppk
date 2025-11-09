import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const runtime = 'nodejs' // penting untuk Prisma

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const emailNorm = String(email).toLowerCase()

    const exist = await prisma.user.findUnique({ where: { email: emailNorm } })
    if (exist) {
      return NextResponse.json({ ok: false, message: 'Email sudah terdaftar.' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email: emailNorm,
        password: hash,
        // affiliation default STUDENT dari schema, jadi nggak perlu diisi
      },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    return NextResponse.json({ ok: true, user })
  } catch (err: any) {
    // tangani error unik Prisma (email duplicate) juga, just in case
    if (err?.code === 'P2002') {
      return NextResponse.json({ ok: false, message: 'Email sudah terdaftar.' }, { status: 409 })
    }
    console.error('[SIGNUP_API_ERROR]', err)
    return NextResponse.json({ ok: false, message: 'Gagal mendaftar.' }, { status: 500 })
  }
}
