import { prisma } from '@/lib/database/prisma';
import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAuth, checkRole, forbiddenResponse } from '@/lib/auth';

export const runtime = 'nodejs';

// API route to update user roles - should be protected in production
export async function PUT(request: NextRequest) {
  try {
    // Auth check - require SATGAS or REKTOR
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;
    if (!checkRole(auth.role, ['SATGAS', 'REKTOR'])) return forbiddenResponse();
    
    const body = await request.json();
    const { userId, newRole } = body;

    // Validate the role
    if (!['USER', 'SATGAS', 'REKTOR'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Valid roles are: USER, SATGAS, REKTOR' },
        { status: 400 }
      );
    }

    // Update the user's role in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ 
      message: `User role updated successfully`, 
      user: updatedUser 
    });
  } catch (err: any) {
    console.error('Error updating user role:', err);
    
    // Handle specific error cases
    if (err.code === 'P2025') { // Record not found error in Prisma
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET endpoint to retrieve all users and their roles
export async function GET(request: NextRequest) {
  try {
    // Auth check - require SATGAS or REKTOR
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;
    if (!checkRole(auth.role, ['SATGAS', 'REKTOR'])) return forbiddenResponse();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ users, total: users.length });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}