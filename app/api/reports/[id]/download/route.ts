import { NextRequest } from "next/server";
import { reportService } from "@/lib/services/reports/report-service";
import jsPDF from "jspdf";
import fs from "fs";
import path from "path";
import { generateSignedUrl } from "@/lib/utils/file-upload";

export const runtime = "nodejs";

// Helper function to load image data for PDF inclusion
async function loadImageForPDF(storagePath: string, fileType: string): Promise<{ data: string; format: string } | null> {
  try {
    let imageBuffer: Buffer;

    if (storagePath.startsWith('/uploads/')) {
      // Local storage - read from public directory
      const filePath = path.join(process.cwd(), 'public', storagePath);
      if (!fs.existsSync(filePath)) {
        console.warn(`Image file not found: ${filePath}`);
        return null;
      }
      imageBuffer = fs.readFileSync(filePath);
    } else if (storagePath.startsWith('evidence/')) {
      // S3 storage - fetch via signed URL
      const signedUrl = await generateSignedUrl(storagePath);
      const response = await fetch(signedUrl);
      if (!response.ok) {
        console.warn(`Failed to fetch image from S3: ${storagePath}`);
        return null;
      }
      imageBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      console.warn(`Unsupported storage path format: ${storagePath}`);
      return null;
    }

    // Convert to base64 for jsPDF
    const base64Data = imageBuffer.toString('base64');

    // Determine format based on fileType
    let format = 'JPEG'; // default
    if (fileType.includes('png')) {
      format = 'PNG';
    } else if (fileType.includes('webp')) {
      format = 'WEBP';
    }
    return { data: base64Data, format };
  } catch (error) {
    console.error(`Error loading image ${storagePath}:`, error);
    return null;
  }
}

// GET /api/reports/[id]/download - Download report as PDF file
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

    console.log("Downloading report with ID:", reportId);
    const report = await reportService.getReportById(reportId);
    console.log("Report found:", !!report);

    if (!report) {
      return Response.json(
        { success: false, message: "Laporan tidak ditemukan" },
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
      console.log("Starting PDF generation with jsPDF...");
      // Create PDF document
      const doc = new jsPDF();
      console.log("jsPDF document created");

      let y = 20; // Start position from top

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
      // Split description into lines
      const descLines = doc.splitTextToSize(report.description, 170);
      doc.text(descLines, 20, y);
      y += descLines.length * 5 + 10;

      // Incident details
      doc.setFontSize(14);
      doc.text('DETAIL KEJADIAN', 20, y);
      y += 10;

      doc.setFontSize(12);
      if (report.incidentDate) {
        doc.text(`Tanggal Kejadian: ${new Date(report.incidentDate).toLocaleDateString('id-ID')}`, 20, y);
        y += 8;
      }
      if (report.incidentLocation) {
        doc.text(`Lokasi Kejadian: ${report.incidentLocation}`, 20, y);
        y += 10;
      }

      // Reporter info
      doc.setFontSize(14);
      doc.text('INFORMASI PELAPOR', 20, y);
      y += 10;

      doc.setFontSize(12);
      doc.text(`Nama: ${report.reporter?.name || 'N/A'}`, 20, y);
      y += 8;
      doc.text(`Email: ${report.reporter?.email || report.reporterEmail || 'N/A'}`, 20, y);
      y += 10;

      // Decision notes
      if (report.decisionNotes) {
        doc.setFontSize(14);
        doc.text('CATATAN KEPUTUSAN', 20, y);
        y += 10;

        doc.setFontSize(12);
        const decisionLines = doc.splitTextToSize(report.decisionNotes, 170);
        doc.text(decisionLines, 20, y);
        y += decisionLines.length * 5 + 10;
      }

      // Recommendation
      if (report.recommendation) {
        doc.setFontSize(14);
        doc.text('REKOMENDASI', 20, y);
        y += 10;

        doc.setFontSize(12);
        const recLines = doc.splitTextToSize(report.recommendation, 170);
        doc.text(recLines, 20, y);
        y += recLines.length * 5 + 10;
      }

      // Evidence Images
      if (report.documents && report.documents.length > 0) {
        const imageDocuments = report.documents.filter(doc =>
          doc.documentType === 'EVIDENCE' && doc.fileType.startsWith('image/')
        );

        if (imageDocuments.length > 0) {
          doc.setFontSize(14);
          doc.text('BUKTI GAMBAR', 20, y);
          y += 10;

          doc.setFontSize(12);
          doc.text(`Ditemukan ${imageDocuments.length} gambar bukti:`, 20, y);
          y += 10;

          for (const imageDoc of imageDocuments) {
            try {
              const imageData = await loadImageForPDF(imageDoc.storagePath, imageDoc.fileType);
              if (imageData) {
                // Check if we need a new page
                if (y > 200) {
                  doc.addPage();
                  y = 20;
                }

                // Add image filename
                doc.setFontSize(10);
                doc.text(`File: ${imageDoc.fileName}`, 20, y);
                y += 8;

                // Add image (resize to fit page width)
                const imgWidth = 170; // Max width
                const imgHeight = 100; // Max height
                doc.addImage(`data:image/${imageData.format.toLowerCase()};base64,${imageData.data}`, imageData.format, 20, y, imgWidth, imgHeight);
                y += imgHeight + 15;

                // Add description if available
                if (imageDoc.description) {
                  doc.setFontSize(10);
                  const descLines = doc.splitTextToSize(`Deskripsi: ${imageDoc.description}`, 170);
                  doc.text(descLines, 20, y);
                  y += descLines.length * 4 + 10;
                }
              } else {
                // Image failed to load
                doc.setFontSize(10);
                doc.text(`[Gambar tidak dapat dimuat: ${imageDoc.fileName}]`, 20, y);
                y += 8;
              }
            } catch (imageError) {
              console.error(`Error adding image ${imageDoc.fileName} to PDF:`, imageError);
              doc.setFontSize(10);
              doc.text(`[Error memuat gambar: ${imageDoc.fileName}]`, 20, y);
              y += 8;
            }
          }
        }
      }

      // Footer
      doc.setFontSize(10);
      doc.text(`Laporan ini dihasilkan pada: ${new Date().toLocaleString('id-ID')}`, 105, 280, { align: 'center' });

      console.log("PDF content added successfully");

      // Get PDF as buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      console.log("PDF generated, buffer length:", pdfBuffer.length);

    // Return as downloadable PDF file
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laporan-${report.reportNumber}.pdf"`,
      },
    });
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      console.error("Error stack:", pdfError instanceof Error ? pdfError.stack : 'No stack trace');
      // Fallback to text response
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

      return new Response(reportContent, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="laporan-${report.reportNumber}.txt"`,
        },
      });
    }
  } catch (error) {
    console.error("Error downloading report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengunduh laporan" },
      { status: 500 }
    );
  }
}