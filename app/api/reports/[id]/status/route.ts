import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { checkAuth } from "@/lib/auth";
import { notifyReportStatusChange } from "@/lib/utils/notifications";
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

export const runtime = "nodejs";

// PUT /api/reports/[id]/status - Update report status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check - require SATGAS or REKTOR
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;
    if (!auth.role || !['SATGAS', 'REKTOR'].includes(auth.role)) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const reportId = resolvedParams.id;
    const body = await request.json();

    if (!reportId) {
      return Response.json(
        { success: false, message: "ID laporan tidak valid" },
        { status: 400 }
      );
    }

    const { status, notes } = body;

    if (!status) {
      return Response.json(
        { success: false, message: "Status harus disediakan" },
        { status: 400 }
      );
    }

    // Get current user for notification
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 401 }
      );
    }

    // Get the current report before updating to compare status
    const currentReport = await reportService.getReportById(reportId);
    if (!currentReport) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    const oldStatus = currentReport.status;

    // Map status to enum values
    const statusMap: { [key: string]: string } = {
      'pending': 'PENDING',
      'verified': 'VERIFIED',
      'scheduled': 'SCHEDULED',
      'in_progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'rejected': 'REJECTED'
    };

    const mappedStatus = statusMap[status.toLowerCase()] || status.toUpperCase();

    // Prepare update data
    const updateData: any = { status: mappedStatus };

    // Add notes based on status - use decisionNotes for all status-related notes
    if (notes) {
      updateData.decisionNotes = notes;
    }

    // Update the report status
    const updatedReport = await reportService.updateReport(reportId, updateData);

    if (!updatedReport) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Send notification to the reporter if status has changed
    if (oldStatus !== mappedStatus && currentReport.reporterId) {
      try {
        await notifyReportStatusChange(
          reportId,
          currentReport.reporterId,
          currentReport.reportNumber,
          oldStatus,
          mappedStatus,
          currentUser.name
        );
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the whole request if notification fails
      }
    }

    return Response.json({
      success: true,
      report: updatedReport,
      message: "Status laporan berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat memperbarui status laporan" },
      { status: 500 }
    );
  }
}