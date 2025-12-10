import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";
import { ReportStatus } from "@prisma/client";

export const runtime = "nodejs";

// Helper function to send notifications
async function sendNotification(userId: string, type: string, title: string, message: string, relatedEntityId?: string, relatedEntityType?: string) {
  try {
    console.log('[NOTIFICATION] Sending notification:', { userId, type, title, message, relatedEntityId, relatedEntityType });
    
    // Map string types to proper enum values
    let notificationType: any = 'REPORT_STATUS_CHANGED';
    switch (type) {
      case 'INVESTIGATION_SCHEDULED':
        notificationType = 'REPORT_STATUS_CHANGED';
        break;
      case 'INVESTIGATION_SCHEDULE_UPDATED':
        notificationType = 'REPORT_STATUS_CHANGED';
        break;
      case 'INVESTIGATION_CANCELLED':
        notificationType = 'REPORT_STATUS_CHANGED';
        break;
      case 'INVESTIGATION_STATUS_UPDATE':
        notificationType = 'REPORT_STATUS_CHANGED';
        break;
      case 'INVESTIGATION_ASSIGNMENT':
        notificationType = 'REPORT_ASSIGNED';
        break;
      default:
        notificationType = 'REPORT_STATUS_CHANGED';
    }

    const notificationData = {
      userId,
      type: notificationType,
      title,
      message,
      relatedEntityId: relatedEntityId || null,
      relatedEntityType: relatedEntityType || null,
    };
    
    console.log('[NOTIFICATION] Notification data to create:', notificationData);
    
    const notification = await db.notification.create({
      data: notificationData
    });
    
    console.log('[NOTIFICATION] Notification created successfully:', notification);
  } catch (error) {
    console.error('[NOTIFICATION] Error sending notification:', error);
  }
}

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
        'cancelled': ReportStatus.REJECTED
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
      console.log('[PENJADWALAN] Applying filters:', JSON.stringify(filters, null, 2));
      
      // Try main query with processes first
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
            },
            processes: {
              take: 1,
              orderBy: {
                createdAt: 'desc'
              },
              include: {
                teamMembers: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  }
                }
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
        console.log('[PENJADWALAN] Reports query with processes completed, found:', reports.length, 'reports');
      } catch (processError) {
        console.error('[PENJADWALAN] Error with processes query, trying without:', processError);
        
        // Fallback: query without processes if there's a schema issue
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
              // Skip processes for now to avoid schema issues
            },
            orderBy: [
              { scheduledDate: 'desc' },
              { createdAt: 'desc' }
            ],
            skip: (page - 1) * limit,
            take: limit
          });
          console.log('[PENJADWALAN] Reports query without processes completed, found:', reports.length, 'reports');
        } catch (fallbackError) {
          console.error('[PENJADWALAN] Even fallback query failed:', fallbackError);
          throw new Error(`All database query attempts failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
        }
      }
    } catch (reportError) {
      console.error('[PENJADWALAN] Critical error in reports query:', reportError);
      console.error('[PENJADWALAN] Error type:', reportError?.constructor?.name);
      console.error('[PENJADWALAN] Error message:', reportError instanceof Error ? reportError.message : String(reportError));
      
      // Check if it's a schema/mapping error
      if (reportError instanceof Error && (reportError.message.includes('table') || reportError.message.includes('column') || reportError.message.includes('mapping'))) {
        console.error('[PENJADWALAN] SCHEMA MAPPING ERROR DETECTED - Check Prisma schema and database sync');
      }
      
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
        console.log('[PENJADWALAN] Querying documents for report IDs:', reportIds.length);
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
        
        console.log('[PENJADWALAN] Documents data query completed, found:', documents.length, 'documents');
      } catch (docError) {
        console.error('[PENJADWALAN] Error fetching documents:', docError);
        console.error('[PENJADWALAN] Documents error type:', docError?.constructor?.name);
        console.error('[PENJADWALAN] Documents error message:', docError instanceof Error ? docError.message : String(docError));
        // Continue without documents data if query fails
        documentsData = [];
      }
    }

    // Transform data to match frontend interface
    const scheduledInvestigations = reports.map(report => {
      const documentsCount = documentsData.find(d => d.reportId === report.id)?._count.id || 0;
      const createdByName = report.scheduledBy ? `User ${report.scheduledBy}` : 'Unknown';
      const process = report.processes?.[0]; // Get the most recent process
      
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
        location: process?.location || report.scheduledNotes?.split(' - ')[0] || 'Tempat belum ditentukan',
        methods: process?.methods || [],
        partiesInvolved: process?.partiesInvolved || [],
        teamMembers: process?.teamMembers || [],
        riskNotes: process?.riskNotes || '',
        planSummary: process?.planSummary || report.scheduledNotes || '',
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
      const [pendingCount, inProgressCount, rejectedCount] = await Promise.all([
        db.report.count({ where: { ...filters, status: ReportStatus.SCHEDULED } }),
        db.report.count({ where: { ...filters, status: ReportStatus.IN_PROGRESS } }),
        db.report.count({ where: { ...filters, status: ReportStatus.REJECTED } })
      ]);
      
      stats = {
        total: totalCount,
        pending: pendingCount,
        inProgress: inProgressCount,
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
    console.error("[PENJADWALAN] === CRITICAL ERROR ANALYSIS ===");
    console.error("[PENJADWALAN] Error occurred in catch block:", error);
    console.error("[PENJADWALAN] Error name:", error instanceof Error ? error.name : 'Unknown');
    console.error("[PENJADWALAN] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[PENJADWALAN] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('connection')) {
      console.error("[PENJADWALAN] DATABASE CONNECTION ERROR DETECTED");
    }
    
    // Check if it's a Prisma error
    if (error instanceof Error && error.message.includes('P')) {
      console.error("[PENJADWALAN] PRISMA ERROR DETECTED");
    }
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('session')) {
      console.error("[PENJADWALAN] AUTHENTICATION ERROR DETECTED");
    }
    
    console.error("[PENJADWALAN] Environment check:");
    console.error("[PENJADWALAN] NODE_ENV:", process.env.NODE_ENV);
    console.error("[PENJADWALAN] DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.error("[PENJADWALAN] DATABASE_URL sample:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET');
    
    // Provide detailed error information
    const errorDetails = {
      success: false,
      message: "Terjadi kesalahan saat mengambil data penjadwalan",
      timestamp: new Date().toISOString(),
      error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: error?.constructor?.name || 'Unknown'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        timestamp: new Date().toISOString()
      }
    };
    
    return Response.json(errorDetails, { status: 500 });
  }
}

// POST /api/satgas/penjadwalan - Update investigation status or complete schedule
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
    const { action, reportId, scheduleId, updateData } = body;

    if (action === 'updateStatus') {
      // Update overall investigation status (original behavior)
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

      // Send notification to reporter about status change
      if (updatedReport.reporter) {
        await sendNotification(
          updatedReport.reporter.id,
          'INVESTIGATION_STATUS_UPDATE',
          'Status Investigasi Diperbarui',
          `Status investigasi untuk laporan ${updatedReport.reportNumber} telah diperbarui menjadi: ${status}`,
          reportId,
          'REPORT'
        );
      }

      return Response.json({
        success: true,
        message: "Status investigasi berhasil diperbarui",
        data: updatedReport
      });
    }

    if (action === 'completeSchedule') {
      // Complete only the specific schedule, not the entire investigation
      const { status, notes } = updateData;
      
      if (!scheduleId) {
        return Response.json(
          { success: false, message: "Schedule ID diperlukan untuk menyelesaikan jadwal investigasi" },
          { status: 400 }
        );
      }

      // Update investigation process status to completed
      const updatedProcess = await db.investigationProcess.updateMany({
        where: {
          reportId: reportId,
          id: scheduleId
        },
        data: {
          status: 'COMPLETED',
          endDateTime: new Date(),
          updatedAt: new Date(),
          ...(notes && { notes: notes })
        }
      });

      // Get report info for notification
      const report = await db.report.findUnique({
        where: { id: reportId },
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

      // Send notification to reporter about schedule completion
      if (report?.reporter) {
        await sendNotification(
          report.reporter.id,
          'INVESTIGATION_SCHEDULE_COMPLETED',
          'Jadwal Investigasi Selesai',
          `Jadwal investigasi untuk laporan ${report.reportNumber} telah selesai. Anda dapat membuat jadwal investigasi baru jika diperlukan.`,
          reportId,
          'REPORT'
        );
      }

      return Response.json({
        success: true,
        message: "Jadwal investigasi berhasil ditandai sebagai selesai. Anda dapat membuat jadwal investigasi baru untuk laporan ini.",
        data: {
          processUpdated: updatedProcess.count,
          reportStatus: report?.status // Keep original report status
        }
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

// PUT /api/satgas/penjadwalan - Update investigation schedule
export async function PUT(request: NextRequest) {
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
    const { reportId, updateData } = body;

    console.log("[PENJADWALAN] PUT - Request body:", { reportId, updateData });

    if (!reportId || !updateData) {
      return Response.json(
        { success: false, message: "Report ID and update data are required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!updateData.location) {
      return Response.json(
        { success: false, message: "Location is required" },
        { status: 400 }
      );
    }

    // Validate date formats if provided
    if (updateData.startDateTime && isNaN(new Date(updateData.startDateTime).getTime())) {
      return Response.json(
        { success: false, message: "Invalid start date time format" },
        { status: 400 }
      );
    }

    if (updateData.endDateTime && isNaN(new Date(updateData.endDateTime).getTime())) {
      return Response.json(
        { success: false, message: "Invalid end date time format" },
        { status: 400 }
      );
    }

    // Validate team members if provided
    if (updateData.teamMembers && !Array.isArray(updateData.teamMembers)) {
      return Response.json(
        { success: false, message: "Team members must be an array" },
        { status: 400 }
      );
    }

    console.log("[PENJADWALAN] PUT - Starting database operations for reportId:", reportId);

    // Get existing investigation process if it exists
    const existingProcess = await db.investigationProcess.findFirst({
      where: { reportId },
      include: {
        report: {
          include: {
            reporter: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    console.log("[PENJADWALAN] PUT - Existing process found:", !!existingProcess);

  let updatedProcess;
  if (existingProcess) {
    console.log("[PENJADWALAN] PUT - Updating existing process:", existingProcess.id);
    
    // Update existing investigation process
    const processUpdateData: any = {
      location: updateData.location || existingProcess.location,
      methods: updateData.methods || existingProcess.methods,
      partiesInvolved: updateData.partiesInvolved || existingProcess.partiesInvolved,
      otherPartiesDetails: updateData.otherPartiesDetails,
      riskNotes: updateData.riskNotes,
      planSummary: updateData.planSummary,
      updatedAt: new Date()
    };

    console.log("[PENJADWALAN] PUT - Update data prepared:", JSON.stringify(processUpdateData, null, 2));

    // Handle required date fields
    if (updateData.startDateTime) {
      processUpdateData.startDateTime = new Date(updateData.startDateTime);
    }
    if (updateData.endDateTime) {
      processUpdateData.endDateTime = new Date(updateData.endDateTime);
    }

    // Handle team members update if provided
    if (updateData.teamMembers) {
      console.log("[PENJADWALAN] PUT - Processing team members:", updateData.teamMembers.length);
      
      // Delete existing team members
      await db.investigationTeamMember.deleteMany({
        where: { processId: existingProcess.id }
      });
      
      // Add new team members
      processUpdateData.teamMembers = {
        create: updateData.teamMembers.map((member: any) => ({
          userId: member.userId,
          role: member.role,
          customRole: member.customRole
        }))
      };
    }

    console.log("[PENJADWALAN] PUT - Executing update with data:", JSON.stringify(processUpdateData, null, 2));
    
    updatedProcess = await db.investigationProcess.update({
      where: { id: existingProcess.id },
      data: processUpdateData,
      include: {
        teamMembers: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        report: {
          include: {
            reporter: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
    
    console.log("[PENJADWALAN] PUT - Process updated successfully:", updatedProcess.id);

      // Update report scheduled date if provided
      if (updateData.startDateTime) {
        await db.report.update({
          where: { id: reportId },
          data: {
            scheduledDate: new Date(updateData.startDateTime),
            scheduledNotes: updateData.planSummary || existingProcess.planSummary
          }
        });
      }
    } else {
      console.log("[PENJADWALAN] PUT - Creating new investigation process");
      
      // Create new investigation process if it doesn't exist
      const createData: any = {
        reportId,
        location: updateData.location || '',
        methods: updateData.methods || [],
        partiesInvolved: updateData.partiesInvolved || [],
        otherPartiesDetails: updateData.otherPartiesDetails,
        riskNotes: updateData.riskNotes,
        planSummary: updateData.planSummary || '',
        createdById: session.user.id,
        teamMembers: {
          create: (updateData.teamMembers || []).map((member: any) => ({
            userId: member.userId,
            role: member.role,
            customRole: member.customRole
          }))
        }
      };

      // Set required date fields - provide defaults if not provided
      const startDateTime = updateData.startDateTime ? new Date(updateData.startDateTime) : new Date();
      const endDateTime = updateData.endDateTime ? new Date(updateData.endDateTime) : new Date(Date.now() + 2 * 60 * 60 * 1000); // Default 2 hours later
      
      createData.startDateTime = startDateTime;
      createData.endDateTime = endDateTime;

      console.log("[PENJADWALAN] PUT - Creating process with data:", JSON.stringify(createData, null, 2));

      updatedProcess = await db.investigationProcess.create({
        data: createData,
        include: {
          teamMembers: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          report: {
            include: {
              reporter: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });
      
      console.log("[PENJADWALAN] PUT - Process created successfully:", updatedProcess.id);

      // Update report status to SCHEDULED
      const reportUpdateData = {
        status: ReportStatus.SCHEDULED,
        scheduledDate: updateData.startDateTime ? new Date(updateData.startDateTime) : new Date(),
        scheduledNotes: updateData.planSummary
      };
      
      console.log("[PENJADWALAN] PUT - Updating report status:", JSON.stringify(reportUpdateData, null, 2));
      
      await db.report.update({
        where: { id: reportId },
        data: reportUpdateData
      });
      
      console.log("[PENJADWALAN] PUT - Report updated successfully");
    }

    // Send notification to reporter about schedule update
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: { reporter: true }
    });
    
    console.log("[PENJADWALAN] PUT - Found report for notification:", !!report, "reporter:", !!report?.reporter);
    
    if (report?.reporter) {
      console.log("[PENJADWALAN] PUT - Sending notification to reporter:", report.reporter.id);
      
      await sendNotification(
        report.reporter.id,
        'INVESTIGATION_SCHEDULE_UPDATED',
        'Jadwal Investigasi Diperbarui',
        `Jadwal investigasi untuk laporan ${report.reportNumber} telah diperbarui. Lokasi: ${updateData.location}`,
        reportId,
        'REPORT'
      );

      console.log("[PENJADWALAN] PUT - Notification sent successfully");
      
      // Note: Team member notifications would be sent here if teamMembers data was available
    }

    console.log("[PENJADWALAN] PUT - Operation completed successfully");

    return Response.json({
      success: true,
      message: "Jadwal investigasi berhasil diperbarui",
      data: updatedProcess
    });

  } catch (error) {
    console.error("[PENJADWALAN] PUT - Critical error:", error);
    console.error("[PENJADWALAN] PUT - Error name:", error instanceof Error ? error.name : 'Unknown');
    console.error("[PENJADWALAN] PUT - Error message:", error instanceof Error ? error.message : String(error));
    console.error("[PENJADWALAN] PUT - Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('required')) {
        return Response.json(
          { success: false, message: "Data yang diperlukan tidak lengkap", details: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('foreign key')) {
        return Response.json(
          { success: false, message: "Data referensi tidak ditemukan", details: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('connection')) {
        return Response.json(
          { success: false, message: "Koneksi database bermasalah", details: error.message },
          { status: 500 }
        );
      }
    }
    
    return Response.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui jadwal investigasi",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE /api/satgas/penjadwalan - Delete investigation schedule
export async function DELETE(request: NextRequest) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS'])) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return Response.json(
        { success: false, message: "Report ID is required" },
        { status: 400 }
      );
    }

    // Get the investigation process and report before deletion
    const investigationProcess = await db.investigationProcess.findFirst({
      where: { reportId },
      include: {
        teamMembers: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        report: {
          include: {
            reporter: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    // Delete investigation process if exists
    if (investigationProcess) {
      await db.investigationTeamMember.deleteMany({
        where: { processId: investigationProcess.id }
      });

      await db.investigationProcess.delete({
        where: { id: investigationProcess.id }
      });
    }

    // Reset report status and clear scheduling data
    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.IN_PROGRESS, // Reset to in progress
        scheduledDate: null,
        scheduledBy: null,
        scheduledNotes: null
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

    // Send notification to reporter about cancellation
    if (updatedReport.reporter) {
      await sendNotification(
        updatedReport.reporter.id,
        'INVESTIGATION_CANCELLED',
        'Investigasi Dibatalkan',
        `Jadwal investigasi untuk laporan ${updatedReport.reportNumber} telah dibatalkan`,
        reportId,
        'REPORT'
      );

      // Note: Team member cancellation notifications would be sent here if teamMembers data was available
    }

    return Response.json({
      success: true,
      message: "Jadwal investigasi berhasil dihapus",
      data: updatedReport
    });

  } catch (error) {
    console.error("Error deleting investigation schedule:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat menghapus jadwal investigasi" },
      { status: 500 }
    );
  }
}