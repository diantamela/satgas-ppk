import { NextRequest } from 'next/server';
import { processFileUpload } from '@/lib/utils/file-upload';
import { db } from '@/db';
import { getNormalizedRoleFromSession } from '@/lib/auth/auth-utils';
import crypto from 'crypto';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

// Helper function to get user from session
async function getUserFromSession(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return null;

    const tokenHash = sha256(sessionToken);
    const session = await db.session.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    return session?.user || null;
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
  }
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Parse form data once at the beginning
    const formData = await request.formData();

    // Verify user session
    const user = await getUserFromSession(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process the file upload
    const result = await processFileUpload(formData);

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 });
    }


    return Response.json({
      message: 'File uploaded successfully',
      filePath: result.filePath,
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}