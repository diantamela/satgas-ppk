import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface PDFSection {
  title: string;
  content: string | string[];
  type?: 'paragraph' | 'list' | 'table' | 'signature';
  priority?: 'high' | 'normal' | 'low';
}

export interface PDFOptions {
  title?: string;
  subtitle?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  header?: {
    text: string;
    fontSize?: number;
    color?: any;
  };
  footer?: {
    text: string;
    fontSize?: number;
    color?: any;
    includePageNumbers?: boolean;
  };
}

export class EnhancedPDFGenerator {
  private pdfDoc: PDFDocument;
  private currentPage: any;
  private pages: any[] = [];
  private yPosition: number = 0;
  private pageWidth: number = 595.28; // A4 width
  private pageHeight: number = 841.89; // A4 height
  private margins = { top: 50, bottom: 50, left: 50, right: 50 };
  private font: any;
  private fontBold: any;
  private fontItalic: any;
  private currentPageNumber = 1;

  constructor(options: PDFOptions = {}) {
    this.pdfDoc = null as any;
    this.font = null;
    this.fontBold = null;
    this.fontItalic = null;
    
    if (options.margins) {
      this.margins = { ...this.margins, ...options.margins };
    }
  }

  async initialize(): Promise<void> {
    this.pdfDoc = await PDFDocument.create();
    
    // Load fonts - use standard fonts that support Indonesian characters
    try {
      this.font = await this.pdfDoc.embedFont(StandardFonts.TimesRoman);
      this.fontBold = await this.pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      this.fontItalic = await this.pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    } catch (error) {
      console.warn("Failed to load Times fonts, falling back to Helvetica:", error);
      this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
      this.fontBold = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
      this.fontItalic = await this.pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    }
    
    // Create first page
    this.addPage();
  }

  addPage(): void {
    this.currentPage = this.pdfDoc.addPage([this.pageWidth, this.pageHeight]);
    this.pages.push(this.currentPage);
    this.yPosition = this.pageHeight - this.margins.top;
  }

  private getCurrentPage(): any {
    return this.pages[this.pages.length - 1] || this.currentPage;
  }

  private addNewPageIfNeeded(requiredHeight: number = 30): void {
    if (this.yPosition - requiredHeight < this.margins.bottom) {
      this.addPage();
      this.addHeader();
      this.addFooter();
      this.yPosition = this.pageHeight - this.margins.top - 30; // Account for header
    }
  }

