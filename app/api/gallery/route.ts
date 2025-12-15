import { NextRequest } from 'next/server';
import { processFileUpload } from '@/lib/utils/file-upload';
import { db } from '@/db';
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
    // Check if gallery model is available
    if (!(db as any).gallery) {
      console.error('Gallery model is not available in Prisma client');
      return Response.json({ 
        error: 'Gallery functionality is temporarily unavailable. Please contact administrator.',
        code: 'MODEL_NOT_AVAILABLE'
      }, { status: 503 });
    }

    // Parse form data
    const formData = await request.formData();

    // Verify user session
    const user = await getUserFromSession(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string;
    const category = formData.get('category') as string;

    if (!title || !description || !date || !location || !category) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Process the file upload
    const result = await processFileUpload(formData, 'gallery');

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    // Save to database
    const galleryItem = await (db as any).gallery.create({
      data: {
        title,
        description,
        date,
        location,
        category,
        image: result.filePath!,
        uploadedById: user.id
      }
    });

    return Response.json({
      message: 'Gallery item uploaded successfully',
      galleryItem
    });
  } catch (error) {
    console.error('Error handling gallery upload:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if gallery model is available
    if (!(db as any).gallery) {
      console.error('Gallery model is not available in Prisma client');
      return Response.json({ 
        error: 'Gallery functionality is temporarily unavailable. Please contact administrator.',
        code: 'MODEL_NOT_AVAILABLE'
      }, { status: 503 });
    }

    const galleryItems = await (db as any).gallery.findMany({
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { name: true } } }
    });

    return Response.json(galleryItems);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}