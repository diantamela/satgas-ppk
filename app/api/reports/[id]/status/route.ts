import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";

export const runtime = "nodejs";

// PUT /api/reports/[id]/status - Update report status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const reportId = resolvedParams.id;
    const body = await request.json();

    if (!reportId || typeof reportId !== 'string') {
      return Response.json(
        { success: false, message: "ID laporan tidak valid" },
        { status: 400 }
      );
    }

    const { status, notes } = body;

    if (!status) {
      return Response.json(
        { success: false, message: "Status harus disediakan" },
        { status: 400 }
      );
    }

    // Map status to enum values
    const statusMap: { [key: string]: string } = {
      'pending': 'PENDING',
      'verified': 'VERIFIED',
      'scheduled': 'SCHEDULED',
      'in_progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'rejected': 'REJECTED'
    };

    const mappedStatus = statusMap[status.toLowerCase()] || status.toUpperCase();

    // Prepare update data
    const updateData: any = { status: mappedStatus };

    // Add notes based on status - use decisionNotes for all status-related notes
    if (notes) {
      updateData.decisionNotes = notes;
    }

    // Update the report status
    const updatedReport = await reportService.updateReport(reportId, updateData);

    if (!updatedReport) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      report: updatedReport,
      message: "Status laporan berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat memperbarui status laporan" },
      { status: 500 }
    );
  }
}