  private addHeader(): void {
    if (!this.currentPage) return;
    
    const headerText = "BERITA ACARA HASIL INVESTIGASI";
    const page = this.getCurrentPage();
    
    page.drawText(headerText, {
      x: this.margins.left,
      y: this.pageHeight - 25,
      size: 10,
      font: this.fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  private addFooter(): void {
    const page = this.getCurrentPage();
    const footerY = this.margins.bottom - 20;
    
    // Page number
    const pageText = `Halaman ${this.currentPageNumber}`;
    page.drawText(pageText, {
      x: this.pageWidth - this.margins.right - 50,
      y: footerY,
      size: 8,
      font: this.font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    this.currentPageNumber++;
  }

  private addTextBlock(
    text: string,
    options: {
      fontSize?: number;
      isBold?: boolean;
      color?: any;
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
    } = {}
  ): void {
    if (!text || typeof text !== 'string') {
      text = '-';
    }

    const {
      fontSize = 10,
      isBold = false,
      color = rgb(0, 0, 0),
      align = 'left',
      maxWidth = this.pageWidth - this.margins.left - this.margins.right
    } = options;

    const font = isBold ? this.fontBold : this.font;
    if (!font) {
      throw new Error("Font not available for text rendering");
    }

    const lines = this.wrapText(text, maxWidth, fontSize);
    
    for (const line of lines) {
      this.addNewPageIfNeeded(fontSize + 10);
      
      let x = this.margins.left;
      if (align === 'center') {
        const textWidth = font.widthOfTextAtSize(line, fontSize);
        x = (this.pageWidth - textWidth) / 2;
      } else if (align === 'right') {
        const textWidth = font.widthOfTextAtSize(line, fontSize);
        x = this.pageWidth - this.margins.right - textWidth;
      }

      try {
        this.getCurrentPage().drawText(line, {
          x,
          y: this.yPosition,
          size: fontSize,
          font,
          color,
        });
      } catch (error) {
        console.warn(`Error rendering text: ${line.substring(0, 50)}...`, error);
        continue;
      }
      
      this.yPosition -= fontSize + 8;
    }
    
    this.yPosition -= 5; // Extra space after text block
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = this.font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  addTitle(title: string, subtitle?: string): void {
    // Main title
    this.addTextBlock(title, {
      fontSize: 18,
      isBold: true,
      align: 'center',
      color: rgb(0.1, 0.1, 0.1),
    });
    
    // Subtitle
    if (subtitle) {
      this.addTextBlock(subtitle, {
        fontSize: 12,
        isBold: false,
        align: 'center',
        color: rgb(0.4, 0.4, 0.4),
      });
    }
    
    // Divider
    this.addSeparator();
    this.yPosition -= 10;
  }

  addSection(section: PDFSection): void {
    if (section.title) {
      // Section title with better styling
      this.addTextBlock(section.title, {
        fontSize: 14,
        isBold: true,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      // Underline effect
      this.addSeparator();
      this.yPosition -= 5;
    }

    if (section.content) {
      if (Array.isArray(section.content)) {
        // Handle list items
        for (const item of section.content) {
          this.addTextBlock(`• ${item}`, {
            fontSize: 10,
            isBold: false,
            color: rgb(0, 0, 0),
          });
        }
      } else {
        // Handle regular content
        this.addTextBlock(section.content, {
          fontSize: 10,
          isBold: false,
          color: rgb(0, 0, 0),
        });
      }
    }
    
    this.yPosition -= 8;
  }

  addSeparator(): void {
    this.addNewPageIfNeeded(20);
    
    const page = this.getCurrentPage();
    const lineY = this.yPosition - 5;
    
    page.drawLine({
      start: { x: this.margins.left, y: lineY },
      end: { x: this.pageWidth - this.margins.right, y: lineY },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
  }

  addSignatureSection(signatures: {
    creator?: { name: string; date: string; signature: boolean };
    chairperson?: { name: string; date: string; signature: boolean };
  }): void {
    this.addSection({
      title: "OTENTIKASI BERITA ACARA",
      content: "",
    });

    if (signatures.creator) {
      this.addSection({
        title: "Tanda Tangan Pembuat:",
        content: `Nama: ${signatures.creator.name}\nTanggal: ${signatures.creator.date}\nStatus: ${signatures.creator.signature ? 'Tertandatangani' : 'Belum ditandatangani'}`,
      });
    }

    if (signatures.chairperson) {
      this.addSection({
        title: "Tanda Tangan Ketua:",
        content: `Nama: ${signatures.chairperson.name}\nTanggal: ${signatures.chairperson.date}\nStatus: ${signatures.chairperson.signature ? 'Tertandatangani' : 'Belum ditandatangani'}`,
      });
    }
  }

  addFooterInfo(): void {
    this.addSeparator();
    this.yPosition -= 15;
    
    this.addTextBlock("DOKUMEN RESMI - BERITA ACARA HASIL INVESTIGASI", {
      fontSize: 10,
      isBold: true,
      align: 'center',
      color: rgb(0.1, 0.1, 0.1),
    });
    
    this.addTextBlock("Dokumen ini dibuat secara digital dan memiliki hash untuk memastikan integritas.", {
      fontSize: 8,
      isBold: false,
      align: 'center',
      color: rgb(0.4, 0.4, 0.4),
    });
    
    const now = new Date();
    this.addTextBlock(`Dibuat pada: ${now.toLocaleString("id-ID")}`, {
      fontSize: 8,
      isBold: false,
      align: 'center',
      color: rgb(0.4, 0.4, 0.4),
    });
    
    this.addTextBlock("Dibuat oleh: Sistem Informasi Penanganan Kasus Penganiayaan Seksual", {
      fontSize: 8,
      isBold: false,
      align: 'center',
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  async save(): Promise<ArrayBuffer> {
    if (!this.pdfDoc) {
      throw new Error("PDF document not initialized");
    }

    try {
      const pdfBytes = await this.pdfDoc.save();
      if (!pdfBytes || pdfBytes.length === 0) {
        throw new Error("PDF generation resulted in empty output");
      }
      
      const buffer = Buffer.from(pdfBytes).buffer;
      console.log(`Enhanced PDF generated successfully, size: ${buffer.byteLength} bytes`);
      
      return buffer;
    } catch (error) {
      console.error("Error saving enhanced PDF:", error);
      throw new Error(`Failed to save enhanced PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Utility functions for data formatting
export const formatDate = (date: Date | string | null) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("id-ID");
};

export const formatDateTime = (date: Date | string | null) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleString("id-ID");
};

export const formatStatus = (status: string) => {
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

export const formatPriority = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'HIGH': 'Tinggi',
    'MEDIUM': 'Sedang',
    'LOW': 'Rendah'
  };
  return priorityMap[priority] || priority || 'N/A';
};

export const formatRecommendedActions = (actions: any[]) => {
  if (!actions || actions.length === 0) return ["-"];
  
  try {
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
      const actionName = actionMap[action?.action] || action?.action || 'Tindakan Tidak Diknown';
      const priority = formatPriority(action?.priority);
      const notes = action?.notes ? ` - Catatan: ${String(action.notes).substring(0, 200)}` : '';
      return `${index + 1}. ${actionName} (Prioritas: ${priority})${notes}`;
    });
  } catch (error) {
    console.warn("Error formatting recommended actions:", error);
    return ["Error formatting recommended actions"];
  }
};

export const formatPartiesPresent = (parties: any[]) => {
  if (!parties || parties.length === 0) return ["-"];
  
  try {
    return parties.map((party: any, index: number) => {
      const statusMap: Record<string, string> = {
        'PRESENT': '✓ Hadir',
        'ABSENT_NO_REASON': '✗ Tidak Hadir Tanpa Keterangan',
        'ABSENT_WITH_REASON': '✗ Tidak Hadir dengan Alasan'
      };
      const name = String(party?.name || 'N/A').substring(0, 100);
      const role = String(party?.role || 'N/A').substring(0, 100);
      const status = statusMap[party?.status] || party?.status || 'Status Tidak Diknown';
      return `${index + 1}. ${name} - ${role} (${status})`;
    });
  } catch (error) {
    console.warn("Error formatting parties present:", error);
    return ["Error formatting parties present"];
  }
};

export const formatSatgasMembers = (members: any[]) => {
  if (!members || members.length === 0) return ["-"];
  
  try {
    return members.map((member: any, index: number) => {
      const name = String(member?.name || 'N/A').substring(0, 100);
      const role = String(member?.role || 'N/A').substring(0, 100);
      return `${index + 1}. ${name} - ${role}`;
    });
  } catch (error) {
    console.warn("Error formatting satgas members:", error);
    return ["Error formatting satgas members"];
  }
};

export const formatEvidenceFiles = (files: any[]) => {
  if (!files || files.length === 0) return ["-"];
  
  try {
    return files.map((file: any, index: number) => {
      const name = String(file?.name || 'N/A').substring(0, 100);
      const type = String(file?.type || 'N/A').substring(0, 50);
      const sizeKB = file?.size ? (Number(file.size) / 1024).toFixed(1) : 'N/A';
      return `${index + 1}. ${name} (${sizeKB} KB - ${type})`;
    });
  } catch (error) {
    console.warn("Error formatting evidence files:", error);
    return ["Error formatting evidence files"];
  }
};