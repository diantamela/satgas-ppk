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

      // TODO: Replace with actual database operation once schema is migrated
      // For now, fall back to simple scheduling
      try {
        // Try detailed scheduling first
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
      } catch (error) {
        console.warn("Detailed scheduling failed, falling back to simple scheduling:", error);

        // Fall back to simple scheduling
        const updatedReport = await reportService.scheduleInvestigation(
          reportId,
          new Date(startDateTime),
          session.user.id,
          `Jadwal: ${location} - ${planSummary || 'Investigasi terjadwal'}`
        );

        return Response.json({
          success: true,
          report: updatedReport,
          message: "Jadwal investigasi berhasil dibuat (mode sederhana)",
        });
      }
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