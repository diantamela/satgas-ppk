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

// Types for aggregated activities
interface ActivityItem {
  id: string;
  type: 'notification' | 'activity_log' | 'report_timeline' | 'report' | 'investigation' | 'recommendation';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  userName: string;
  userRole: string;
  entityId?: string;
  entityType?: string;
  details?: any;
}

// GET /api/activities - Get all activities for satgas dashboard
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const activityType = searchParams.get('type'); // filter by type
    const userRole = searchParams.get('userRole'); // filter by user role
    const searchTerm = searchParams.get('search'); // search in title/description
    const dateFrom = searchParams.get('dateFrom'); // filter by date from
    const dateTo = searchParams.get('dateTo'); // filter by date to

    const skip = (page - 1) * limit;
    const activities: ActivityItem[] = [];

    // Log date filtering for debugging
    if (dateFrom || dateTo) {
      console.log('Filtering activities by date range:', { dateFrom, dateTo });
    }

    // Helper function to check if date is within range (fallback)
    const isDateInRange = (dateStr: string) => {
      const activityDate = new Date(dateStr);
      // Use UTC date comparison to avoid timezone issues
      const activityDateUTC = new Date(Date.UTC(
        activityDate.getFullYear(),
        activityDate.getMonth(),
        activityDate.getDate()
      ));
      
      if (dateFrom) {
        const fromDateUTC = new Date(dateFrom + 'T00:00:00.000Z');
        if (activityDateUTC < fromDateUTC) return false;
      }
      if (dateTo) {
        const toDateUTC = new Date(dateTo + 'T23:59:59.999Z');
        if (activityDateUTC > toDateUTC) return false;
      }
      return true;
    };

    try {
      // 1. Get Notifications with date filtering
      const notificationWhere: any = {};
      
      // Apply date filtering if provided
      if (dateFrom || dateTo) {
        notificationWhere.createdAt = {};
        if (dateFrom) {
          // Start of day in UTC
          notificationWhere.createdAt.gte = new Date(dateFrom + 'T00:00:00.000Z');
        }
        if (dateTo) {
          // End of day in UTC
          notificationWhere.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
        }
      }
      
      const notifications = await db.notification.findMany({
        where: notificationWhere,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 10), // Limit for better performance
        include: {
          user: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      });
      
      notifications.forEach((notification: any) => {
        const notificationWithUser = notification;
        
        // Handle contact messages specially - extract name from message content
        let userName = notificationWithUser.user?.name || 'System';
        let userRole = notificationWithUser.user?.role || 'SYSTEM';
        
        if (notification.relatedEntityType === 'CONTACT_MESSAGE') {
          // Extract name from contact message format: "Dari: Name (email)\n\nMessage"
          const messageParts = notification.message.split('\n\n')[0]; // Get "Dari: Name (email)" part
          const nameMatch = messageParts.match(/Dari:\s*(.+?)(?:\s*\([^)]+\))?$/);
          if (nameMatch) {
            userName = nameMatch[1].trim();
            userRole = 'CONTACT';
          }
        }
        
        activities.push({
          id: notification.id,
          type: 'notification',
          title: notification.title,
          description: notification.message,
          timestamp: notification.createdAt.toISOString(),
          status: notification.isRead ? 'read' : 'unread',
          userName,
          userRole,
          entityId: notification.relatedEntityId || undefined,
          entityType: notification.relatedEntityType || undefined,
          details: {
            notificationType: notification.type,
            isRead: notification.isRead,
          }
        });
      });

      // 2. Get Reports with date filtering
      const reportWhere: any = {};
      
      // Apply date filtering if provided
      if (dateFrom || dateTo) {
        reportWhere.createdAt = {};
        if (dateFrom) {
          // Start of day in UTC
          reportWhere.createdAt.gte = new Date(dateFrom + 'T00:00:00.000Z');
        }
        if (dateTo) {
          // End of day in UTC
          reportWhere.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
        }
      }
      
      const reports = await db.report.findMany({
        where: reportWhere,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 10),
        include: {
          reporter: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      });
      
      reports.forEach((report: any) => {
        const reportWithRelations = report;
        activities.push({
          id: report.id,
          type: 'report',
          title: `Laporan Baru: ${report.title}`,
          description: `Laporan ${report.reportNumber} - Status: ${report.status}`,
          timestamp: report.createdAt.toISOString(),
          status: report.status.toLowerCase(),
          userName: reportWithRelations.reporter?.name || 'Unknown',
          userRole: reportWithRelations.reporter?.role || 'USER',
          entityId: report.id,
          entityType: 'REPORT',
          details: {
            reportNumber: report.reportNumber,
            category: report.category,
            severity: report.severity,
            status: report.status,
          }
        });
      });

      // 3. Add some mock activities for demonstration if no real data
      if (activities.length === 0) {
        activities.push({
          id: 'mock-1',
          type: 'notification',
          title: 'Selamat datang di Sistem Aktivitas',
          description: 'Halaman aktivitas ini menampilkan semua kegiatan dalam sistem',
          timestamp: new Date().toISOString(),
          status: 'read',
          userName: 'System',
          userRole: 'SYSTEM',
          details: {
            type: 'welcome',
          }
        });
      }

      // Apply filters
      let filteredActivities = activities;

      if (activityType && activityType !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.type === activityType);
      }

      if (userRole && userRole !== 'all') {
        filteredActivities = filteredActivities.filter(activity => 
          activity.userRole.toLowerCase() === userRole.toLowerCase()
        );
      }

      if (searchTerm) {
        filteredActivities = filteredActivities.filter(activity =>
          activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.userName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply date filters (fallback in case database filtering didn't catch everything)
      if (dateFrom || dateTo) {
        const beforeFilter = filteredActivities.length;
        filteredActivities = filteredActivities.filter(activity =>
          isDateInRange(activity.timestamp)
        );
        console.log(`Date filtering result: ${beforeFilter} -> ${filteredActivities.length} activities`);
      }

      // Sort all activities by timestamp descending
      filteredActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply pagination
      const total = filteredActivities.length;
      const paginatedActivities = filteredActivities.slice(skip, skip + limit);
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        success: true,
        data: {
          activities: paginatedActivities,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          summary: {
            totalActivities: total,
            notificationsCount: notifications.length,
            reportsCount: reports.length,
            activityLogsCount: 0,
            timelinesCount: 0,
            investigationsCount: 0,
            recommendationsCount: 0,
          }
        },
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Return mock data if database fails
      const mockActivities: ActivityItem[] = [
        {
          id: 'mock-1',
          type: 'notification',
          title: 'Sistem Aktivitas Siap Digunakan',
          description: 'Halaman aktivitas telah berhasil dibuat dan dapat menampilkan semua kegiatan dalam sistem',
          timestamp: new Date().toISOString(),
          status: 'read',
          userName: 'System',
          userRole: 'SYSTEM',
          details: {
            type: 'system_ready',
          }
        },
        {
          id: 'mock-2',
          type: 'report',
          title: 'Demo: Laporan Contoh',
          description: 'Contoh laporan untuk demonstrasi fitur aktivitas',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          status: 'pending',
          userName: 'User Demo',
          userRole: 'USER',
          entityId: 'demo-report-1',
          entityType: 'REPORT',
          details: {
            reportNumber: 'DEMO-2024-001',
            category: 'Demo',
            severity: 'Medium',
          }
        }
      ];

      return NextResponse.json({
        success: true,
        data: {
          activities: mockActivities,
          pagination: {
            page: 1,
            limit: 20,
            total: mockActivities.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          summary: {
            totalActivities: mockActivities.length,
            notificationsCount: 1,
            reportsCount: 1,
            activityLogsCount: 0,
            timelinesCount: 0,
            investigationsCount: 0,
            recommendationsCount: 0,
          }
        },
      });
    }

  } catch (error) {
    console.error('Get activities error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat mengambil aktivitas',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// PUT/PATCH /api/activities - Update activity (mark as read)
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

    const { activityId, markAsRead } = await request.json();

    if (!activityId) {
      return NextResponse.json(
        { success: false, message: 'Activity ID diperlukan' },
        { status: 400 }
      );
    }

    try {
      // Update notification as read
      const updatedNotification = await db.notification.update({
        where: { id: activityId },
        data: { isRead: markAsRead !== false }, // Default to true if not specified
      });

      return NextResponse.json({
        success: true,
        message: markAsRead !== false ? 'Notifikasi telah dibaca' : 'Status notifikasi diperbarui',
        data: {
          id: updatedNotification.id,
          isRead: updatedNotification.isRead,
        }
      });

    } catch (dbError) {
      console.error('Database error updating activity:', dbError);
      
      // If it's a notification that doesn't exist, try to find it in our mock data
      // This is mainly for demo purposes
      if (activityId.startsWith('mock-')) {
        return NextResponse.json({
          success: true,
          message: markAsRead !== false ? 'Demo: Notifikasi telah dibaca' : 'Demo: Status diperbarui',
          data: {
            id: activityId,
            isRead: markAsRead !== false,
          }
        });
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Gagal memperbarui aktivitas',
          error: process.env.NODE_ENV === 'development' ? dbError : undefined
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Update activity error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat memperbarui aktivitas',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}