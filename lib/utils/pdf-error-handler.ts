// Standardized error handling for PDF operations

export interface PDFErrorContext {
  operation: 'generate' | 'download' | 'queue' | 'memory' | 'validation';
  type: 'report' | 'result' | 'process';
  requestId?: string;
  fileSize?: number;
  memoryUsage?: number;
}

export interface PDFErrorInfo {
  message: string;
  userMessage: string;
  technical: string;
  canRetry: boolean;
  shouldFallback: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class PDFErrorHandler {
  /**
   * Handle PDF-related errors with standardized responses
   */
  static handleError(error: unknown, context: PDFErrorContext): PDFErrorInfo {
    const errorInfo = this.analyzeError(error, context);
    
    // Log the error for debugging
    console.error(`[PDF Error] ${context.operation} failed for ${context.type}:`, {
      error: errorInfo.technical,
      context,
      timestamp: new Date().toISOString()
    });

    return errorInfo;
  }

  /**
   * Analyze error type and provide appropriate response
   */
  private static analyzeError(error: unknown, context: PDFErrorContext): PDFErrorInfo {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Memory-related errors
    if (errorMessage.includes('memory') || errorMessage.includes('out of memory') || errorMessage.includes('heap')) {
      return {
        message: 'Memory allocation failed',
        userMessage: 'File terlalu besar untuk diproses. Silakan coba dengan file yang lebih kecil atau hubungi administrator.',
        technical: `Memory error: ${errorMessage}`,
        canRetry: true,
        shouldFallback: true,
        priority: 'high'
      };
    }

    // Queue-related errors
    if (errorMessage.includes('queue') || errorMessage.includes('timeout') || errorMessage.includes('concurrent')) {
      return {
        message: 'PDF generation queue error',
        userMessage: 'Terlalu banyak permintaan PDF. Silakan tunggu sebentar dan coba lagi.',
        technical: `Queue error: ${errorMessage}`,
        canRetry: true,
        shouldFallback: false,
        priority: 'medium'
      };
    }

    // PDF generation errors
    if (errorMessage.includes('jsPDF') || errorMessage.includes('pdf') || errorMessage.includes('generation')) {
      return {
        message: 'PDF generation failed',
        userMessage: 'Terjadi kesalahan saat membuat file PDF. Format data mungkin tidak valid.',
        technical: `PDF generation error: ${errorMessage}`,
        canRetry: true,
        shouldFallback: true,
        priority: 'high'
      };
    }

    // Validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('format')) {
      return {
        message: 'Data validation failed',
        userMessage: 'Data yang diberikan tidak valid untuk membuat PDF.',
        technical: `Validation error: ${errorMessage}`,
        canRetry: false,
        shouldFallback: true,
        priority: 'medium'
      };
    }

    // Database/Network errors
    if (errorMessage.includes('database') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        message: 'Data access failed',
        userMessage: 'Gagal mengakses data. Periksa koneksi Anda dan coba lagi.',
        technical: `Data access error: ${errorMessage}`,
        canRetry: true,
        shouldFallback: false,
        priority: 'high'
      };
    }

    // File size errors
    if (errorMessage.includes('too large') || errorMessage.includes('size') || errorMessage.includes('limit')) {
      return {
        message: 'File size exceeded',
        userMessage: 'File PDF yang dihasilkan terlalu besar. Silakan hubungi administrator.',
        technical: `File size error: ${errorMessage}`,
        canRetry: false,
        shouldFallback: true,
        priority: 'medium'
      };
    }

