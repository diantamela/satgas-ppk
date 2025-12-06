import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";

export const runtime = "nodejs";

// Helper function to send notifications
async function sendNotification(userId: string, type: string, title: string, message: string, relatedEntityId?: string, relatedEntityType?: string) {
  try {
    // Map string types to proper enum values
    let notificationType: any = 'INFO';
    switch (type) {
      case 'INVESTIGATION_SCHEDULED':
        notificationType = 'INFO';
        break;
      case 'INVESTIGATION_ASSIGNMENT':
        notificationType = 'INFO';
        break;
      default:
        notificationType = 'INFO';
    }

    await db.notification.create({
      data: {
        userId,
        type: notificationType,
        title,
        message,
        relatedEntityId: relatedEntityId || null,
        relatedEntityType: relatedEntityType || null,
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

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
    
    // Validate reportId is provided and not empty
    if (!body.reportId || body.reportId.trim() === '') {
      return Response.json(
        { success: false, message: "Report ID is required. Please select a report first." },
        { status: 400 }
      );
    }

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
          purpose: body.purpose,
          
          // Investigation details
          methods: body.methods || [],
          partiesInvolved: body.partiesInvolved || [],
          otherPartiesDetails: body.otherPartiesDetails,
          
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

        // Get report details for notifications
        const report = await db.report.findUnique({
          where: { id: body.reportId },
          include: {
            reporter: {
              select: { id: true, name: true, email: true }
            }
          }
        });

        // Send notification to reporter
        if (report?.reporter) {
          await sendNotification(
            report.reporter.id,
            'INVESTIGATION_SCHEDULED',
            'Investigasi Dijadwalkan',
            `Jadwal investigasi untuk laporan ${report.reportNumber} telah dibuat. Lokasi: ${body.location}`,
            body.reportId,
            'REPORT'
          );
        }

        // Notify team members
        if (body.teamMembers && body.teamMembers.length > 0) {
          for (const member of body.teamMembers) {
            await sendNotification(
              member.userId,
              'INVESTIGATION_ASSIGNMENT',
              'Penugasan Investigasi',
              `Anda telah ditugaskan dalam investigasi laporan ${report?.reportNumber}`,
              body.reportId,
              'REPORT'
            );
          }
        }

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

        // Get report details for notifications
        const report = await db.report.findUnique({
          where: { id: body.reportId },
          include: {
            reporter: {
              select: { id: true, name: true, email: true }
            }
          }
        });

        // Send notification to reporter
        if (report?.reporter) {
          await sendNotification(
            report.reporter.id,
            'INVESTIGATION_SCHEDULED',
            'Investigasi Dijadwalkan',
            `Jadwal investigasi untuk laporan ${report.reportNumber} telah dibuat. Lokasi: ${body.location}`,
            body.reportId,
            'REPORT'
          );
        }

        // Notify team members
        if (body.teamMembers && body.teamMembers.length > 0) {
          for (const member of body.teamMembers) {
            await sendNotification(
              member.userId,
              'INVESTIGATION_ASSIGNMENT',
              'Penugasan Investigasi',
              `Anda telah ditugaskan dalam investigasi laporan ${report?.reportNumber}`,
              body.reportId,
              'REPORT'
            );
          }
        }

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

        // Get report details for notifications
        const report = await db.report.findUnique({
          where: { id: body.reportId },
          include: {
            reporter: {
              select: { id: true, name: true, email: true }
            }
          }
        });

        // Send notification to reporter
        if (report?.reporter) {
          await sendNotification(
            report.reporter.id,
            'INVESTIGATION_SCHEDULED',
            'Investigasi Dijadwalkan',
            `Jadwal investigasi untuk laporan ${report.reportNumber} telah dibuat. Lokasi: ${body.location}`,
            body.reportId,
            'REPORT'
          );
        }

        // Notify team members
        if (body.teamMembers && body.teamMembers.length > 0) {
          for (const member of body.teamMembers) {
            await sendNotification(
              member.userId,
              'INVESTIGATION_ASSIGNMENT',
              'Penugasan Investigasi',
              `Anda telah ditugaskan dalam investigasi laporan ${report?.reportNumber}`,
              body.reportId,
              'REPORT'
            );
          }
        }

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

        // Get report details for notifications
        const report = await db.report.findUnique({
          where: { id: reportId },
          include: {
            reporter: {
              select: { id: true, name: true, email: true }
            }
          }
        });

        // Send notification to reporter
        if (report?.reporter) {
          await sendNotification(
            report.reporter.id,
            'INVESTIGATION_SCHEDULED',
            'Investigasi Dijadwalkan',
            `Jadwal investigasi untuk laporan ${report.reportNumber} telah dibuat. Lokasi: ${location}`,
            reportId,
            'REPORT'
          );
        }

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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { message: errorMessage, stack: errorStack });
    return Response.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat menjadwalkan investigasi",
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}