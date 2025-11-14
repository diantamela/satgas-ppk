import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";

export const runtime = "nodejs";

// GET /api/reports/[id]/download - Download report as text file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const reportId = resolvedParams.id;

    if (!reportId || typeof reportId !== 'string') {
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

    // Generate text report content
    const reportContent = `
LAPORAN KEKERASAN

Nomor Laporan: ${report.reportNumber}
Tanggal Dibuat: ${new Date(report.createdAt).toLocaleDateString('id-ID')}

INFORMASI LAPORAN
================
Judul: ${report.title}
Kategori: ${report.category || 'N/A'}
Tingkat Keparahan: ${report.severity || 'N/A'}
Status: ${report.status}

DESKRIPSI KEJADIAN
==================
${report.description}

DETAIL KEJADIAN
===============
${report.incidentDate ? `Tanggal Kejadian: ${new Date(report.incidentDate).toLocaleDateString('id-ID')}` : 'Tanggal Kejadian: N/A'}
${report.incidentLocation ? `Lokasi Kejadian: ${report.incidentLocation}` : 'Lokasi Kejadian: N/A'}

INFORMASI PELAPOR
=================
Nama: ${report.reporter?.name || 'N/A'}
Email: ${report.reporter?.email || report.reporterEmail || 'N/A'}

CATATAN KEPUTUSAN
=================
${report.decisionNotes || 'Belum ada catatan keputusan'}

REKOMENDASI
===========
${report.recommendation || 'Belum ada rekomendasi'}

---
Laporan ini dihasilkan pada: ${new Date().toLocaleString('id-ID')}
    `.trim();

    // Return as downloadable text file
    return new Response(reportContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="laporan-${report.reportNumber}.txt"`,
      },
    });
  } catch (error) {
    console.error("Error downloading report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengunduh laporan" },
      { status: 500 }
    );
  }
}