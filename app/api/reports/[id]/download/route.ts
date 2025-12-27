import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import { pdfService } from "@/lib/services/pdf/unified-pdf-service";
import { PDFErrorHandler, PDFErrorContext } from "@/lib/utils/pdf-error-handler";

export const runtime = "nodejs";

// Add memory tracking for PDF conflicts
const memoryUsage = new Map<string, { timestamp: number; heapUsed: number }>();

function logMemoryUsage(context: string) {
  const mem = process.memoryUsage();
  const key = `${context}-${Date.now()}`;
  memoryUsage.set(key, { timestamp: Date.now(), heapUsed: mem.heapUsed });
  console.log(`[Memory Debug] ${context}: Heap Used = ${Math.round(mem.heapUsed / 1024 / 1024)}MB, External = ${Math.round(mem.external / 1024 / 1024)}MB`);
  
  // Clean up old entries
  if (memoryUsage.size > 50) {
    const entries = Array.from(memoryUsage.entries());
    entries.slice(0, 25).forEach(([k]) => memoryUsage.delete(k));
  }
  
  return mem;
}



// GET /api/reports/[id]/download - Download report as PDF file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  let reportId: string | undefined;
  const requestId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`[Report Download] Starting report download for ID: ${params}, RequestID: ${requestId}`);
    const memBefore = logMemoryUsage(`[${requestId}] Before report fetch`);
    
    const resolvedParams = await params;
    reportId = resolvedParams.id;

    if (!reportId || typeof reportId !== 'string') {
      console.error(`[Report Download] Invalid report ID: ${reportId}`);
      return Response.json(
        { success: false, message: "ID laporan tidak valid. Silakan gunakan ID yang benar." },
        { status: 400 }
      );
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(reportId)) {
      console.error(`[Report Download] Invalid UUID format: ${reportId}`);
      return Response.json(
        { success: false, message: "Format ID laporan tidak valid." },
        { status: 400 }
      );
    }

    console.log(`[Report Download] Fetching report with ID: ${reportId}`);
    const report = await reportService.getReportById(reportId);
    console.log(`[Report Download] Report found: ${!!report}`);

    if (!report) {
      console.warn(`[Report Download] Report not found: ${reportId}`);
      return Response.json(
        { success: false, message: "File laporan tidak ditemukan. Laporan mungkin telah dihapus atau belum tersedia." },
        { status: 404 }
      );
    }

    console.log("Report data:", {
      id: report.id,
      reportNumber: report.reportNumber,
      title: report.title,
      status: report.status,
      description: report.description?.substring(0, 100) + '...',
      createdAt: report.createdAt,
      reporter: report.reporter
    });

    try {
      console.log(`[Report Download] Starting unified PDF generation with RequestID: ${requestId}`);
      const memDuring = logMemoryUsage(`[${requestId}] Before PDF generation`);
      
      // Use unified PDF service instead of direct jsPDF
      const pdfBuffer = await pdfService.generatePDF('report', report, {
        title: "LAPORAN KEKERASAN",
        subtitle: "SISTEM INFORMASI PENANGANAN KASUS PENGANIAYAAN SEKSUAL",
        author: "Sistem Informasi Penanganan Kasus Penganiayaan Seksual",
        subject: "Laporan Kasus Penganiayaan Seksual",
        margins: { top: 60, bottom: 60, left: 50, right: 50 }
      });
      
      if (!pdfBuffer || pdfBuffer.byteLength === 0) {
        throw new Error("Generated PDF buffer is empty");
      }
      
      // Validate PDF size
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (pdfBuffer.byteLength > maxSize) {
        throw new Error(`Generated PDF too large: ${pdfBuffer.byteLength} bytes`);
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`[Report Download] PDF generated successfully in ${processingTime}ms, buffer length: ${pdfBuffer.byteLength}`);
      const memAfter = logMemoryUsage(`[${requestId}] After PDF generation`);

      // Enhanced filename generation
      const reportNumber = (report.reportNumber || reportId).replace(/[^a-zA-Z0-9]/g, '-');
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
      const fileName = `laporan-${reportNumber}-${dateStr}-${timeStr}.pdf`;

      // Return as downloadable PDF file
      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': pdfBuffer.byteLength.toString(),
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

    } catch (pdfError) {
      const processingTime = Date.now() - startTime;
      console.error(`[Report Download] Error generating PDF after ${processingTime}ms (${requestId}):`, pdfError);
      console.error(`[Report Download] Error stack (${requestId}):`, pdfError instanceof Error ? pdfError.stack : 'No stack trace');
      
      // Enhanced error handling
      let errorMessage = "Gagal membuat file PDF laporan.";
      
      if (pdfError instanceof Error) {
        if (pdfError.message.includes('jsPDF') || pdfError.message.includes('pdf')) {
          errorMessage = "Terjadi kesalahan saat memproses PDF. Format data mungkin tidak valid.";
        } else if (pdfError.message.includes('memory') || pdfError.message.includes('out of memory')) {
          errorMessage = "File terlalu besar untuk diproses sebagai PDF. Silakan hubungi administrator.";
        } else if (pdfError.message.includes('timeout')) {
          errorMessage = "Waktu proses habis. File mungkin terlalu besar. Coba lagi nanti.";
        }
      }
      
      // Fallback to text response only for smaller reports
      const reportContent = `
LAPORAN KEKERASAN

Nomor Laporan: ${report.reportNumber}
Tanggal Dibuat: ${new Date(report.createdAt).toLocaleDateString('id-ID')}

INFORMASI LAPORAN
===============
Judul: ${report.title}
Kategori: ${report.category || 'N/A'}
Tingkat Keparahan: ${report.severity || 'N/A'}
Status: ${report.status}

DESKRIPSI KEJADIAN
=================
${report.description}

DETAIL KEJADIAN
==============
${report.incidentDate ? `Tanggal Kejadian: ${new Date(report.incidentDate).toLocaleDateString('id-ID')}` : 'Tanggal Kejadian: N/A'}
${report.incidentLocation ? `Lokasi Kejadian: ${report.incidentLocation}` : 'Lokasi Kejadian: N/A'}

INFORMASI PELAPOR
================
Nama: ${report.reporter?.name || 'N/A'}
Email: ${report.reporter?.email || report.reporterEmail || 'N/A'}

CATATAN KEPUTUSAN
================
${report.decisionNotes || 'Belum ada catatan keputusan'}

REKOMENDASI
==========
${report.recommendation || 'Belum ada rekomendasi'}

---
Laporan ini dihasilkan pada: ${new Date().toLocaleString('id-ID')}
    `.trim();

      const reportNumber = (report.reportNumber || reportId || 'unknown').replace(/[^a-zA-Z0-9]/g, '-');
      const fileName = `laporan-${reportNumber}-${Date.now()}.txt`;
      
      return new Response(reportContent, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      });
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[Report Download] Error after ${processingTime}ms:`, error);
    
    // Enhanced error handling
    let errorMessage = "Terjadi kesalahan saat mengunduh laporan.";
    let errorDetails = "";
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      // Handle specific error types
      if (error.message.includes('database') || error.message.includes('db')) {
        errorMessage = "Terjadi kesalahan saat mengakses data laporan. Silakan coba lagi.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Terjadi masalah jaringan. Periksa koneksi internet Anda dan coba lagi.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Waktu proses habis. File mungkin terlalu besar. Coba lagi nanti.";
      }
    }
    
    // Log detailed error for debugging
    console.error(`[Report Download] Detailed error info (${requestId}):`, {
      message: errorMessage,
      details: errorDetails,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      reportId,
      processingTime
    });
    
    return Response.json(
      { 
        success: false, 
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: errorDetails,
          processingTime
        })
      },
      { status: 500 }
    );
  } finally {
    // Log final memory state
    const memFinal = logMemoryUsage(`[${requestId}] Final cleanup`);
    
    // Check for memory leaks
    const memIncrease = memFinal.heapUsed - (process as any).initialHeapUsed;
    if (memIncrease > 50 * 1024 * 1024) { // 50MB threshold
      console.warn(`[Memory Debug] Potential memory leak detected in ${requestId}: +${Math.round(memIncrease / 1024 / 1024)}MB`);
    }
  }
}

// Add global memory tracking
if (!(process as any).initialHeapUsed) {
  (process as any).initialHeapUsed = process.memoryUsage().heapUsed;
  console.log('[Memory Debug] Initial heap size recorded:', Math.round((process as any).initialHeapUsed / 1024 / 1024), 'MB');
}