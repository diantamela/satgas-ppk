import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";
import { ReportStatus } from "@prisma/client";

export const runtime = "nodejs";

// GET /api/satgas/penjadwalan - Get scheduled investigations with filters
export async function GET(request: NextRequest) {
  try {
    console.log('[PENJADWALAN] Starting GET request');
    
    // Get current user session
    console.log('[PENJADWALAN] Getting session from request...');
    const session = await getSessionFromRequest(request);
    console.log('[PENJADWALAN] Session result:', session ? 'Session found' : 'No session');

    if (!session || !isRoleAllowed(session, ['SATGAS', 'REKTOR'])) {
      console.log('[PENJADWALAN] Authorization failed');
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log('[PENJADWALAN] Authorization successful');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filters
    let filters: any = {
      OR: [
        { status: ReportStatus.SCHEDULED },
        { status: ReportStatus.IN_PROGRESS },
        { status: ReportStatus.COMPLETED },
        { status: ReportStatus.REJECTED }
      ]
    };

    // Apply search filter
    if (search) {
      filters.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { reportNumber: { contains: search, mode: 'insensitive' } },
            { scheduledNotes: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    // Apply status filter
    if (status && status !== 'all') {
      filters.AND = filters.AND || [];
      const statusMap: { [key: string]: ReportStatus } = {
        'pending': ReportStatus.PENDING,
        'verified': ReportStatus.VERIFIED,
        'scheduled': ReportStatus.SCHEDULED,
        'in_progress': ReportStatus.IN_PROGRESS,
        'completed': ReportStatus.COMPLETED,
        'rejected': ReportStatus.REJECTED
      };
      
      const mappedStatus = statusMap[status.toLowerCase()];
      if (mappedStatus) {
        filters.AND.push({ status: mappedStatus });
      }
    }

    // Apply date range filter
    if (dateFrom || dateTo) {
      filters.AND = filters.AND || [];
      if (dateFrom && dateTo) {
        filters.AND.push({
          scheduledDate: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo + 'T23:59:59.999Z')
          }
        });
      } else if (dateFrom) {
        filters.AND.push({
          scheduledDate: {
            gte: new Date(dateFrom)
          }
        });
      } else if (dateTo) {
        filters.AND.push({
          scheduledDate: {
            lte: new Date(dateTo + 'T23:59:59.999Z')
          }
        });
      }
    }

    console.log('[PENJADWALAN] Building filters:', JSON.stringify(filters, null, 2));
    console.log('[PENJADWALAN] Query params - page:', page, 'limit:', limit);
    
    // Get reports with scheduled investigations
    console.log('[PENJADWALAN] Executing database query...');
    let reports: any[] = [];
    try {
      reports = await db.report.findMany({
        where: filters,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { scheduledDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      });
      console.log('[PENJADWALAN] Reports query completed, found:', reports.length, 'reports');
    } catch (reportError) {
      console.error('[PENJADWALAN] Error fetching reports:', reportError);
      throw new Error(`Database query failed: ${reportError instanceof Error ? reportError.message : 'Unknown error'}`);
    }

    // Get documents count for each report
    console.log('[PENJADWALAN] Getting documents data...');
    const reportIds = reports.map(r => r.id);
    console.log('[PENJADWALAN] Report IDs for documents query:', reportIds);
    
    let documentsData: any[] = [];
    if (reportIds.length > 0) {
      try {
        // Use a simpler approach with findMany and manual grouping
        const documents = await db.investigationDocument.findMany({
          where: {
            reportId: { in: reportIds }
          },
          select: {
            reportId: true,
            id: true
          }
        });
        
        // Manually group the data
        documentsData = reportIds.map(reportId => ({
          reportId,
          _count: {
            id: documents.filter(doc => doc.reportId === reportId).length
          }
        }));
        
        console.log('[PENJADWALAN] Documents data query completed');
      } catch (docError) {
        console.error('[PENJADWALAN] Error fetching documents:', docError);
        // Continue without documents data if query fails
        documentsData = [];
      }
    }

    // Transform data to match frontend interface
    const scheduledInvestigations = reports.map(report => {
      const documentsCount = documentsData.find(d => d.reportId === report.id)?._count.id || 0;
      const createdByName = report.scheduledBy ? `User ${report.scheduledBy}` : 'Unknown';
      
      return {
        id: report.id,
        reportId: report.id,
        reportTitle: report.title,
        reportNumber: report.reportNumber,
        status: report.status,
        scheduledDateTime: report.scheduledDate?.toISOString() || report.createdAt.toISOString(),
        endDateTime: report.scheduledDate ? 
          new Date(report.scheduledDate.getTime() + 2 * 60 * 60 * 1000).toISOString() : // Default 2 hours duration
          report.createdAt.toISOString(),
        location: report.scheduledNotes?.split(' - ')[0] || 'Tempat belum ditentukan',
        methods: [], // TODO: Extract from detailed investigation process if exists
        partiesInvolved: [], // TODO: Extract from detailed investigation process if exists
        teamMembers: [], // TODO: Extract from detailed investigation process if exists
        consentObtained: false,
        riskNotes: '',
        planSummary: report.scheduledNotes || '',
        followUpAction: '',
        followUpDate: '',
        accessLevel: 'CORE_TEAM_ONLY',
        createdBy: createdByName,
        createdAt: report.createdAt.toISOString(),
        reporter: report.reporter,
        documentsCount
      };
    });

    // Get total count for pagination
    console.log('[PENJADWALAN] Getting total count...');
    const totalCount = await db.report.count({ where: filters });
    console.log('[PENJADWALAN] Total count:', totalCount);

    // Calculate statistics
    console.log('[PENJADWALAN] Calculating statistics...');
    let stats: any = {
      total: totalCount,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0
    };
    
    try {
      const [pendingCount, inProgressCount, completedCount, rejectedCount] = await Promise.all([
        db.report.count({ where: { ...filters, status: ReportStatus.SCHEDULED } }),
        db.report.count({ where: { ...filters, status: ReportStatus.IN_PROGRESS } }),
        db.report.count({ where: { ...filters, status: ReportStatus.COMPLETED } }),
        db.report.count({ where: { ...filters, status: ReportStatus.REJECTED } })
      ]);
      
      stats = {
        total: totalCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        cancelled: rejectedCount
      };
      console.log('[PENJADWALAN] Statistics calculated:', stats);
    } catch (statsError) {
      console.error('[PENJADWALAN] Error calculating statistics:', statsError);
      // Continue with default stats if count queries fail
      console.log('[PENJADWALAN] Using default statistics due to error');
    }

    return Response.json({
      success: true,
      data: {
        investigations: scheduledInvestigations,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        },
        stats
      }
    });



  } catch (error) {
    console.error("[PENJADWALAN] Error occurred in catch block:", error);
    console.error("[PENJADWALAN] Error name:", error instanceof Error ? error.name : 'Unknown');
    console.error("[PENJADWALAN] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[PENJADWALAN] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    // Provide more specific error details in development
    const errorDetails = {
      success: false, 
      message: "Terjadi kesalahan saat mengambil data penjadwalan",
      error: process.env.NODE_ENV === 'development' ? {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      } : undefined
    };
    
    return Response.json(errorDetails, { status: 500 });
  }
}

// POST /api/satgas/penjadwalan - Update investigation status
export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS'])) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, reportId, updateData } = body;

    if (action === 'updateStatus') {
      // Update investigation status
      const { status, notes } = updateData;
      
      const updatedReport = await db.report.update({
        where: { id: reportId },
        data: {
          status: status.toUpperCase(),
          updatedAt: new Date(),
          ...(notes && { scheduledNotes: notes })
        },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return Response.json({
        success: true,
        message: "Status investigasi berhasil diperbarui",
        data: updatedReport
      });
    }

    return Response.json(
      { success: false, message: "Aksi tidak valid" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error updating penjadwalan:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat memperbarui penjadwalan" },
      { status: 500 }
    );
  }
}