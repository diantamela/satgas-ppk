import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";

export const runtime = "nodejs";

// POST /api/reports/[id]/notes - Add notes to report
export async function POST(
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

    const { noteType, notes } = body;

    if (!notes || !notes.trim()) {
      return Response.json(
        { success: false, message: "Catatan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Prepare update data based on note type
    const updateData: any = {};

    switch (noteType) {
      case 'verification':
      case 'investigation':
        // For now, store all notes in decisionNotes field
        // In a real app, you might want to add separate fields to the schema
        updateData.decisionNotes = notes;
        break;
      case 'recommendation':
        updateData.recommendation = notes;
        break;
      default:
        return Response.json(
          { success: false, message: "Tipe catatan tidak valid" },
          { status: 400 }
        );
    }

    // Update the report with notes
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
      message: "Catatan berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error adding notes to report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat menambahkan catatan" },
      { status: 500 }
    );
  }
}