import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";

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
      include: {
        process: {
          include: {
            teamMembers: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                  }
                }
              }
            }
          }
        }
      },
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
      creatorSignatureDate,
      chairpersonDigitalSignature,
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
    const hash = require('crypto').createHash('sha256').update(documentHashString).digest('hex');

    // Create investigation result
    const investigationResult = await db.investigationResult.create({
      data: {
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
      },
      include: {
        process: {
          include: {
            teamMembers: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Update report status if needed
    if (caseStatusAfterResult && caseStatusAfterResult !== 'UNDER_INVESTIGATION') {
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
      }
    }

    // Create activity log
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_INVESTIGATION_RESULT',
        entityType: 'InvestigationResult',
        entityId: investigationResult.id,
        details: {
          reportId,
          processId,
          caseStatusAfterResult
        },
        reportId: reportId
      }
    });

    return Response.json({
      success: true,
      result: investigationResult,
      message: "Hasil investigasi berhasil dicatat",
    });
  } catch (error) {
    console.error("Error creating investigation result:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mencatat hasil investigasi" },
      { status: 500 }
    );
  }
}