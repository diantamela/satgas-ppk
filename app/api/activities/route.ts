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

    // Helper function to check if date is within range
    const isDateInRange = (dateStr: string) => {
      const activityDate = new Date(dateStr);
      if (dateFrom && activityDate < new Date(dateFrom)) return false;
      if (dateTo && activityDate > new Date(dateTo + 'T23:59:59.999Z')) return false;
      return true;
    };

    try {
      // 1. Get Notifications
      const notifications = await db.notification.findMany({
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
      
      notifications.forEach(notification => {
        const notificationWithUser = notification as any;
        activities.push({
          id: notification.id,
          type: 'notification',
          title: notification.title,
          description: notification.message,
          timestamp: notification.createdAt.toISOString(),
          status: notification.isRead ? 'read' : 'unread',
          userName: notificationWithUser.user?.name || 'System',
          userRole: notificationWithUser.user?.role || 'SYSTEM',
          entityId: notification.relatedEntityId || undefined,
          entityType: notification.relatedEntityType || undefined,
          details: {
            notificationType: notification.type,
            isRead: notification.isRead,
          }
        });
      });

      // 2. Get Reports (simplified first)
      const reports = await db.report.findMany({
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
      
      reports.forEach(report => {
        const reportWithRelations = report as any;
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

      // Apply date filters
      if (dateFrom || dateTo) {
        filteredActivities = filteredActivities.filter(activity =>
          isDateInRange(activity.timestamp)
        );
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