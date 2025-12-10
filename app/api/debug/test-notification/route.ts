import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { checkAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    const body = await request.json();
    const { userId, reportId, message } = body;

    // Get a sample report and user for testing
    const report = await db.report.findFirst({
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!report) {
      return NextResponse.json({
        success: false,
        message: "No reports found in database"
      });
    }

    const targetUserId = userId || report.reporter.id;
    const targetReportId = reportId || report.id;

    // Create test notification
    const notification = await db.notification.create({
      data: {
        userId: targetUserId,
        type: 'REPORT_STATUS_CHANGED',
        title: 'Test Notifikasi',
        message: message || `Ini adalah notifikasi test untuk laporan ${report.reportNumber}`,
        relatedEntityId: targetReportId,
        relatedEntityType: 'REPORT',
      },
    });

    return NextResponse.json({
      success: true,
      notification,
      message: 'Test notification created successfully',
      reportInfo: {
        reportId: report.id,
        reportNumber: report.reportNumber,
        reporterId: report.reporter.id,
        reporterName: report.reporter.name
      }
    });

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error creating test notification',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    // Get all notifications for current user
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error fetching notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}