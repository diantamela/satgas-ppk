import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { notifyInvestigationProcessCreated } from "@/lib/utils/notifications";

export const runtime = "nodejs";

// GET /api/reports/[id]/process - Get investigation process for a report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS', 'REKTOR'])) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: reportId } = await params;

    if (!reportId) {
      return Response.json(
        { success: false, message: "Report ID is required" },
        { status: 400 }
      );
    }

    // Get investigation process
    const process = await reportService.getInvestigationProcessByReportId(reportId);

    return Response.json({
      success: true,
      process,
    });
  } catch (error) {
    console.error("Error fetching investigation process:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil data proses investigasi" },
      { status: 500 }
    );
  }
}

// POST /api/reports/[id]/process - Create investigation process for a report
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS', 'REKTOR'])) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: reportId } = await params;

    if (!reportId) {
      return Response.json(
        { success: false, message: "Report ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      startDateTime,
      endDateTime,
      location,
      methods,
      partiesInvolved,
      otherPartiesDetails,
      teamMembers,
      consentObtained,
      consentDocumentation,
      riskNotes,
      planSummary,
      followUpAction,
      followUpDate,
      followUpNotes,
      accessLevel,
      uploadedFiles
    } = body;

    if (!location) {
      return Response.json(
        { success: false, message: "Location is required" },
        { status: 400 }
      );
    }

    // Get the report data first for notification
    const report = await reportService.getReportById(reportId);
    if (!report) {
      return Response.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    // Create investigation process
    const process = await reportService.createInvestigationProcess({
      reportId,
      startDateTime: startDateTime ? new Date(startDateTime) : undefined,
      endDateTime: endDateTime ? new Date(endDateTime) : undefined,
      location,
      methods: methods || [],
      partiesInvolved: partiesInvolved || [],
      otherPartiesDetails,
      teamMembers: teamMembers || [],
      consentObtained: consentObtained || false,
      consentDocumentation,
      riskNotes,
      planSummary,
      followUpAction,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      followUpNotes,
      accessLevel: accessLevel || 'CORE_TEAM_ONLY',
      uploadedFiles: uploadedFiles || [],
      createdById: session.user.id
    });

    // Send notification to the reporter
    if (report.reporterId) {
      try {
        await notifyInvestigationProcessCreated(
          reportId,
          report.reporterId,
          report.reportNumber,
          session.user.name
        );
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the whole request if notification fails
      }
    }

    return Response.json({
      success: true,
      process,
      message: "Proses investigasi berhasil dibuat",
    });
  } catch (error) {
    console.error("Error creating investigation process:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat membuat proses investigasi" },
      { status: 500 }
    );
  }
}