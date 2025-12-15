import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

// GET /api/reports/[id]/results/[resultId]/pdf - Generate PDF for investigation result
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resultId: string }> }
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

    const { id: reportId, resultId } = await params;

    if (!reportId || !resultId) {
      return Response.json(
        { success: false, message: "Report ID and Result ID are required" },
        { status: 400 }
      );
    }

    // Get investigation result with related data
    const investigationResult = await db.investigationResult.findFirst({
      where: {
        id: resultId,
        reportId: reportId
      },
      select: {
        id: true,
        processId: true,
        reportId: true,
        schedulingId: true,
        schedulingTitle: true,
        schedulingDateTime: true,
        schedulingLocation: true,
        caseTitle: true,
        reportNumber: true,
        satgasMembersPresent: true,
        partiesPresent: true,
        identityVerified: true,
        attendanceNotes: true,
        partiesStatementSummary: true,
        newPhysicalEvidence: true,
        evidenceFiles: true,
        statementConsistency: true,
        sessionInterimConclusion: true,
        recommendedImmediateActions: true,
        caseStatusAfterResult: true,
        statusChangeReason: true,
        dataVerificationConfirmed: true,
        creatorDigitalSignature: true,
        creatorSignatureDate: true,
        creatorSignerName: true,
        chairpersonDigitalSignature: true,
        chairpersonSignatureDate: true,
        chairpersonSignerName: true,
        partiesDetailedAttendance: true,
        recommendedActionsDetails: true,
        documentHash: true,
        internalSatgasNotes: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!investigationResult) {
      return Response.json(
        { success: false, message: "Investigation result not found" },
        { status: 404 }
      );
    }

    // Generate PDF content
    const pdfBuffer = await generateInvestigationResultPDF(investigationResult);

    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="berita-acara-${investigationResult?.reportNumber || 'unknown'}-${resultId}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Error generating investigation result PDF:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat membuat PDF berita acara" },
      { status: 500 }
    );
  }
}

