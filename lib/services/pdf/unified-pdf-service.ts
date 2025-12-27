import { NextRequest } from "next/server";
import jsPDF from "jspdf";
import fs from "fs";
import path from "path";
import { generateSignedUrl } from "@/lib/utils/file-upload";

// Types for PDF generation
export interface PDFGenerationOptions {
  title: string;
  subtitle?: string;
  author?: string;
  subject?: string;
  margins?: { top: number; bottom: number; left: number; right: number };
  fontSize?: { title: number; subtitle: number; normal: number; small: number };
}

export interface PDFContent {
  type: 'text' | 'list' | 'paragraph' | 'image' | 'section';
  content: string | string[];
  title?: string;
  options?: any;
}

export interface PDFSection {
  title: string;
  content: string[];
  type?: 'text' | 'list' | 'paragraph';
}

// Memory tracking for PDF generation
const activePDFGenerations = new Map<string, { 
  timestamp: number; 
  type: string; 
  heapUsed: number;
  memoryLimit: number;
}>();

const MAX_CONCURRENT_PDF = 3;
const MAX_MEMORY_PER_PDF = 100 * 1024 * 1024; // 100MB
const PDF_GENERATION_TIMEOUT = 30000; // 30 seconds

/**
 * Unified PDF Generation Service
 * Prevents conflicts by managing all PDF generation in one place
 */