    // Default error handling
    return {
      message: 'Unknown PDF error',
      userMessage: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi administrator.',
      technical: `Unknown error: ${errorMessage}`,
      canRetry: true,
      shouldFallback: true,
      priority: 'medium'
    };
  }

  /**
   * Create standardized error response
   */
  static createErrorResponse(errorInfo: PDFErrorInfo, context: PDFErrorContext, statusCode: number = 500) {
    const response: any = {
      success: false,
      message: errorInfo.userMessage,
      error: {
        type: errorInfo.message,
        priority: errorInfo.priority,
        canRetry: errorInfo.canRetry
      }
    };

    // Add technical details in development mode
    if (process.env.NODE_ENV === 'development') {
      response.error.technical = errorInfo.technical;
      response.error.context = context;
      response.error.timestamp = new Date().toISOString();
    }

    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }

  /**
   * Create fallback text response
   */
  static createFallbackResponse(data: any, type: 'report' | 'result' | 'process', filename?: string) {
    let content = '';
    let mimeType = 'text/plain';
    let finalFilename = filename || `document-${Date.now()}.txt`;

    if (type === 'report') {
      content = this.createReportFallback(data);
    } else if (type === 'result') {
      content = this.createResultFallback(data);
    } else if (type === 'process') {
      content = this.createProcessFallback(data);
    }

    return new Response(content, {
      headers: {
        'Content-Type': `${mimeType}; charset=utf-8`,
        'Content-Disposition': `attachment; filename="${finalFilename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });
  }

  /**
   * Create fallback content for reports
   */
  private static createReportFallback(report: any): string {
    return `
LAPORAN KEKERASAN

Nomor Laporan: ${report.reportNumber || 'N/A'}
Tanggal Dibuat: ${new Date(report.createdAt).toLocaleDateString('id-ID')}

INFORMASI LAPORAN
===============
Judul: ${report.title || 'N/A'}
Kategori: ${report.category || 'N/A'}
Tingkat Keparahan: ${report.severity || 'N/A'}
Status: ${report.status || 'N/A'}

DESKRIPSI KEJADIAN
================
${report.description || 'Tidak ada deskripsi'}

DETAIL KEJADIAN
=============
Tanggal Kejadian: ${report.incidentDate ? new Date(report.incidentDate).toLocaleDateString('id-ID') : 'N/A'}
Lokasi Kejadian: ${report.incidentLocation || 'N/A'}

INFORMASI PELAPOR
===============
Nama: ${report.reporter?.name || report.reporterName || 'N/A'}
Email: ${report.reporter?.email || report.reporterEmail || 'N/A'}

CATATAN KEPUTUSAN
===============
${report.decisionNotes || 'Belum ada catatan keputusan'}

REKOMENDASI
=========
${report.recommendation || 'Belum ada rekomendasi'}

---
Dokumen ini dibuat sebagai fallback karena PDF tidak dapat dibuat.
Dibuat pada: ${new Date().toLocaleString('id-ID')}
    `.trim();
  }

  /**
   * Create fallback content for investigation results
   */
  private static createResultFallback(result: any): string {
    return `
BERITA ACARA HASIL INVESTIGASI

ID: ${result.id || 'N/A'}
Judul Kegiatan: ${result.schedulingTitle || 'N/A'}
Tanggal: ${result.createdAt ? new Date(result.createdAt).toLocaleDateString('id-ID') : 'N/A'}

KEHADIRAN
========
Satgas yang Hadir: ${Array.isArray(result.satgasMembersPresent) ? result.satgasMembersPresent.length : 0} anggota
Status Kehadiran Pihak: ${Array.isArray(result.partiesPresent) ? result.partiesPresent.length : 0} pihak

CATATAN INVESTIGASI
==================
Ringkasan Keterangan:
${result.partiesStatementSummary || 'Tidak ada ringkasan'}

Temuan Bukti Baru:
${result.newPhysicalEvidence || 'Tidak ada temuan baru'}

KESIMPULAN & REKOMENDASI
=======================
Kesimpulan Sementara:
${result.sessionInterimConclusion || 'Belum ada kesimpulan'}

Rekomendasi:
${Array.isArray(result.recommendedImmediateActions) && result.recommendedImmediateActions.length > 0 
  ? result.recommendedImmediateActions.length + ' rekomendasi tersedia' 
  : 'Belum ada rekomendasi'}

OTENTIKASI
=========
Tanda Tangan Pembuat: ${result.creatorDigitalSignature ? 'Ya' : 'Tidak'}
Tanda Tangan Ketua: ${result.chairpersonDigitalSignature ? 'Ya' : 'Tidak'}

---
Dokumen ini dibuat sebagai fallback karena PDF tidak dapat dibuat.
Dibuat pada: ${new Date().toLocaleString('id-ID')}
    `.trim();
  }

  /**
   * Create fallback content for process documents
   */
  private static createProcessFallback(processData: any): string {
    const data = processData.data || {};
    return `
PROSES INVESTIGASI

Tanggal: ${new Date(processData.savedAt).toLocaleDateString('id-ID')}
Lokasi: ${data.location || 'Tidak ditentukan'}

METODE YANG DIGUNAKAN
===================
${Array.isArray(data.methods) ? data.methods.join(', ') : 'Tidak ada metode yang dipilih'}

TIM INVESTIGASI
==============
${Array.isArray(data.teamMembers) ? data.teamMembers.length : 0} anggota tim

RENCANA & CATATAN
================
Ringkasan Rencana: ${data.planSummary || 'Tidak ada ringkasan'}
Catatan Risiko: ${data.riskNotes || 'Tidak ada catatan'}

TINDAK LANJUT
============
Tindakan: ${data.followUpAction || 'Tidak ada'}
Catatan: ${data.followUpNotes || 'Tidak ada'}

---
Dokumen ini dibuat sebagai fallback karena PDF tidak dapat dibuat.
Dibuat pada: ${new Date().toLocaleString('id-ID')}
    `.trim();
  }

  /**
   * Check if error indicates system overload
   */
  static isSystemOverload(error: unknown): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return errorMessage.includes('concurrent') || 
           errorMessage.includes('queue') || 
           errorMessage.includes('memory') ||
           errorMessage.includes('timeout');
  }

  /**
   * Get appropriate retry delay based on error type
   */
  static getRetryDelay(error: unknown): number {
    if (this.isSystemOverload(error)) {
      return 2000; // 2 seconds for system overload
    }
    return 1000; // 1 second for other errors
  }
}