async function generateInvestigationResultPDF(result: any): Promise<ArrayBuffer> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  
  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let yPosition = height - 50;
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("id-ID");
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString("id-ID");
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'UNDER_INVESTIGATION': 'Dalam Investigasi',
      'EVIDENCE_COLLECTION': 'Pengumpulan Bukti',
      'STATEMENT_ANALYSIS': 'Analisis Keterangan',
      'PENDING_EXTERNAL_INPUT': 'Menunggu Input Eksternal',
      'READY_FOR_RECOMMENDATION': 'Siap untuk Rekomendasi',
      'CLOSED_TERMINATED': 'Ditutup/Dihentikan',
      'FORWARDED_TO_REKTORAT': 'Diteruskan ke Rektorat'
    };
    return statusMap[status] || status;
  };

  const formatPriority = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'HIGH': 'Tinggi',
      'MEDIUM': 'Sedang',
      'LOW': 'Rendah'
    };
    return priorityMap[priority] || priority || 'N/A';
  };

  const formatRecommendedActions = (actions: any[]) => {
    if (!actions || actions.length === 0) return "-";
    return actions.map((action: any, index: number) => {
      const actionMap: Record<string, string> = {
        'SCHEDULE_NEXT_SESSION': 'Jadwalkan Sesi Berikutnya',
        'CALL_OTHER_PARTY': 'Panggil Pihak Lain',
        'REQUIRE_PSYCHOLOGICAL_SUPPORT': 'Perlu Pendampingan Psikologis',
        'REQUIRE_LEGAL_SUPPORT': 'Perlu Pendampingan Hukum',
        'CASE_TERMINATED': 'Kasus Dihentikan',
        'FORWARD_TO_REKTORAT': 'Diteruskan ke Rektorat',
        'MEDIATION_SESSION': 'Sesi Mediasi',
        'EVIDENCE_ANALYSIS': 'Analisis Bukti',
        'WITNESS_REINTERVIEW': 'Wawancara Ulang Saksi',
        'OTHER': 'Lainnya'
      };
      const notes = action.notes ? ` - Catatan: ${action.notes}` : '';
      return `${index + 1}. ${actionMap[action.action] || action.action} (Prioritas: ${formatPriority(action.priority)})${notes}`;
    }).join('\n');
  };

  const formatPartiesPresent = (parties: any[]) => {
    if (!parties || parties.length === 0) return "-";
    return parties.map((party: any, index: number) => {
      const statusMap: Record<string, string> = {
        'PRESENT': '✓ Hadir',
        'ABSENT_NO_REASON': '✗ Tidak Hadir Tanpa Keterangan',
        'ABSENT_WITH_REASON': '✗ Tidak Hadir dengan Alasan'
      };
      return `${index + 1}. ${party.name || 'N/A'} - ${party.role || 'N/A'} (${statusMap[party.status] || party.status})`;
    }).join('\n');
  };

  const formatSatgasMembers = (members: any[]) => {
    if (!members || members.length === 0) return "-";
    return members.map((member: any, index: number) => {
      return `${index + 1}. ${member.name || 'N/A'} - ${member.role || 'N/A'}`;
    }).join('\n');
  };

  const formatEvidenceFiles = (files: any[]) => {
    if (!files || files.length === 0) return "-";
    return files.map((file: any, index: number) => {
      const sizeKB = file.size ? (file.size / 1024).toFixed(1) : 'N/A';
      return `${index + 1}. ${file.name || 'N/A'} (${sizeKB} KB - ${file.type || 'N/A'})`;
    }).join('\n');
  };

  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: any = rgb(0, 0, 0)) => {
    const currentFont = isBold ? fontBold : font;
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (yPosition < 50) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        yPosition = newPage.getSize().height - 50;
        // Switch to new page
        (page as any) = newPage;
      }
      
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: currentFont,
        color: color,
      });
      yPosition -= fontSize + 5;
    }
    yPosition -= 5; // Extra space after text block
  };

  // Title
  addText('BERITA ACARA HASIL INVESTIGASI', 16, true);
  addText('================================================================================', 8);
  yPosition -= 10;

  // Basic Information
  addText('INFORMASI DASAR KEGIATAN:', 12, true);
  addText(`ID Kegiatan Penjadwalan: ${result.schedulingId || '-'}`);
  addText(`Judul Kegiatan: ${result.schedulingTitle || '-'}`);
  addText(`Tanggal & Waktu Pelaksanaan: ${formatDateTime(result.schedulingDateTime)}`);
  addText(`Lokasi Pelaksanaan: ${result.schedulingLocation || '-'}`);
  addText(`Judul Kasus: ${result.caseTitle || '-'}`);
  addText(`Nomor Laporan: ${result.reportNumber || '-'}`);
  addText(`Tanggal Pembuatan BA: ${formatDateTime(result.createdAt)}`);
  yPosition -= 10;

  // Attendance
  addText('KEHADIRAN PIHAK TERLIBAT:', 12, true);
  addText('Satgas yang Hadir:');
  addText(formatSatgasMembers(result.satgasMembersPresent));
  addText('Status Kehadiran Pihak:');
  addText(formatPartiesPresent(result.partiesPresent));
  addText(`Verifikasi Identitas: ${result.identityVerified ? 'Ya' : 'Tidak'}`);
  addText(`Catatan Kehadiran: ${result.attendanceNotes || '-'}`);
  yPosition -= 10;

  // Investigation Notes
  addText('CATATAN INTI INVESTIGASI:', 12, true);
  addText('Ringkasan Keterangan Pihak:');
  addText(result.partiesStatementSummary || '-');
  addText('Temuan Bukti Fisik/Digital Baru:');
  addText(result.newPhysicalEvidence || '-');
  addText('Bukti yang Diupload:');
  addText(formatEvidenceFiles(result.evidenceFiles));
  addText('Konsistensi Keterangan:');
  addText(result.statementConsistency || '-');
  yPosition -= 10;

  // Conclusions and Recommendations
  addText('KESIMPULAN SEMENTARA & REKOMENDASI:', 12, true);
  addText('Kesimpulan Sementara dari Sesi Ini:');
  addText(result.sessionInterimConclusion || '-');
  addText('Rekomendasi Tindak Lanjut Segera:');
  addText(formatRecommendedActions(result.recommendedImmediateActions));
  addText(`Perubahan Status Kasus: ${formatStatus(result.caseStatusAfterResult)}`);
  addText(`Alasan Perubahan Status: ${result.statusChangeReason || '-'}`);
  yPosition -= 10;

  // Authentication
  addText('OTENTIKASI BERITA ACARA:', 12, true);
  addText(`Verifikasi Data: ${result.dataVerificationConfirmed ? 'Ya' : 'Tidak'}`);
  addText(`Tanda Tangan Digital Pembuat BA: ${result.creatorDigitalSignature ? 'Ya' : 'Tidak'}`);
  addText(`Nama Pembuat: ${result.creatorSignerName || '-'}`);
  addText(`Tanggal TTD Pembuat: ${formatDateTime(result.creatorSignatureDate)}`);
  addText(`Tanda Tangan Digital Ketua: ${result.chairpersonDigitalSignature ? 'Ya' : 'Tidak'}`);
  addText(`Nama Ketua: ${result.chairpersonSignerName || '-'}`);
  addText(`Tanggal TTD Ketua: ${formatDateTime(result.chairpersonSignatureDate)}`);
  yPosition -= 10;

  // Document Integrity
  addText('INTEGRITAS DOKUMEN:', 12, true);
  addText(`Hash Dokumen: ${result.documentHash || '-'}`);
  addText(`Tanggal Pembuatan: ${formatDateTime(result.createdAt)}`);
  addText(`Terakhir Diperbarui: ${formatDateTime(result.updatedAt)}`);
  yPosition -= 10;

  // Internal Notes
  addText('CATATAN INTERNAL:', 12, true);
  addText(result.internalSatgasNotes || '-');
  yPosition -= 20;

  // Footer
  addText('================================================================================', 8);
  addText('Dokumen ini dibuat secara digital dan memiliki hash untuk memastikan integritas.');
  addText(`Dibuat pada: ${formatDateTime(new Date())}`);
  addText('Generated by: Sistem Informasi Penanganan KasusPPTSEKSUAL');
  addText('================================================================================', 8);

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).buffer;
}