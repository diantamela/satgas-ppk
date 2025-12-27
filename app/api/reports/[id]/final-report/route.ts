import { NextRequest } from "next/server";
import { db } from "@/db";
import { checkAuth } from "@/lib/auth";
import { getSessionFromRequest } from "@/lib/auth/server-session";

export const runtime = "nodejs";

// POST /api/reports/[id]/final-report - Create final report
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    const { id } = await params;
    const body = await request.json();
    
    console.log('📝 Incoming final report data:', {
      actionTaken: body.actionTaken,
      recommendations: body.recommendations,
      actionTakenType: typeof body.actionTaken,
      recommendationsType: typeof body.recommendations,
      actionTakenIsArray: Array.isArray(body.actionTaken),
      recommendationsIsArray: Array.isArray(body.recommendations)
    });

    // Validate that investigation progress is 100%
    const report = await db.report.findUnique({
      where: { id },
      include: {
        processes: true,
        recommendations: true
      }
    });

    if (!report) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if investigation progress is 100%
    if (report.investigationProgress !== 100) {
      return Response.json(
        { success: false, message: "Investigasi belum selesai 100%. Tidak dapat membuat laporan akhir." },
        { status: 400 }
      );
    }

    // Check if final report already exists
    const existingFinalReport = await db.finalReport.findFirst({
      where: { investigationId: id }
    });

    if (existingFinalReport) {
      return Response.json(
        { success: false, message: "Laporan akhir untuk investigasi ini sudah ada" },
        { status: 400 }
      );
    }

    // Get current session for user ID
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return Response.json(
        { success: false, message: "User session not found" },
        { status: 401 }
      );
    }

    // Get investigator info from current user
    const investigatorInfo = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true }
    });

    // Process arrays to ensure they're properly formatted
    const processedActionTaken = Array.isArray(body.actionTaken) ? body.actionTaken : 
                               (body.actionTaken ? [body.actionTaken] : []);
    const processedRecommendations = Array.isArray(body.recommendations) ? body.recommendations : 
                                   (body.recommendations ? [body.recommendations] : []);
    
    // Ensure JSON is properly formatted for PostgreSQL
    const formattedActionTaken = JSON.stringify(processedActionTaken);
    const formattedRecommendations = JSON.stringify(processedRecommendations);
    
    console.log('🔧 Processed data before saving:', {
      actionTaken: processedActionTaken,
      recommendations: processedRecommendations,
      actionTakenLength: processedActionTaken.length,
      recommendationsLength: processedRecommendations.length,
      formattedActionTaken,
      formattedRecommendations
    });
    
    // Create final report
    const finalReport = await db.finalReport.create({
      data: {
        investigationId: id,
        title: body.title || `Laporan Akhir Investigasi - ${report.title}`,
        description: body.description || "",
        status: 'COMPLETED',
        completedDate: new Date(),
        investigator: investigatorInfo?.name || 'Unknown Investigator',
        caseSummary: body.caseSummary || "",
        actionTaken: processedActionTaken as any,
        recommendations: processedRecommendations as any,
        fileUrl: body.fileUrl || null,
        fileSize: body.fileSize || null,
        createdBy: session.user.id,
        metadata: {
          sourceReportId: report.id,
          reportNumber: report.reportNumber,
          caseCategory: report.category,
          severity: report.severity,
          createdAt: new Date().toISOString(),
          totalProcesses: report.processes?.length || 0,
          totalRecommendations: report.recommendations?.length || 0,
          investigationDuration: report.investigationStartedAt ? 
            Math.ceil((new Date().getTime() - new Date(report.investigationStartedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
        }
      }
    });
    
    console.log('✅ Final report created successfully:', {
      id: finalReport.id,
      actionTaken: finalReport.actionTaken,
      recommendations: finalReport.recommendations,
      actionTakenLength: Array.isArray(finalReport.actionTaken) ? finalReport.actionTaken.length : 'not an array',
      recommendationsLength: Array.isArray(finalReport.recommendations) ? finalReport.recommendations.length : 'not an array'
    });
    
    // Double-check by querying the database directly
    const savedReport = await db.finalReport.findUnique({
      where: { id: finalReport.id },
      select: {
        actionTaken: true,
        recommendations: true
      }
    });
    
    console.log('🔍 Direct database query result:', {
      savedActionTaken: savedReport?.actionTaken,
      savedRecommendations: savedReport?.recommendations,
      savedActionTakenType: typeof savedReport?.actionTaken,
      savedRecommendationsType: typeof savedReport?.recommendations,
      savedActionTakenIsArray: Array.isArray(savedReport?.actionTaken),
      savedRecommendationsIsArray: Array.isArray(savedReport?.recommendations)
    });

    // Update report status to indicate final report is created
    await db.report.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        investigationCompletedAt: new Date()
      }
    });

    // Create notification for rektor about new final report
    try {
      const rektorUsers = await db.user.findMany({
        where: {
          role: 'REKTOR',
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      // Create notifications for all rektor users
      const notifications = await Promise.all(
        rektorUsers.map((user: any) =>
          db.notification.create({
            data: {
              userId: user.id,
              type: 'FINAL_REPORT_CREATED',
              title: `📋 Laporan Akhir Investigasi Selesai: ${report.reportNumber}`,
              message: `Laporan akhir investigasi telah selesai dan siap untuk review.\n\nDetail Kasus:\n• Judul: ${report.title}\n• Kategori: ${report.category || 'N/A'}\n• Tingkat Keparahan: ${report.severity || 'N/A'}\n• Investigator: ${finalReport.investigator}\n• Tanggal Selesai: ${new Date(finalReport.completedDate).toLocaleDateString('id-ID')}\n\nSilakan akses menu "Laporan Akhir" untuk melihat detail lengkap laporan.`,
              relatedEntityId: finalReport.id,
              relatedEntityType: 'FINAL_REPORT',
              isRead: false,
            },
          })
        )
      );

      console.log(`Created ${notifications.length} notifications for final report ${finalReport.id}`);
    } catch (notificationError) {
      console.error('Error creating notifications for final report:', notificationError);
      // Don't fail the entire request if notification creation fails
    }

    return Response.json({
      success: true,
      finalReport,
      message: "Laporan akhir berhasil dibuat",
    });
  } catch (error) {
    console.error("Error creating final report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat membuat laporan akhir" },
      { status: 500 }
    );
  }
}

