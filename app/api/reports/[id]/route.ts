import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";

export const runtime = "nodejs";

// GET /api/reports/[id] - Get a specific report by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id);
    
    if (isNaN(reportId)) {
      return Response.json(
        { success: false, message: "ID laporan tidak valid" },
        { status: 400 }
      );
    }

    const report = await reportService.getReportById(reportId);

    if (!report) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil laporan" },
      { status: 500 }
    );
  }
}

// PUT /api/reports/[id] - Update a specific report by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id);
    const body = await request.json();
    
    if (isNaN(reportId)) {
      return Response.json(
        { success: false, message: "ID laporan tidak valid" },
        { status: 400 }
      );
    }

    // Update the report using the service
    const updatedReport = await reportService.updateReport(reportId, body);

    if (!updatedReport) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      report: updatedReport,
      message: "Laporan berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat memperbarui laporan" },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] - Delete a specific report by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id);
    
    if (isNaN(reportId)) {
      return Response.json(
        { success: false, message: "ID laporan tidak valid" },
        { status: 400 }
      );
    }

    // For now, we'll just mark as deleted rather than actually deleting
    // In a real application, you might want to actually delete the report
    // or have a soft delete mechanism
    const updatedReport = await reportService.updateReport(reportId, {
      title: "[DELETED]",
      description: "[DELETED]",
      status: "REJECTED",
    });

    if (!updatedReport) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Laporan berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat menghapus laporan" },
      { status: 500 }
    );
  }
}