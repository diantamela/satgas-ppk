import { NextRequest } from "next/server";
import { notificationService } from "@/lib/services/report-service";

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newNotification = await notificationService.createNotification({
      reportId: body.reportId,
      recipient: body.recipient,
      notificationType: body.notificationType,
      message: body.message,
    });

    return Response.json({
      success: true,
      notification: newNotification,
      message: "Notifikasi berhasil dibuat",
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat membuat notifikasi" },
      { status: 500 }
    );
  }
}

// GET /api/notifications - Get notifications (for admin/satgas users)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    
    let notifications;
    if (reportId) {
      // Get notifications for a specific report
      notifications = await notificationService.getNotificationsByReportId(parseInt(reportId));
    } else {
      // For now, we'll just return an error since getting all notifications might be too much
      return Response.json({
        success: false,
        message: "reportId parameter is required",
      }, { status: 400 });
    }

    return Response.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil notifikasi" },
      { status: 500 }
    );
  }
}