export class UnifiedPDFService {
  private static instance: UnifiedPDFService;
  private generationQueue: Array<{
    id: string;
    type: string;
    data: any;
    resolve: (value: Buffer) => void;
    reject: (error: Error) => void;
    startTime: number;
  }> = [];
  private isProcessing = false;
  private memoryCleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Start memory cleanup interval
    this.memoryCleanupInterval = setInterval(() => {
      this.cleanupMemory();
    }, 60000); // Every minute
  }

  public static getInstance(): UnifiedPDFService {
    if (!UnifiedPDFService.instance) {
      UnifiedPDFService.instance = new UnifiedPDFService();
    }
    return UnifiedPDFService.instance;
  }

  /**
   * Generate PDF with queue management
   */
  async generatePDF(
    type: 'report' | 'result' | 'process',
    data: any,
    options: PDFGenerationOptions = {
      title: 'PDF Document',
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
      fontSize: { title: 20, subtitle: 16, normal: 12, small: 10 }
    }
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const requestId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const request = {
        id: requestId,
        type,
        data,
        resolve,
        reject,
        startTime: Date.now()
      };

      this.generationQueue.push(request);
      console.log(`[PDF Queue] Added request ${requestId} to queue. Queue length: ${this.generationQueue.length}`);
      
      // Start processing if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the PDF generation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.generationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.generationQueue.length > 0) {
      const request = this.generationQueue.shift()!;
      
      try {
        // Check memory before starting
        const memoryUsage = process.memoryUsage();
        if (memoryUsage.heapUsed > MAX_MEMORY_PER_PDF * MAX_CONCURRENT_PDF) {
          console.warn(`[PDF Queue] High memory usage detected: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
          await this.waitForMemoryCleanup();
        }

        console.log(`[PDF Queue] Processing request ${request.id} of type ${request.type}`);
        const result = await this.processSingleRequest(request);
        request.resolve(result);
        
      } catch (error) {
        console.error(`[PDF Queue] Error processing request ${request.id}:`, error);
        request.reject(error instanceof Error ? error : new Error('Unknown PDF generation error'));
      }

      // Small delay between requests to prevent overwhelming
      await this.delay(100);
    }

    this.isProcessing = false;
  }

  /**
   * Process a single PDF generation request
   */
  private async processSingleRequest(request: any): Promise<Buffer> {
    const startTime = Date.now();
    const requestId = request.id;
    const type = request.type;
    
    // Track active generation
    const memoryUsage = process.memoryUsage();
    activePDFGenerations.set(requestId, {
      timestamp: startTime,
      type,
      heapUsed: memoryUsage.heapUsed,
      memoryLimit: MAX_MEMORY_PER_PDF
    });

    try {
      console.log(`[PDF Generation] Starting ${type} PDF generation: ${requestId}`);
      
      let result: Buffer;
      switch (type) {
        case 'report':
          result = await this.generateReportPDF(request.data);
          break;
        case 'result':
          result = await this.generateResultPDF(request.data);
          break;
        case 'process':
          result = await this.generateProcessPDF(request.data);
          break;
        default:
          throw new Error(`Unsupported PDF type: ${type}`);
      }

      const duration = Date.now() - startTime;
      console.log(`[PDF Generation] Completed ${type} PDF generation: ${requestId} in ${duration}ms`);
      
      return result;
      
    } finally {
      // Always cleanup tracking
      activePDFGenerations.delete(requestId);
    }
  }

  /**
   * Generate report PDF
   */
  private async generateReportPDF(report: any): Promise<Buffer> {
    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.text('LAPORAN KEKERASAN', 105, y, { align: 'center' });
    y += 20;

    // Basic info
    doc.setFontSize(12);
    doc.text(`Nomor Laporan: ${report.reportNumber}`, 20, y);
    y += 10;

    doc.text(`Tanggal Dibuat: ${new Date(report.createdAt).toLocaleDateString('id-ID')}`, 20, y);
    y += 15;

    // Content sections
    await this.addReportContent(doc, report, y);

    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Generate investigation result PDF
   */
  private async generateResultPDF(result: any): Promise<Buffer> {
    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.text('BERITA ACARA HASIL INVESTIGASI', 105, y, { align: 'center' });
    y += 20;

    // Basic info
    doc.setFontSize(12);
    doc.text(`ID: ${result.id}`, 20, y);
    y += 10;
    doc.text(`Judul: ${result.schedulingTitle || '-'}`, 20, y);
    y += 10;
    doc.text(`Tanggal: ${new Date(result.createdAt).toLocaleDateString('id-ID')}`, 20, y);
    y += 15;

    // Content sections
    await this.addResultContent(doc, result, y);

    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Generate process PDF
   */
  private async generateProcessPDF(processData: any): Promise<Buffer> {
    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(16);
    doc.text('PROSES INVESTIGASI', 105, y, { align: 'center' });
    y += 20;

    // Content
    doc.setFontSize(12);
    const content = this.buildProcessReportText(processData);
    const lines = doc.splitTextToSize(content, 170);
    doc.text(lines, 20, y);

    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Add report content to PDF
   */
  private async addReportContent(doc: jsPDF, report: any, startY: number): Promise<number> {
    let y = startY;

    // Sections
    doc.setFontSize(14);
    doc.text('INFORMASI LAPORAN', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Judul: ${report.title}`, 20, y);
    y += 8;
    doc.text(`Status: ${report.status}`, 20, y);
    y += 15;

    // Description
    doc.setFontSize(14);
    doc.text('DESKRIPSI KEJADIAN', 20, y);
    y += 10;

    doc.setFontSize(12);
    const descLines = doc.splitTextToSize(report.description, 170);
    doc.text(descLines, 20, y);
    y += descLines.length * 5 + 10;

    return y;
  }

  /**
   * Add result content to PDF
   */
  private async addResultContent(doc: jsPDF, result: any, startY: number): Promise<number> {
    let y = startY;

    // Investigation notes
    doc.setFontSize(14);
    doc.text('CATATAN INVESTIGASI', 20, y);
    y += 10;

    doc.setFontSize(12);
    if (result.partiesStatementSummary) {
      const statementLines = doc.splitTextToSize(result.partiesStatementSummary, 170);
      doc.text(statementLines, 20, y);
      y += statementLines.length * 5 + 10;
    }

    // Recommendations
    if (result.recommendedImmediateActions && result.recommendedImmediateActions.length > 0) {
      doc.setFontSize(14);
      doc.text('REKOMENDASI', 20, y);
      y += 10;

      doc.setFontSize(12);
      doc.text(`Jumlah rekomendasi: ${result.recommendedImmediateActions.length}`, 20, y);
      y += 15;
    }

    return y;
  }

  /**
   * Build process report text
   */
  private buildProcessReportText(processData: any): string {
    const data = processData.data || {};
    
    return `
PROSES INVESTIGASI
==================

Tanggal: ${new Date(processData.savedAt).toLocaleDateString('id-ID')}
Lokasi: ${data.location || 'Tidak ditentukan'}
Metode: ${data.methods ? data.methods.join(', ') : 'Tidak ada'}

CATATAN:
${data.planSummary || 'Tidak ada catatan'}

TINDAK LANJUT:
${data.followUpAction || 'Tidak ada'}
    `.trim();
  }

  /**
   * Memory management
   */
  private cleanupMemory(): void {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [id, info] of activePDFGenerations.entries()) {
      if (now - info.timestamp > timeout) {
        console.log(`[PDF Memory] Cleaning up stale generation: ${id}`);
        activePDFGenerations.delete(id);
      }
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Wait for memory cleanup
   */
  private async waitForMemoryCleanup(): Promise<void> {
    console.log('[PDF Queue] Waiting for memory cleanup...');
    await this.delay(2000); // Wait 2 seconds
    
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > MAX_MEMORY_PER_PDF * MAX_CONCURRENT_PDF) {
      throw new Error('Memory usage too high for PDF generation');
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue status
   */
  public getQueueStatus(): any {
    return {
      queueLength: this.generationQueue.length,
      isProcessing: this.isProcessing,
      activeGenerations: Array.from(activePDFGenerations.entries()).map(([id, info]) => ({
        id,
        type: info.type,
        duration: Date.now() - info.timestamp,
        memoryUsed: Math.round(info.heapUsed / 1024 / 1024)
      }))
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.memoryCleanupInterval) {
      clearInterval(this.memoryCleanupInterval);
    }
    activePDFGenerations.clear();
    this.generationQueue.length = 0;
  }
}

// Export singleton instance
export const pdfService = UnifiedPDFService.getInstance();