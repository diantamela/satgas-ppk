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

    // Check if this is comprehensive scheduling (has activityTitle/activityType)
    const isComprehensive = body.activityTitle && body.activityType;
    
    if (isComprehensive) {
      // Comprehensive scheduling with all proposed features
      try {
        const process = await reportService.createComprehensiveInvestigationSchedule({
          // Basic information
          reportId: body.reportId,
          activityTitle: body.activityTitle,
          activityType: body.activityType,
          startDateTime: body.startDateTime ? new Date(body.startDateTime) : undefined,
          endDateTime: body.endDateTime ? new Date(body.endDateTime) : undefined,
          estimatedDuration: body.estimatedDuration,
          location: body.location,
          locationType: body.locationType,
          
          // Investigation details
          methods: body.methods || [],
          partiesInvolved: body.partiesInvolved || [],
          otherPartiesDetails: body.otherPartiesDetails,
          purpose: body.purpose,
          
          // Equipment and logistics
          equipmentChecklist: body.equipmentChecklist || [],
          otherEquipmentDetails: body.otherEquipmentDetails,
          
          // Team management
          teamMembers: body.teamMembers || [],
          
          // Companion requirements
          companionRequirements: body.companionRequirements || [],
          companionDetails: body.companionDetails,
          
          // Internal notes and planning
          internalSatgasNotes: body.internalSatgasNotes,
          riskNotes: body.riskNotes,
          consentObtained: body.consentObtained || false,
          consentDocumentation: body.consentDocumentation,
          
          // Follow-up planning
          nextStepsAfterCompletion: body.nextStepsAfterCompletion,
          followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
          followUpNotes: body.followUpNotes,
          
          // Access control
          accessLevel: body.accessLevel || 'CORE_TEAM_ONLY',
          
          // Auto-populated info
          caseAutoInfo: body.caseAutoInfo,
          caseSummary: body.caseSummary,
          
          createdById: session.user.id
        });

        return Response.json({
          success: true,
          process,
          message: "Proses investigasi komprehensif berhasil dibuat",
        });
      } catch (error) {
        console.warn("Comprehensive scheduling failed, falling back to detailed scheduling:", error);

        // Fall back to detailed scheduling
        const process = await reportService.createDetailedInvestigationProcess({
          reportId: body.reportId,
          startDateTime: body.startDateTime ? new Date(body.startDateTime) : undefined,
          endDateTime: body.endDateTime ? new Date(body.endDateTime) : undefined,
          location: body.location,
          methods: body.methods || [],
          partiesInvolved: body.partiesInvolved || [],
          otherPartiesDetails: body.otherPartiesDetails,
          teamMembers: body.teamMembers || [],
          consentObtained: body.consentObtained || false,
          consentDocumentation: body.consentDocumentation,
          riskNotes: body.riskNotes,
          planSummary: body.purpose,
          followUpAction: body.nextStepsAfterCompletion,
          followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
          followUpNotes: body.followUpNotes,
          accessLevel: body.accessLevel || 'CORE_TEAM_ONLY',
          uploadedFiles: [],
          createdById: session.user.id
        });

        return Response.json({
          success: true,
          process,
          message: "Proses investigasi detail berhasil dibuat",
        });
      }
    } else if (body.location) {
      // Detailed scheduling (legacy detailed format)
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
        accessLevel,
        uploadedFiles
      } = body;

      if (!reportId || !location) {
        return Response.json(
          { success: false, message: "Report ID and location are required" },
          { status: 400 }
        );
      }

      // Detailed scheduling
      try {
        const process = await reportService.createDetailedInvestigationProcess({
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

        return Response.json({
          success: true,
          process,
          message: "Proses investigasi detail berhasil dibuat",
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