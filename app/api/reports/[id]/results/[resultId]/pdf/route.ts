import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";
import { pdfService } from "@/lib/services/pdf/unified-pdf-service";
import { PDFErrorHandler, PDFErrorContext } from "@/lib/utils/pdf-error-handler";

export const runtime = "nodejs";

// Add concurrent request tracking for PDF conflicts
const activePDFRequests = new Map<string, { timestamp: number; type: string; heapUsed: number }>();

function trackPDFRequest(requestId: string, type: string) {
  const mem = process.memoryUsage();
  activePDFRequests.set(requestId, { 
    timestamp: Date.now(), 
    type, 
    heapUsed: mem.heapUsed 
  });
  
  console.log(`[PDF Conflict Debug] Active PDF requests: ${activePDFRequests.size}`);
  console.log(`[PDF Conflict Debug] Request ${requestId} (${type}) - Heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB`);
  
  // Clean up old entries (older than 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [key, value] of activePDFRequests.entries()) {
    if (value.timestamp < fiveMinutesAgo) {
      activePDFRequests.delete(key);
    }
  }
}

function untrackPDFRequest(requestId: string) {
  if (activePDFRequests.has(requestId)) {
    const request = activePDFRequests.get(requestId)!;
    const duration = Date.now() - request.timestamp;
    console.log(`[PDF Conflict Debug] Completed ${requestId} (${request.type}) - Duration: ${duration}ms`);
    activePDFRequests.delete(requestId);
  }
}

// GET /api/reports/[id]/results/[resultId]/pdf - Generate PDF for investigation result
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  const startTime = Date.now();
  let reportId: string | undefined;
  let resultId: string | undefined;
  const requestId = `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  let investigationResult: any = null;
  
  try {
    console.log(`[PDF Generation] Starting PDF generation for result: ${params}, RequestID: ${requestId}`);
    trackPDFRequest(requestId, 'investigation-result');
    
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS', 'REKTOR'])) {
      console.warn(`[PDF Generation] Unauthorized access attempt for result PDF`);
      return Response.json(
        { success: false, message: "Anda tidak memiliki akses untuk mengunduh file ini. Silakan hubungi administrator." },
        { status: 401 }
      );
    }

    const paramsData = await params;
    reportId = paramsData.id;
    resultId = paramsData.resultId;

    if (!reportId || !resultId) {
      console.error(`[PDF Generation] Missing required parameters: reportId=${reportId}, resultId=${resultId}`);
      return Response.json(
        { success: false, message: "ID laporan dan ID hasil investigasi diperlukan untuk mengunduh PDF." },
        { status: 400 }
      );
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(reportId) || !uuidRegex.test(resultId)) {
      console.error(`[PDF Generation] Invalid UUID format: reportId=${reportId}, resultId=${resultId}`);
      return Response.json(
        { success: false, message: "Format ID tidak valid. Silakan gunakan ID yang benar." },
        { status: 400 }
      );
    }

    // Get investigation result with related data
    console.log(`[PDF Generation] Fetching investigation result for reportId=${reportId}, resultId=${resultId}`);
    investigationResult = await db.investigationResult.findFirst({
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
      console.warn(`[PDF Generation] Investigation result not found: reportId=${reportId}, resultId=${resultId}`);
      return Response.json(
        { success: false, message: "File PDF berita acara tidak ditemukan. File mungkin telah dihapus atau belum tersedia." },
        { status: 404 }
      );
    }
    
    console.log(`[PDF Generation] Investigation result found: ${investigationResult.id}`);

    // Generate PDF content using unified service
    console.log(`[PDF Generation] Starting unified PDF generation process for result: ${resultId}`);
    const pdfBuffer = await pdfService.generatePDF('result', investigationResult, {
      title: "BERITA ACARA HASIL INVESTIGASI",
      subtitle: "SISTEM INFORMASI PENANGANAN KASUS PENGANIAYAAN SEKSUAL",
      author: "Sistem Informasi Penanganan Kasus Penganiayaan Seksual",
      subject: "Berita Acara Hasil Investigasi",
      margins: { top: 60, bottom: 60, left: 50, right: 50 }
    });
    
    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      console.error(`[PDF Generation] Generated PDF buffer is empty or invalid`);
      return Response.json(
        { success: false, message: "Gagal membuat file PDF. Data berita acara mungkin tidak lengkap atau rusak." },
        { status: 500 }
      );
    }
    
    // Validate PDF size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (pdfBuffer.byteLength > maxSize) {
      console.error(`[PDF Generation] Generated PDF too large: ${pdfBuffer.byteLength} bytes`);
      return Response.json(
        { success: false, message: "File PDF yang dihasilkan terlalu besar. Silakan hubungi administrator." },
        { status: 500 }
      );
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`[PDF Generation] PDF generated successfully in ${processingTime}ms, size: ${pdfBuffer.byteLength} bytes, RequestID: ${requestId}`);

    // Return PDF as response
    const resultIdShort = resultId ? resultId.substring(0, 8) : 'unknown';
    const fileName = `berita-acara-${(investigationResult?.reportNumber || 'unknown').replace(/[^a-zA-Z0-9]/g, '-')}-${resultIdShort}.pdf`;
    
    const response = new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
    console.log(`[PDF Conflict Debug] Successfully completed ${requestId} - Active requests: ${activePDFRequests.size - 1}`);
    return response;

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[PDF Generation] Error after ${processingTime}ms: ${requestId}`, error);
    
    // Use standardized error handling
    const errorContext: PDFErrorContext = {
      operation: 'generate',
      type: 'result',
      requestId,
      fileSize: investigationResult ? undefined : 0
    };
    
    const errorInfo = PDFErrorHandler.handleError(error, errorContext);
    
    if (errorInfo.shouldFallback && investigationResult) {
      console.log(`[PDF Generation] Creating fallback response for ${requestId}`);
      const resultIdShort = resultId ? resultId.substring(0, 8) : 'unknown';
      const fileName = `berita-acara-${(investigationResult?.reportNumber || 'unknown').replace(/[^a-zA-Z0-9]/g, '-')}-${resultIdShort}.txt`;
      return PDFErrorHandler.createFallbackResponse(investigationResult, 'result', fileName);
    }
    
    return PDFErrorHandler.createErrorResponse(errorInfo, errorContext);
  } finally {
    // Always cleanup tracking
    untrackPDFRequest(requestId);
    const memAfter = process.memoryUsage();
    console.log(`[PDF Conflict Debug] Memory after request ${requestId}: ${Math.round(memAfter.heapUsed / 1024 / 1024)}MB`);
  }
}


