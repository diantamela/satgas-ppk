import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";

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
      include: {
        process: {
          include: {
            teamMembers: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                  }
                }
              }
            }
          }
        },
        report: {
          select: {
            id: true,
            reportNumber: true,
            title: true,
            description: true,
            category: true,
            severity: true,
            incidentDate: true,
            incidentLocation: true,
            reporter: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!investigationResult) {
      return Response.json(
        { success: false, message: "Investigation result not found" },
        { status: 404 }
      );
    }

    // Generate PDF content
    const pdfContent = generateInvestigationResultPDF(investigationResult);

    // Return PDF as response
    return new Response(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="berita-acara-${investigationResult.report.reportNumber}-${resultId}.pdf"`,
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

function generateInvestigationResultPDF(result: any): string {
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
      return `${index + 1}. ${actionMap[action.action] || action.action} (Prioritas: ${action.priority || 'N/A'})`;
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

  // Generate the PDF content as a formatted text document
  // In a real implementation, you'd use a PDF generation library like jsPDF or Puppeteer
  // For now, we'll create a well-formatted text document
  
  return `
BERITA ACARA HASIL INVESTIGASI
===================================

INFORMASI DASAR KEGIATAN:
-------------------------
ID Kegiatan Penjadwalan: ${result.schedulingId || '-'}
Judul Kegiatan: ${result.schedulingTitle || '-'}
Tanggal & Waktu Pelaksanaan: ${formatDateTime(result.schedulingDateTime)}
Lokasi Pelaksanaan: ${result.schedulingLocation || '-'}
Judul Kasus: ${result.caseTitle || result.report.title || '-'}
Nomor Laporan: ${result.reportNumber || result.report.reportNumber || '-'}
Tanggal Pembuatan BA: ${formatDateTime(result.createdAt)}

INFORMASI LAPORAN:
------------------
Nomor Laporan: ${result.report.reportNumber}
Judul Kasus: ${result.report.title}
Kategori: ${result.report.category || '-'}
Tingkat Keparahan: ${result.report.severity || '-'}
Tanggal Insiden: ${formatDate(result.report.incidentDate)}
Lokasi Insiden: ${result.report.incidentLocation || '-'}
Pelapor: ${result.report.reporter.name || '-'} (${result.report.reporter.email || '-'})

KEHADIRAN PIHAK TERLIBAT:
-------------------------
Satgas yang Hadir:
${formatSatgasMembers(result.satgasMembersPresent)}

Status Kehadiran Pihak:
${formatPartiesPresent(result.partiesPresent)}

Verifikasi Identitas: ${result.identityVerified ? 'Ya' : 'Tidak'}
Catatan Kehadiran: ${result.attendanceNotes || '-'}

CATATAN INTI INVESTIGASI:
-------------------------
Ringkasan Keterangan Pihak:
${result.partiesStatementSummary || '-'}

Temuan Bukti Fisik/Digital Baru:
${result.newPhysicalEvidence || '-'}

Bukti yang Diupload:
${formatEvidenceFiles(result.evidenceFiles)}

Konsistensi Keterangan:
${result.statementConsistency || '-'}

KESIMPULAN SEMENTARA & REKOMENDASI:
-----------------------------------
Kesimpulan Sementara dari Sesi Ini:
${result.sessionInterimConclusion || '-'}

Rekomendasi Tindak Lanjut Segera:
${formatRecommendedActions(result.recommendedImmediateActions)}

Perubahan Status Kasus: ${formatStatus(result.caseStatusAfterResult)}
Alasan Perubahan Status: ${result.statusChangeReason || '-'}

OTENTIKASI BERITA ACARA:
------------------------
Verifikasi Data: ${result.dataVerificationConfirmed ? 'Ya' : 'Tidak'}
Tanda Tangan Digital Pembuat BA: ${result.creatorDigitalSignature || '-'}
Tanggal TTD Pembuat BA: ${formatDateTime(result.creatorSignatureDate)}
Tanda Tangan Digital Ketua Forças: ${result.chairpersonDigitalSignature || '-'}
Tanggal TTD Ketua Forças: ${formatDateTime(result.chairpersonSignatureDate)}

INTEGRITAS DOKUMEN:
-------------------
Hash Dokumen: ${result.documentHash || '-'}
Tanggal Pembuatan: ${formatDateTime(result.createdAt)}
Terakhir Diperbarui: ${formatDateTime(result.updatedAt)}

CATATAN INTERNAL OTAN:
----------------------
${result.internalSatgasNotes || '-'}

===================================
Dokumen ini dibuat secara digital dan memiliki hash untuk memastikan integritas.
Generated on: ${formatDateTime(new Date())}
`;
}