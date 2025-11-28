import { prisma } from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAuth, checkRole, forbiddenResponse } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Auth check - require SATGAS or REKTOR
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;
    if (!checkRole(auth.role, ['SATGAS', 'REKTOR'])) return forbiddenResponse();

    // Get the action from the request body
    const { action } = await request.json();
    
    if (action === 'fix-invalid-roles') {
      // Fix users with invalid role values
      const result = await prisma.user.updateMany({
        where: {
          role: {
            notIn: ['USER', 'SATGAS', 'REKTOR']
          }
        },
        data: {
          role: 'USER' // Set invalid roles back to default 'USER'
        }
      });

      return NextResponse.json({ 
        message: `Fixed ${result.count} users with invalid roles`, 
        fixedCount: result.count 
      });
    } 
    else if (action === 'ensure-default-roles') {
      // Ensure all users have a valid role (in case of null values)
      const result = await prisma.user.updateMany({
        where: {
          role: undefined
        },
        data: {
          role: 'USER'
        }
      });

      return NextResponse.json({ 
        message: `Ensured default role for ${result.count} users`, 
        fixedCount: result.count 
      });
    }
    else {
      return NextResponse.json({ error: 'Invalid action. Use "fix-invalid-roles" or "ensure-default-roles"' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Error fixing data consistency:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}