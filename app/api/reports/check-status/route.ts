import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";

export const runtime = "nodejs";

// GET /api/reports/check-status?reportNumber=XXXX - Check the status of a report
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const reportNumber = searchParams.get("reportNumber");

    if (!reportNumber) {
      return Response.json(
        { success: false, message: "Nomor laporan diperlukan" },
        { status: 400 }
      );
    }

    // Find the report by report number using the service
    const report = await reportService.getReportByNumber(reportNumber);

    if (!report) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Return the report details
    return Response.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Error checking report status:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat memeriksa status laporan" },
      { status: 500 }
    );
  }
}