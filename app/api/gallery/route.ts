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

// UPDATE operation (PUT/PATCH)
export async function PUT(request: NextRequest) {
  try {
    // Check if gallery model is available
    if (!(db as any).gallery) {
      console.error('Gallery model is not available in Prisma client');
      return Response.json({ 
        error: 'Gallery functionality is temporarily unavailable. Please contact administrator.',
        code: 'MODEL_NOT_AVAILABLE'
      }, { status: 503 });
    }

    // Verify user session
    const user = await getUserFromSession(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check content type to determine how to parse the request
    const contentType = request.headers.get('content-type');
    let id, title, description, date, location, category;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData (with file upload)
      const formData = await request.formData();
      id = formData.get('id') as string;
      title = formData.get('title') as string;
      description = formData.get('description') as string;
      date = formData.get('date') as string;
      location = formData.get('location') as string;
      category = formData.get('category') as string;
    } else {
      // Handle JSON (without file upload)
      const data = await request.json();
      ({ id, title, description, date, location, category } = data);
    }

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if the item exists and user has permission
    const existingItem = await (db as any).gallery.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return Response.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    // Only allow owner or admin to update
    if (existingItem.uploadedById !== user.id && user.role !== 'SATGAS') {
      return Response.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {
      ...(title && { title }),
      ...(description && { description }),
      ...(date && { date }),
      ...(location && { location }),
      ...(category && { category })
    };

    // Check if there's a new file to upload (only for FormData)
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (file && file.size > 0) {
        // Process the file upload
        const result = await processFileUpload(formData, 'gallery');
        
        if (!result.success) {
          return Response.json({ error: result.error }, { status: 400 });
        }
        
        updateData.image = result.filePath!;
      }
    }

    // Update the item
    const updatedItem = await (db as any).gallery.update({
      where: { id },
      data: updateData
    });

    return Response.json({
      message: 'Gallery item updated successfully',
      galleryItem: updatedItem
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE operation
export async function DELETE(request: NextRequest) {
  try {
    // Check if gallery model is available
    if (!(db as any).gallery) {
      console.error('Gallery model is not available in Prisma client');
      return Response.json({ 
        error: 'Gallery functionality is temporarily unavailable. Please contact administrator.',
        code: 'MODEL_NOT_AVAILABLE'
      }, { status: 503 });
    }

    // Verify user session
    const user = await getUserFromSession(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ID from URL parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if the item exists and user has permission
    const existingItem = await (db as any).gallery.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return Response.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    // Only allow owner or admin to delete
    if (existingItem.uploadedById !== user.id && user.role !== 'SATGAS') {
      return Response.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Delete the item
    await (db as any).gallery.delete({
      where: { id }
    });

    return Response.json({
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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