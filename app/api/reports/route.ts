import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/report-service";

export const runtime = "nodejs";

// POST /api/reports - Create a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create report using the service
    const newReport = await reportService.createReport({
      title: body.title,
      description: body.description,
      category: body.category,
      severity: body.severity,
      isAnonymous: body.isAnonymous || false,
      reporterName: body.isAnonymous ? null : body.reporterName,
      reporterEmail: body.isAnonymous ? null : body.reporterEmail,
      respondentName: body.respondentName,
      respondentPosition: body.respondentPosition || null,
      incidentDate: body.incidentDate ? new Date(body.incidentDate) : null,
      incidentLocation: body.incidentLocation || null,
      evidenceFiles: body.evidenceFiles ? JSON.stringify(body.evidenceFiles) : null,
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

// GET /api/reports - Get all reports (for admin/satgas users)
export async function GET(request: NextRequest) {
  try {
    // Check user session and permissions here
    // For now, return all reports
    const allReports = await reportService.getAllReports();

    return Response.json({
      success: true,
      reports: allReports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil laporan" },
      { status: 500 }
    );
  }
}