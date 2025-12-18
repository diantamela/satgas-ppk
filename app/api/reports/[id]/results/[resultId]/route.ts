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

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return Response.json(
        { success: false, message: "Format data tidak valid" },
        { status: 400 }
      );
    }

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

    // Generate document hash for integrity with error handling
    let hash;
    try {
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
      hash = createHash('sha256').update(documentHashString).digest('hex');
    } catch (hashError) {
      console.error('Hash generation error:', hashError);
      return Response.json(
        { success: false, message: "Error generating document hash" },
        { status: 500 }
      );
    }

    console.log('API: Updating investigation result with evidenceFiles:', evidenceFiles);
    
    // Prepare update data with proper validation
    const investigationResultData: any = {};
    
    // Only add non-null/undefined values
    if (processId !== undefined) investigationResultData.processId = processId;
    if (location !== undefined) investigationResultData.location = location;
    if (methods !== undefined) investigationResultData.methods = methods;
    if (partiesInvolved !== undefined) investigationResultData.partiesInvolved = partiesInvolved;
    if (otherPartiesDetails !== undefined) investigationResultData.otherPartiesDetails = otherPartiesDetails;
    if (riskNotes !== undefined) investigationResultData.riskNotes = riskNotes;
    if (planSummary !== undefined) investigationResultData.planSummary = planSummary;
    if (accessLevel !== undefined) investigationResultData.accessLevel = accessLevel;
    
    if (schedulingTitle !== undefined) investigationResultData.schedulingTitle = schedulingTitle;
    if (schedulingLocation !== undefined) investigationResultData.schedulingLocation = schedulingLocation;
    if (caseTitle !== undefined) investigationResultData.caseTitle = caseTitle;
    if (reportNumber !== undefined) investigationResultData.reportNumber = reportNumber;
    
    if (satgasMembersPresent !== undefined) investigationResultData.satgasMembersPresent = satgasMembersPresent;
    if (partiesPresent !== undefined) investigationResultData.partiesPresent = partiesPresent;
    if (identityVerified !== undefined) investigationResultData.identityVerified = identityVerified;
    if (attendanceNotes !== undefined) investigationResultData.attendanceNotes = attendanceNotes;
    
    if (partiesStatementSummary !== undefined) investigationResultData.partiesStatementSummary = partiesStatementSummary;
    if (newPhysicalEvidence !== undefined) investigationResultData.newPhysicalEvidence = newPhysicalEvidence;
    if (evidenceFiles !== undefined) investigationResultData.evidenceFiles = evidenceFiles;
    if (statementConsistency !== undefined) investigationResultData.statementConsistency = statementConsistency;
    
    if (sessionInterimConclusion !== undefined) investigationResultData.sessionInterimConclusion = sessionInterimConclusion;
    if (recommendedImmediateActions !== undefined) investigationResultData.recommendedImmediateActions = recommendedImmediateActions;
    if (caseStatusAfterResult !== undefined) investigationResultData.caseStatusAfterResult = caseStatusAfterResult;
    if (statusChangeReason !== undefined) investigationResultData.statusChangeReason = statusChangeReason;
    
    if (dataVerificationConfirmed !== undefined) investigationResultData.dataVerificationConfirmed = dataVerificationConfirmed;
    if (creatorDigitalSignature !== undefined) investigationResultData.creatorDigitalSignature = creatorDigitalSignature;
    if (creatorSignerName !== undefined) investigationResultData.creatorSignerName = creatorSignerName;
    if (creatorSignatureDate !== undefined) investigationResultData.creatorSignatureDate = new Date(creatorSignatureDate);
    if (chairpersonDigitalSignature !== undefined) investigationResultData.chairpersonDigitalSignature = chairpersonDigitalSignature;
    if (chairpersonSignerName !== undefined) investigationResultData.chairpersonSignerName = chairpersonSignerName;
    if (chairpersonSignatureDate !== undefined) investigationResultData.chairpersonSignatureDate = new Date(chairpersonSignatureDate);
    
    if (partiesDetailedAttendance !== undefined) investigationResultData.partiesDetailedAttendance = partiesDetailedAttendance;
    if (recommendedActionsDetails !== undefined) investigationResultData.recommendedActionsDetails = recommendedActionsDetails;
    if (internalSatgasNotes !== undefined) investigationResultData.internalSatgasNotes = internalSatgasNotes;
    
    investigationResultData.documentHash = hash;
    investigationResultData.updatedAt = new Date();

    // Update the investigation result with error handling
    let updatedResult;
    try {
      updatedResult = await db.investigationResult.update({
        where: { id: resultId },
        data: investigationResultData
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return Response.json(
        { success: false, message: "Gagal memperbarui data ke database" },
        { status: 500 }
      );
    }
    
    console.log('API: Updated investigation result with evidenceFiles:', updatedResult.evidenceFiles);

    // Get current report data for notification
    let currentReport;
    try {
      currentReport = await db.report.findUnique({
        where: { id: reportId },
        select: {
          id: true,
          status: true,
          reportNumber: true,
          reporterId: true
        }
      });
    } catch (reportError) {
      console.error('Error fetching report for notification:', reportError);
      // Don't fail the whole request if we can't get report data
    }

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
        try {
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
        } catch (statusUpdateError) {
          console.error('Error updating report status:', statusUpdateError);
          // Don't fail the whole request if status update fails
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