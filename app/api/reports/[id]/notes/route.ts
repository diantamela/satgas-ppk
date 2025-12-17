import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { checkAuth } from "@/lib/auth";
import { notifyReportUpdated } from "@/lib/utils/notifications";
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

// POST /api/reports/[id]/notes - Add notes to report
export async function POST(
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

    const { noteType, notes } = body;

    if (!notes || !notes.trim()) {
      return Response.json(
        { success: false, message: "Catatan tidak boleh kosong" },
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

    // Get report data for notification
    const report = await db.report.findUnique({
      where: { id: reportId },
      select: { id: true, reporterId: true, reportNumber: true },
    });

    if (!report) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Prepare update data based on note type
    const updateData: any = {};

    switch (noteType) {
      case 'verification':
      case 'investigation':
        // For now, store all notes in decisionNotes field
        // In a real app, you might want to add separate fields to the schema
        updateData.decisionNotes = notes;
        break;
      case 'recommendation':
        updateData.recommendation = notes;
        break;
      default:
        return Response.json(
          { success: false, message: "Tipe catatan tidak valid" },
          { status: 400 }
        );
    }

    // Update the report with notes
    const updatedReport = await reportService.updateReport(reportId, updateData);

    if (!updatedReport) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Send notification to the reporter
    if (report.reporterId) {
      try {
        await notifyReportUpdated(
          reportId,
          report.reporterId,
          report.reportNumber,
          currentUser.name,
          'note_added'
        );
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the whole request if notification fails
      }
    }

    return Response.json({
      success: true,
      report: updatedReport,
      message: "Catatan berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error adding notes to report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat menambahkan catatan" },
      { status: 500 }
    );
  }
}