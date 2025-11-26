import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
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
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, assigneeId: true }
    });

    if (!report) {
      return Response.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    // TODO: Replace with actual database query once schema is migrated
    // For now, return mock data
    const activities = [
      {
        id: "activity-1",
        activityType: "INTERVIEW_CONDUCTED",
        title: "Wawancara dengan Korban",
        description: "Melakukan wawancara mendalam dengan korban untuk mengumpulkan informasi detail tentang kejadian.",
        location: "Ruang Konseling Lt. 2",
        startDateTime: new Date("2025-11-25T10:00:00Z"),
        endDateTime: new Date("2025-11-25T11:30:00Z"),
        duration: 90,
        participants: ["Ahmad Rahman", "Siti Nurhaliza"],
        outcomes: "Informasi penting tentang kronologi kejadian berhasil dikumpulkan",
        challenges: "Korban masih trauma dan membutuhkan pendekatan psikologis",
        recommendations: "Perlu tindak lanjut dengan konseling psikologis",
        isConfidential: false,
        accessLevel: "CORE_TEAM_ONLY",
        conductedBy: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role
        },
        schedule: null,
        attachments: []
      }
    ];

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
    const report = await prisma.report.findUnique({
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

    // TODO: Replace with actual database creation once schema is migrated
    // For now, return mock created activity
    const activity = {
      id: `activity-${Date.now()}`,
      reportId,
      scheduleId: scheduleId || null,
      activityType,
      title,
      description,
      location,
      startDateTime: new Date(startDateTime),
      endDateTime: endDateTime ? new Date(endDateTime) : null,
      duration: endDateTime ? Math.round((new Date(endDateTime).getTime() - new Date(startDateTime).getTime()) / (1000 * 60)) : null,
      participants: participants || [],
      conductedBy: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      },
      outcomes,
      challenges,
      recommendations,
      isConfidential: isConfidential || false,
      accessLevel: accessLevel || 'CORE_TEAM_ONLY',
      schedule: null,
      attachments: []
    };

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