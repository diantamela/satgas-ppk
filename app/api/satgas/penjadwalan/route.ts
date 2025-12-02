import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";

export const runtime = "nodejs";

// GET /api/satgas/penjadwalan - Get scheduled investigations with filters
export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS', 'REKTOR'])) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

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
        { status: 'SCHEDULED' },
        { status: 'IN_PROGRESS' },
        { status: 'COMPLETED' },
        { status: 'CANCELLED' }
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
      filters.AND.push({ status: status.toUpperCase() });
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

    // Get reports with scheduled investigations
    const reports = await db.report.findMany({
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

    // Get documents count for each report
    const reportIds = reports.map(r => r.id);
    const documentsData = await db.investigationDocument.groupBy({
      by: ['reportId'],
      where: {
        reportId: { in: reportIds }
      },
      _count: {
        id: true
      }
    });

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
    const totalCount = await db.report.count({ where: filters });

    // Calculate statistics
    const stats = {
      total: totalCount,
      pending: await db.report.count({ 
        where: { ...filters, status: 'SCHEDULED' }
      }),
      inProgress: await db.report.count({ 
        where: { ...filters, status: 'IN_PROGRESS' }
      }),
      completed: await db.report.count({ 
        where: { ...filters, status: 'COMPLETED' }
      }),
      cancelled: await db.report.count({ 
        where: { ...filters, status: 'CANCELLED' }
      })
    };

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
    console.error("Error fetching penjadwalan data:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil data penjadwalan" },
      { status: 500 }
    );
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