import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    // Get session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ ok: false, message: 'Sesi tidak valid' }, { status: 401 });
    }

    const tokenHash = sha256(sessionToken);

    // Find valid session
    const session = await prisma.session.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return NextResponse.json({ ok: false, message: 'Sesi tidak valid' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: 'Data tidak valid' }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, session.user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ ok: false, message: 'Password saat ini salah' }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ ok: true, message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ ok: false, message: 'Terjadi kesalahan saat mengubah password' }, { status: 500 });
  }
}