import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { reportService } from "@/lib/services/reports/report-service";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";
import { notifyReportStatusChange } from "@/lib/utils/notifications";

export const runtime = "nodejs";

// GET /api/reports/[id]/results - Get investigation results for a report
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

    // Get investigation results for this report
    const results = await db.investigationResult.findMany({
      where: { reportId },
      orderBy: { createdAt: 'desc' }
    });

    return Response.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error fetching investigation results:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil data hasil investigasi" },
      { status: 500 }
    );
  }
}

// POST /api/reports/[id]/results - Create investigation result/Berita Acara
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS'])) {
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
      processId,
      // Auto-populated metadata
      schedulingId,
      schedulingTitle,
      schedulingDateTime,
      schedulingLocation,
      caseTitle,
      reportNumber,
      
      // Attendance tracking
      satgasMembersPresent,
      partiesPresent,
      identityVerified,
      attendanceNotes,
      
      // Key investigation notes
      partiesStatementSummary,
      newPhysicalEvidence,
      evidenceFiles,
      statementConsistency,
      
      // Interim conclusions and recommendations
      sessionInterimConclusion,
      recommendedImmediateActions,
      caseStatusAfterResult,
      statusChangeReason,
      
      // Digital authentication
      dataVerificationConfirmed,
      creatorDigitalSignature,
      creatorSignerName,
      creatorSignatureDate,
      chairpersonDigitalSignature,
      chairpersonSignerName,
      chairpersonSignatureDate,
      
      // Additional fields
      partiesDetailedAttendance,
      recommendedActionsDetails,
      documentHash,
      internalSatgasNotes
    } = body;

    // Validate required fields
    if (!processId || !partiesStatementSummary) {
      return Response.json(
        { success: false, message: "Process ID and parties statement summary are required" },
        { status: 400 }
      );
    }

    // Verify process belongs to this report
    const process = await db.investigationProcess.findFirst({
      where: {
        id: processId,
        reportId: reportId
      }
    });

    if (!process) {
      return Response.json(
        { success: false, message: "Process not found for this report" },
        { status: 404 }
      );
    }

    // Generate document hash for integrity
    const documentData = {
      processId,
      reportId,
      partiesStatementSummary,
      newPhysicalEvidence,
      sessionInterimConclusion,
      recommendedImmediateActions,
      caseStatusAfterResult,
      createdAt: new Date().toISOString()
    };
    
    const documentHashString = JSON.stringify(documentData);
    const hash = createHash('sha256').update(documentHashString).digest('hex');

    // Create investigation result with conditional fields for backward compatibility
    const investigationResultData: any = {
      processId,
      reportId,
      
      // Auto-populated metadata
      schedulingId,
      schedulingTitle,
      schedulingDateTime: schedulingDateTime ? new Date(schedulingDateTime) : null,
      schedulingLocation,
      caseTitle,
      reportNumber,
      
      // Attendance tracking
      satgasMembersPresent: satgasMembersPresent || [],
      partiesPresent: partiesPresent || [],
      identityVerified: identityVerified || false,
      attendanceNotes,
      
      // Key investigation notes
      partiesStatementSummary,
      newPhysicalEvidence,
      evidenceFiles: evidenceFiles || [],
      statementConsistency,
      
      // Interim conclusions and recommendations
      sessionInterimConclusion,
      recommendedImmediateActions: recommendedImmediateActions || [],
      caseStatusAfterResult: caseStatusAfterResult || 'UNDER_INVESTIGATION',
      statusChangeReason,
      
      // Digital authentication
      dataVerificationConfirmed: dataVerificationConfirmed || false,
      creatorDigitalSignature,
      creatorSignatureDate: creatorSignatureDate ? new Date(creatorSignatureDate) : null,
      chairpersonDigitalSignature,
      chairpersonSignatureDate: chairpersonSignatureDate ? new Date(chairpersonSignatureDate) : null,
      
      // Additional fields
      partiesDetailedAttendance: partiesDetailedAttendance || {},
      recommendedActionsDetails: recommendedActionsDetails || {},
      documentHash: hash,
      internalSatgasNotes
    };

    // Add signer name fields only if they exist (for backward compatibility)
    if (creatorSignerName) {
      investigationResultData.creatorSignerName = creatorSignerName;
    }
    if (chairpersonSignerName) {
      investigationResultData.chairpersonSignerName = chairpersonSignerName;
    }

    // Create investigation result
    const investigationResult = await db.investigationResult.create({
      data: investigationResultData
    });

    // Get current report data for notification
    const currentReport = await db.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
        reportNumber: true,
        reporterId: true
      }
    });

    if (!currentReport) {
      return Response.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    const oldStatus = currentReport.status;

    // Update report status if needed
    let newReportStatus = null;
    if (caseStatusAfterResult && caseStatusAfterResult !== 'UNDER_INVESTIGATION') {
      switch (caseStatusAfterResult) {
        case 'READY_FOR_RECOMMENDATION':
          newReportStatus = 'COMPLETED';
          break;
        case 'FORWARDED_TO_REKTORAT':
          newReportStatus = 'COMPLETED';
          break;
        case 'CLOSED_TERMINATED':
          newReportStatus = 'COMPLETED';
          break;
      }

      if (newReportStatus) {
        await db.report.update({
          where: { id: reportId },
          data: {
            status: newReportStatus as any,
            updatedAt: new Date()
          }
        });

        // Send notification if status changed
        if (currentReport.reporterId) {
          try {
            await notifyReportStatusChange(
              reportId,
              currentReport.reporterId,
              currentReport.reportNumber,
              oldStatus,
              newReportStatus,
              session.user.name
            );
          } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
            // Don't fail the whole request if notification fails
          }
        }
      }
    }



    return Response.json({
      success: true,
      result: investigationResult,
      message: "Hasil investigasi berhasil dicatat",
    });
  } catch (error) {
    console.error("Error creating investigation result:", error);
    
    // Provide more specific error messages based on error type
    let errorMessage = "Terjadi kesalahan saat mencatat hasil investigasi";
    
    if (error instanceof SyntaxError) {
      errorMessage = "Format data tidak valid";
    } else if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      errorMessage = "Data yang dikirim tidak memenuhi validasi";
    } else if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as any).code;
      if (errorCode === 'P2002') {
        errorMessage = "Data sudah ada dalam sistem";
      } else if (errorCode === 'P2025') {
        errorMessage = "Data yang direferensikan tidak ditemukan";
      }
    }
    
    return Response.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}