import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { getSessionFromRequest, isRoleAllowed } from "@/lib/auth/auth-utils";

export const runtime = "nodejs";

// POST /api/reports/schedule - Schedule an investigation
export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS', 'REKTOR'])) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportId, scheduledDate, notes } = body;

    if (!reportId || !scheduledDate) {
      return Response.json(
        { success: false, message: "Report ID and scheduled date are required" },
        { status: 400 }
      );
    }

    // Schedule the investigation
    const updatedReport = await reportService.scheduleInvestigation(
      reportId,
      new Date(scheduledDate),
      session.user.id,
      notes
    );

    return Response.json({
      success: true,
      report: updatedReport,
      message: "Investigasi berhasil dijadwalkan",
    });
  } catch (error) {
    console.error("Error scheduling investigation:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat menjadwalkan investigasi" },
      { status: 500 }
    );
  }
}