// GET /api/reports/[id]/final-report - Get final report for investigation
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    const { id } = await params;

    // Also verify we have a valid session with user data
    const session = await getSessionFromRequest(request);
    if (!session) {
      return Response.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const finalReport = await db.finalReport.findFirst({
      where: { investigationId: id },
      include: {
        report: {
          select: {
            id: true,
            title: true,
            reportNumber: true,
            category: true,
            severity: true
          }
        }
      }
    });

    if (!finalReport) {
      return Response.json(
        { success: false, message: "Laporan akhir tidak ditemukan" },
        { status: 404 }
      );
    }

    const responseData = {
      ...finalReport,
      actionTaken: Array.isArray(finalReport.actionTaken) ? finalReport.actionTaken :
                  (finalReport.actionTaken ? [finalReport.actionTaken] : []),
      recommendations: Array.isArray(finalReport.recommendations) ? finalReport.recommendations :
                      (finalReport.recommendations ? [finalReport.recommendations] : [])
    };
    
    console.log('📤 Sending final report data:', {
      actionTaken: responseData.actionTaken,
      recommendations: responseData.recommendations,
      actionTakenLength: Array.isArray(responseData.actionTaken) ? responseData.actionTaken.length : 'not an array',
      recommendationsLength: Array.isArray(responseData.recommendations) ? responseData.recommendations.length : 'not an array'
    });
    
    return Response.json({
      success: true,
      finalReport: responseData,
    });
  } catch (error) {
    console.error("Error fetching final report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil laporan akhir" },
      { status: 500 }
    );
  }
}