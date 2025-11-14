import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";

export const runtime = "nodejs";

// POST /api/reports - Create a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create report using the service
    const newReport = await reportService.createReport({
      title: body.title,
      description: body.description,
      incidentDate: body.incidentDate ? new Date(body.incidentDate) : null,
      incidentLocation: body.incidentLocation || null,
      reporterId: body.reporterId,
      reporterEmail: body.reporterEmail,
    });

    return Response.json({
      success: true,
      report: newReport,
      message: "Laporan berhasil dikirim",
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengirim laporan" },
      { status: 500 }
    );
  }
}

// GET /api/reports - Get reports with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reporterId = searchParams.get('reporterId');
    const reportNumber = searchParams.get('reportNumber');

    let filters: any = {};
    if (reporterId) {
      filters.reporterId = reporterId;
    }

    // If reportNumber is provided, get specific report by number
    if (reportNumber) {
      const report = await reportService.getReportByNumber(reportNumber);
      return Response.json({
        success: true,
        reports: report ? [report] : [],
      });
    }

    const reports = await reportService.getAllReports(filters);

    return Response.json({
      success: true,
      reports: reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil laporan" },
      { status: 500 }
    );
  }
}