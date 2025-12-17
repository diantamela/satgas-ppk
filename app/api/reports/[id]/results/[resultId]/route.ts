import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";
import { notifyReportStatusChange } from "@/lib/utils/notifications";

export const runtime = "nodejs";

// GET /api/reports/[id]/results/[resultId] - Get specific investigation result
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resultId: string }> }
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

    const { id: reportId, resultId } = await params;

    if (!reportId || !resultId) {
      return Response.json(
        { success: false, message: "Report ID and Result ID are required" },
        { status: 400 }
      );
    }

    // Get the specific investigation result
    const investigationResult = await db.investigationResult.findFirst({
      where: {
        id: resultId,
        reportId: reportId
      },
      select: {
        id: true,
        processId: true,
        reportId: true,
        schedulingId: true,
        schedulingTitle: true,
        schedulingDateTime: true,
        schedulingLocation: true,
        caseTitle: true,
        reportNumber: true,
        satgasMembersPresent: true,
        partiesPresent: true,
        identityVerified: true,
        attendanceNotes: true,
        partiesStatementSummary: true,
        newPhysicalEvidence: true,
        evidenceFiles: true,
        statementConsistency: true,
        sessionInterimConclusion: true,
        recommendedImmediateActions: true,
        caseStatusAfterResult: true,
        statusChangeReason: true,
        dataVerificationConfirmed: true,
        creatorDigitalSignature: true,
        creatorSignatureDate: true,
        creatorSignerName: true,
        chairpersonDigitalSignature: true,
        chairpersonSignatureDate: true,
        chairpersonSignerName: true,
        partiesDetailedAttendance: true,
        recommendedActionsDetails: true,
        documentHash: true,
        internalSatgasNotes: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!investigationResult) {
      return Response.json(
        { success: false, message: "Investigation result not found" },
        { status: 404 }
      );
    }

    // Get evidence documents for this report
    const documents = await db.investigationDocument.findMany({
      where: {
        reportId: reportId,
        documentType: 'EVIDENCE'
      },
      include: {
        uploadedBy: {
          select: { name: true }
        }
      }
    });

    console.log('Found result:', investigationResult);
    console.log('Evidence files in result:', investigationResult.evidenceFiles);
    console.log('Investigation documents:', documents);

    return Response.json({
      success: true,
      result: {
        ...investigationResult,
        report: {
          documents: documents
        }
      }
    });

  } catch (error) {
    console.error("Error fetching investigation result:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil data hasil investigasi" },
      { status: 500 }
    );
  }
}

// PUT /api/reports/[id]/results/[resultId] - Update investigation result
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resultId: string }> }
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

    const { id: reportId, resultId } = await params;

    if (!reportId || !resultId) {
      return Response.json(
        { success: false, message: "Report ID and Result ID are required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      // Process data
      processId,
      location,
      methods,
      partiesInvolved,
      otherPartiesDetails,
      riskNotes,
      planSummary,
      accessLevel,
      
      // Results data
      schedulingTitle,
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
      internalSatgasNotes
    } = body;

    // Validate required fields
    if (!processId || !partiesStatementSummary) {
      return Response.json(
        { success: false, message: "Process ID and parties statement summary are required" },
        { status: 400 }
      );
    }

    // Verify the result exists and belongs to this report
    const existingResult = await db.investigationResult.findFirst({
      where: {
        id: resultId,
        reportId: reportId
      }
    });

    if (!existingResult) {
      return Response.json(
        { success: false, message: "Investigation result not found" },
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
      updatedAt: new Date().toISOString()
    };
    
    const documentHashString = JSON.stringify(documentData);
    const hash = createHash('sha256').update(documentHashString).digest('hex');

    console.log('API: Updating investigation result with evidenceFiles:', evidenceFiles);
    
    // Update investigation result
    const investigationResultData: any = {
      // Process data (if provided)
      ...(processId && { processId }),
      ...(location && { location }),
      ...(methods && { methods }),
      ...(partiesInvolved && { partiesInvolved }),
      ...(otherPartiesDetails && { otherPartiesDetails }),
      ...(riskNotes && { riskNotes }),
      ...(planSummary && { planSummary }),
      ...(accessLevel && { accessLevel }),
      
      // Results metadata
      ...(schedulingTitle && { schedulingTitle }),
      ...(schedulingLocation && { schedulingLocation }),
      ...(caseTitle && { caseTitle }),
      ...(reportNumber && { reportNumber }),
      
      // Attendance tracking
      ...(satgasMembersPresent !== undefined && { satgasMembersPresent }),
      ...(partiesPresent !== undefined && { partiesPresent }),
      ...(identityVerified !== undefined && { identityVerified }),
      ...(attendanceNotes && { attendanceNotes }),
      
      // Key investigation notes
      ...(partiesStatementSummary && { partiesStatementSummary }),
      ...(newPhysicalEvidence && { newPhysicalEvidence }),
      ...(evidenceFiles !== undefined && { evidenceFiles }),
      ...(statementConsistency && { statementConsistency }),
      
      // Interim conclusions and recommendations
      ...(sessionInterimConclusion && { sessionInterimConclusion }),
      ...(recommendedImmediateActions !== undefined && { recommendedImmediateActions }),
      ...(caseStatusAfterResult && { caseStatusAfterResult }),
      ...(statusChangeReason && { statusChangeReason }),
      
      // Digital authentication
      ...(dataVerificationConfirmed !== undefined && { dataVerificationConfirmed }),
      ...(creatorDigitalSignature && { creatorDigitalSignature }),
      ...(creatorSignerName && { creatorSignerName }),
      ...(creatorSignatureDate && { creatorSignatureDate: new Date(creatorSignatureDate) }),
      ...(chairpersonDigitalSignature && { chairpersonDigitalSignature }),
      ...(chairpersonSignerName && { chairpersonSignerName }),
      ...(chairpersonSignatureDate && { chairpersonSignatureDate: new Date(chairpersonSignatureDate) }),
      
      // Additional fields
      ...(partiesDetailedAttendance !== undefined && { partiesDetailedAttendance }),
      ...(recommendedActionsDetails !== undefined && { recommendedActionsDetails }),
      ...(internalSatgasNotes !== undefined && { internalSatgasNotes }),
      
      documentHash: hash,
      updatedAt: new Date()
    };

    // Update the investigation result
    const updatedResult = await db.investigationResult.update({
      where: { id: resultId },
      data: investigationResultData
    });
    
    console.log('API: Updated investigation result with evidenceFiles:', updatedResult.evidenceFiles);

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

    if (currentReport && caseStatusAfterResult && caseStatusAfterResult !== 'UNDER_INVESTIGATION') {
      const oldStatus = currentReport.status;

      // Update report status if needed
      let newReportStatus = null;
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
      result: updatedResult,
      message: "Hasil investigasi berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating investigation result:", error);
    
    // Provide more specific error messages based on error type
    let errorMessage = "Terjadi kesalahan saat memperbarui hasil investigasi";
    
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