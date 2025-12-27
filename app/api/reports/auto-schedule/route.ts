import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";

export const runtime = "nodejs";

// Helper function to send notifications
async function sendNotification(userId: string, type: string, title: string, message: string, relatedEntityId?: string, relatedEntityType?: string) {
  try {
    console.log('[AUTO-SCHEDULE NOTIFICATION] Sending notification:', { userId, type, title, message, relatedEntityId, relatedEntityType });
    
    let notificationType: any = 'REPORT_STATUS_CHANGED';
    switch (type) {
      case 'INVESTIGATION_SCHEDULED':
        notificationType = 'REPORT_STATUS_CHANGED';
        break;
      default:
        notificationType = 'REPORT_STATUS_CHANGED';
    }

    const notificationData = {
      userId,
      type: notificationType,
      title,
      message,
      relatedEntityId: relatedEntityId || null,
      relatedEntityType: relatedEntityType || null,
    };
    
    const notification = await db.notification.create({
      data: notificationData
    });
    
    console.log('[AUTO-SCHEDULE NOTIFICATION] Notification created successfully:', notification);
  } catch (error) {
    console.error('[AUTO-SCHEDULE NOTIFICATION] Error sending notification:', error);
  }
}

// POST /api/reports/auto-schedule - Automatically schedule IN_PROGRESS reports
export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS'])) {
      return Response.json(
        { success: false, message: "Unauthorized - Hanya anggota satgas yang dapat menggunakan fitur penjadwalan otomatis" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      scheduledBy, 
      scheduleConfig 
    } = body;

    if (!scheduledBy) {
      return Response.json(
        { success: false, message: "User ID penjadwal harus disediakan" },
        { status: 400 }
      );
    }

    // Get scheduling statistics before auto-scheduling
    const statsBefore = await reportService.getSchedulingStats();

    // Perform automatic scheduling
    const result = await reportService.autoScheduleInProgressReports(
      scheduledBy,
      scheduleConfig || {
        defaultLocation: 'Ruang pertemuan satgas',
        defaultDuration: 2,
        autoAssignTeam: false
      }
    );

    // Get updated statistics
    const statsAfter = await reportService.getSchedulingStats();

    // Send notifications to reporters for each scheduled report
    if (result.scheduledReports && result.scheduledReports.length > 0) {
      for (const report of result.scheduledReports) {
        if (report.reporterId) {
          await sendNotification(
            report.reporterId,
            'INVESTIGATION_SCHEDULED',
            'Investigasi Dijadwalkan Otomatis',
            `Jadwal investigasi untuk laporan ${report.reportNumber} telah dibuat secara otomatis. ${scheduleConfig?.defaultLocation ? `Lokasi: ${scheduleConfig.defaultLocation}.` : ''} Silakan hubungi satgas untuk informasi lebih lanjut.`,
            report.id,
            'REPORT'
          );
        }
      }
    }

    return Response.json({
      success: true,
      message: `Penjadwalan otomatis berhasil! ${result.scheduledCount} laporan telah dijadwalkan dan notifikasi telah dikirim ke pelapor.`,
      data: {
        scheduledReports: result.scheduledReports,
        scheduledCount: result.scheduledCount,
        stats: {
          before: statsBefore,
          after: statsAfter,
          newlyScheduled: result.scheduledCount
        }
      }
    });

  } catch (error) {
    console.error("Error in auto-schedule reports:", error);
    return Response.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat melakukan penjadwalan otomatis",
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// GET /api/reports/auto-schedule/stats - Get scheduling statistics
export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS', 'REKTOR'])) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeReports = searchParams.get('includeReports') === 'true';

    // Get scheduling statistics
    const stats = await reportService.getSchedulingStats();
    
    // Get IN_PROGRESS reports that need scheduling if requested
    let inProgressReports: any[] = [];
    if (includeReports) {
      inProgressReports = await reportService.getInProgressReportsNeedingSchedule();
    }

    return Response.json({
      success: true,
      data: {
        stats,
        inProgressReports: includeReports ? inProgressReports : undefined,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error getting scheduling stats:", error);
    return Response.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat mengambil statistik penjadwalan",
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}