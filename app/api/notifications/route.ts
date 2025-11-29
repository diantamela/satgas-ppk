import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { db } from "@/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

// Helper function to get current user from session
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    if (!sessionToken) {
      return null;
    }

    const tokenHash = sha256(sessionToken);

    // Find valid session with user data
    const session = await db.session.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    const body = await request.json();
    const { userId, type, title, message, relatedEntityId, relatedEntityType } = body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'userId, type, title, dan message wajib diisi' 
        },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedEntityId: relatedEntityId || null,
        relatedEntityType: relatedEntityType || null,
      },
    });

    return NextResponse.json({
      success: true,
      notification,
      message: 'Notifikasi berhasil dibuat',
    });

  } catch (error) {
    console.error('Create notification error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat membuat notifikasi' 
      },
      { status: 500 }
    );
  }
}

// GET /api/notifications - Get notifications (for admin/satgas users)
export async function GET(request: NextRequest) {
  try {
    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: currentUser.id,
    };
    
    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    if (type) {
      where.type = type;
    }

    // Get total count
    const total = await db.notification.count({ where });

    // Get notifications
    const notifications = await db.notification.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat mengambil notifikasi' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'notificationId wajib diisi' },
        { status: 400 }
      );
    }

    // Update notification
    const notification = await db.notification.update({
      where: {
        id: notificationId,
        userId: currentUser.id, // Ensure user can only update their own notifications
      },
      data: {
        isRead: isRead !== undefined ? isRead : true,
        readAt: isRead !== undefined && isRead ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      notification,
      message: 'Notifikasi berhasil diperbarui',
    });

  } catch (error) {
    console.error('Update notification error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat memperbarui notifikasi' 
      },
      { status: 500 }
    );
  }
}