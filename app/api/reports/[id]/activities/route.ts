import { NextRequest } from "next/server";
import { db } from "@/db";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";

export const runtime = "nodejs";

// GET /api/reports/[id]/activities - Get all activities for a report
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

    // Verify report exists and user has access
    const report = await db.report.findUnique({
      where: { id: reportId },
      select: { id: true, assigneeId: true }
    });

    if (!report) {
      return Response.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    // Fetch activities from database
    const activities = await db.investigationActivity.findMany({
      where: { reportId },
      include: {
        conductedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        schedule: {
          include: {
            teamMembers: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            },
            attachments: {
              include: {
                uploadedBy: {
                  select: { name: true }
                }
              }
            }
          }
        },
        attachments: {
          include: {
            uploadedBy: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return Response.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Error fetching investigation activities:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil data kegiatan investigasi" },
      { status: 500 }
    );
  }
}

// POST /api/reports/[id]/activities - Create a new investigation activity
export async function POST(
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
    const body = await request.json();

    const {
      scheduleId,
      activityType,
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      participants,
      outcomes,
      challenges,
      recommendations,
      isConfidential,
      accessLevel
    } = body;

    // Verify report exists
    const report = await db.report.findUnique({
      where: { id: reportId },
      select: { id: true }
    });

    if (!report) {
      return Response.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!activityType || !title || !description || !startDateTime) {
      return Response.json(
        { success: false, message: "Activity type, title, description, and start time are required" },
        { status: 400 }
      );
    }

    // Create the activity in database
    const activity = await db.investigationActivity.create({
      data: {
        reportId,
        scheduleId: scheduleId || null,
        activityType: activityType as any, // Cast to any due to enum sync issues
        title,
        description,
        location,
        startDateTime: new Date(startDateTime),
        endDateTime: endDateTime ? new Date(endDateTime) : null,
        duration: endDateTime ? Math.round((new Date(endDateTime).getTime() - new Date(startDateTime).getTime()) / (1000 * 60)) : null,
        participants: participants || [],
        conductedById: session.user.id,
        outcomes,
        challenges,
        recommendations,
        isConfidential: isConfidential || false,
        accessLevel: accessLevel as any || 'CORE_TEAM_ONLY'
      },
      include: {
        conductedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        schedule: {
          include: {
            teamMembers: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        },
        attachments: {
          include: {
            uploadedBy: {
              select: { name: true }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      activity,
      message: "Kegiatan investigasi berhasil dicatat",
    });
  } catch (error) {
    console.error("Error creating investigation activity:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mencatat kegiatan investigasi" },
      { status: 500 }
    );
  }
}