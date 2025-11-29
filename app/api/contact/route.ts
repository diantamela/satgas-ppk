import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !subject || !message) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nama, subjek, dan pesan wajib diisi' 
        },
        { status: 400 }
      );
    }

    // Determine priority based on content
    let priority = 'MEDIUM';
    const messageLower = message.toLowerCase();
    const subjectLower = subject.toLowerCase();

    // Auto-detect emergency messages
    if (messageLower.includes('darurat') || 
        messageLower.includes('emergency') || 
        messageLower.includes('segera') ||
        subjectLower.includes('darurat') ||
        subjectLower.includes('emergency')) {
      priority = 'HIGH';
    }

    // Get all active satgas users
    const satgasUsers = await db.user.findMany({
      where: {
        role: 'SATGAS',
        isActive: true,
      },
    });

    // Create contact message notifications for all satgas users
    const notifications = await Promise.all(
      satgasUsers.map((user: any) =>
        db.notification.create({
          data: {
            userId: user.id,
            type: 'DOCUMENT_UPLOADED',
            title: `📧 Pesan Kontak: ${subject}`,
            message: `Dari: ${name}${email ? ` (${email})` : ''}\n\nPesan:\n${message}\n\nPrioritas: ${priority}`,
            relatedEntityType: 'CONTACT_MESSAGE',
            isRead: false,
          },
        })
      )
    );

    console.log(`Created ${notifications.length} contact notifications for satgas users`);

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dikirim ke Satuan Tugas PPK',
      data: {
        priority,
        notificationsSent: notifications.length,
      },
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat mengirim pesan' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isRead = searchParams.get('isRead');

    const skip = (page - 1) * limit;

    // Build where clause - only get contact messages
    const where: any = {
      type: 'DOCUMENT_UPLOADED',
    };
    
    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    // Get total count
    const total = await db.notification.count({ where });

    // Get contact message notifications
    const contactNotifications = await db.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
        messages: contactNotifications,
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
    console.error('Get contact messages error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat mengambil data pesan' 
      },
      { status: 500 }
    );
  }
}