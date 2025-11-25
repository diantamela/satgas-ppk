import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";

export const runtime = "nodejs";

// POST /api/reports/schedule - Schedule an investigation
export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS', 'REKTOR'])) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if this is detailed scheduling (new format) or simple scheduling (legacy format)
    if (body.startDateTime && body.endDateTime && body.location) {
      // Detailed scheduling
      const {
        reportId,
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
        accessLevel
      } = body;

      if (!reportId || !startDateTime || !endDateTime || !location) {
        return Response.json(
          { success: false, message: "Report ID, start/end datetime, and location are required" },
          { status: 400 }
        );
      }

      // Create detailed investigation schedule
      const schedule = await reportService.createDetailedInvestigationSchedule({
        reportId,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
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
        createdById: session.user.id
      });

      return Response.json({
        success: true,
        schedule,
        message: "Jadwal investigasi detail berhasil dibuat",
      });
    } else {
      // Legacy simple scheduling
      const { reportId, scheduledDate, notes } = body;

      if (!reportId || !scheduledDate) {
        return Response.json(
          { success: false, message: "Report ID and scheduled date are required" },
          { status: 400 }
        );
      }

      // Schedule the investigation (legacy method)
      const updatedReport = await reportService.scheduleInvestigation(
        reportId,
        new Date(scheduledDate),
        session.user.id,
        notes
      );

      return Response.json({
        success: true,
        report: updatedReport,
        message: "Investigasi berhasil dijadwalkan",
      });
    }
  } catch (error) {
    console.error("Error scheduling investigation:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat menjadwalkan investigasi" },
      { status: 500 }
    );
  }
}