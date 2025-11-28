import { prisma } from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAuth, checkRole, forbiddenResponse } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Auth check - require SATGAS or REKTOR
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;
    if (!checkRole(auth.role, ['SATGAS', 'REKTOR'])) return forbiddenResponse();
    // Check if there are any users with invalid role values
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Check for any users with invalid role values
    const invalidRoleUsers = allUsers.filter((user: { role: string }) =>
      !['USER', 'SATGAS', 'REKTOR'].includes(user.role)
    );

    // Check for total user count by role
    const userCountByRole = {
      USER: allUsers.filter((u: { role: string }) => u.role === 'USER').length,
      SATGAS: allUsers.filter((u: { role: string }) => u.role === 'SATGAS').length,
      REKTOR: allUsers.filter((u: { role: string }) => u.role === 'REKTOR').length,
    };

    // Check for any duplicate emails (should not happen due to schema)
    const emailCountMap = new Map();
    const duplicateEmails = [];
    
    for (const user of allUsers) {
      const count = emailCountMap.get(user.email) || 0;
      emailCountMap.set(user.email, count + 1);
      
      if (emailCountMap.get(user.email) > 1) {
        duplicateEmails.push(user.email);
      }
    }

    // Check for users without required fields
    const usersWithMissingFields = allUsers.filter((user: { name: string | null; email: string }) =>
      !user.name || !user.email
    );

    const summary = {
      totalUsers: allUsers.length,
      userCountByRole,
      invalidRoleUsers: invalidRoleUsers.map((u: { id: string, email: string, role: string }) => ({ id: u.id, email: u.email, role: u.role })),
      duplicateEmails,
      usersWithMissingFields: usersWithMissingFields.map((u: { id: string, email: string, name: string }) => ({ id: u.id, email: u.email, name: u.name })),
      isConsistent: invalidRoleUsers.length === 0 && duplicateEmails.length === 0 && usersWithMissingFields.length === 0
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    console.error('Error checking data consistency:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}