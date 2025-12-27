import { NextRequest } from "next/server";
import { db } from "@/db";
import { checkAuth } from "@/lib/auth";
import { getSessionFromRequest } from "@/lib/auth/server-session";

export const runtime = "nodejs";

// GET /api/final-reports - Get all final reports for rector dashboard
export async function GET(request: NextRequest) {
  try {
    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    // Also verify we have a valid session with user data
    const session = await getSessionFromRequest(request);
    if (!session) {
      return Response.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    // Build where clause for filtering
    const whereClause: any = {};

    if (status && status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    if (startDate) {
      whereClause.completedDate = {
        ...whereClause.completedDate,
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      whereClause.completedDate = {
        ...whereClause.completedDate,
        lte: new Date(endDate)
      };
    }

    // Fetch final reports with related report information
    const finalReports = await db.finalReport.findMany({
      where: whereClause,
      include: {
        report: {
          select: {
            id: true,
            reportNumber: true,
            title: true,
            category: true,
            severity: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        completedDate: 'desc'
      }
    });

    // Transform data to match frontend interface
    const transformedReports = finalReports.map(report => ({
      id: report.id,
      investigationId: report.report.reportNumber,
      title: report.title,
      description: report.description,
      status: report.status.toLowerCase(),
      completedDate: report.completedDate.toISOString(),
      investigator: report.investigator,
      fileUrl: report.fileUrl,
      fileSize: report.fileSize,
      caseSummary: report.caseSummary || "",
      actionTaken: Array.isArray(report.actionTaken) ? report.actionTaken : 
                  (report.actionTaken ? [report.actionTaken] : []),
      recommendations: Array.isArray(report.recommendations) ? report.recommendations :
                     (report.recommendations ? [report.recommendations] : []),
      // Additional metadata
      reportId: report.report.id,
      reportTitle: report.report.title,
      reportCategory: report.report.category,
      reportSeverity: report.report.severity,
      reportCreatedAt: report.report.createdAt.toISOString(),
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString()
    }));

    // Apply search filter if provided
    let filteredReports = transformedReports;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReports = transformedReports.filter(report =>
        report.title.toLowerCase().includes(searchLower) ||
        report.investigationId.toLowerCase().includes(searchLower) ||
        report.investigator.toLowerCase().includes(searchLower) ||
        report.caseSummary.toLowerCase().includes(searchLower) ||
        (report.reportTitle && report.reportTitle.toLowerCase().includes(searchLower))
      );
    }

    return Response.json({
      success: true,
      finalReports: filteredReports,
      totalCount: filteredReports.length,
      metadata: {
        totalReports: finalReports.length,
        completedReports: finalReports.filter(r => r.status === 'COMPLETED').length,
        archivedReports: finalReports.filter(r => r.status === 'ARCHIVED').length,
        draftReports: finalReports.filter(r => r.status === 'DRAFT').length
      }
    });
  } catch (error) {
    console.error("Error fetching final reports:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil laporan akhir" },
      { status: 500 }
    );
  }
}