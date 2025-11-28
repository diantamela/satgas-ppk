import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { reportNumber, processIndex, createdAt, data, attachments } = await request.json();

    // Create new PDF document
    const doc = new jsPDF();

    // Set font
    doc.setFont('helvetica');

    // Title
    doc.setFontSize(16);
    doc.text('LAPORAN PROSES INVESTIGASI', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Laporan ID: ${reportNumber}`, 20, 35);
    doc.text(`Proses #: ${processIndex}`, 20, 45);
    doc.text(`Tanggal Dibuat: ${new Date(createdAt).toLocaleString('id-ID')}`, 20, 55);

    let yPosition = 70;

    // Basic Information
    doc.setFontSize(14);
    doc.text('INFORMASI DASAR:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Lokasi: ${data.location || 'Tidak ditentukan'}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Tanggal Mulai: ${data.startDateTime ? new Date(data.startDateTime).toLocaleString('id-ID') : 'Tidak ditentukan'}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Tanggal Selesai: ${data.endDateTime ? new Date(data.endDateTime).toLocaleString('id-ID') : 'Tidak ditentukan'}`, 30, yPosition);
    yPosition += 15;

    // Methods
    if (data.methods && data.methods.length > 0) {
      doc.setFontSize(14);
      doc.text('METODE YANG DIGUNAKAN:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      data.methods.forEach((method: string) => {
        const methodLabels: Record<string, string> = {
          INTERVIEW: "Wawancara",
          WRITTEN_CLARIFICATION: "Klarifikasi Tertulis",
          LOCATION_OBSERVATION: "Observasi Lokasi",
          DIGITAL_EVIDENCE_COLLECTION: "Pengumpulan Bukti Digital",
          MEDIATION: "Mediasi",
          OTHER: "Lainnya",
        };
        doc.text(`- ${methodLabels[method] ?? method}`, 30, yPosition);
        yPosition += 8;
      });
      yPosition += 5;
    }

    // Team Members
    if (data.teamMembers && data.teamMembers.length > 0) {
      doc.setFontSize(14);
      doc.text('TIM INVESTIGASI:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      data.teamMembers.forEach((member: any, idx: number) => {
        const roleLabels: Record<string, string> = {
          TEAM_LEADER: "Ketua Tim",
          NOTE_TAKER: "Pencatat",
          PSYCHOLOGICAL_SUPPORT: "Pendamping Psikologis",
          LEGAL_SUPPORT: "Pendamping Hukum",
          INVESTIGATOR: "Investigator",
          OTHER: "Lainnya",
        };
        const role = member.role === "OTHER"
          ? member.customRole || roleLabels.OTHER
          : roleLabels[member.role] ?? member.role;
        doc.text(`${idx + 1}. ${member.userId || "Anggota"} - ${role}`, 30, yPosition);
        yPosition += 8;
      });
      yPosition += 5;
    }

    // Consent and Security
    doc.setFontSize(14);
    doc.text('PERSYARATAN & KERAHASIAAN:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Informed Consent: ${data.consentObtained ? 'Ya' : 'Tidak'}`, 30, yPosition);
    yPosition += 8;
    if (data.consentDocumentation) {
      doc.text(`Dokumentasi: ${data.consentDocumentation}`, 30, yPosition);
      yPosition += 8;
    }

    // Risk Notes
    if (data.riskNotes) {
      doc.setFontSize(14);
      doc.text('CATATAN RISIKO & KEAMANAN:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const riskLines = doc.splitTextToSize(data.riskNotes, 150);
      doc.text(riskLines, 30, yPosition);
      yPosition += riskLines.length * 5 + 5;
    }

    // Plan Summary
    if (data.planSummary) {
      doc.setFontSize(14);
      doc.text('RINGKASAN RENCANA:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const planLines = doc.splitTextToSize(data.planSummary, 150);
      doc.text(planLines, 30, yPosition);
      yPosition += planLines.length * 5 + 5;
    }

    // Follow-up
    if (data.followUpAction) {
      doc.setFontSize(14);
      doc.text('TINDAK LANJUT:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const followUpLabels: Record<string, string> = {
        CONTINUE: "Lanjut ke Tahap Selanjutnya",
        STOP: "Stop Investigasi",
        FOLLOW_UP: "Perlu Tindak Lanjut",
      };
      doc.text(`- ${followUpLabels[data.followUpAction] ?? data.followUpAction}`, 30, yPosition);
      yPosition += 8;
      if (data.followUpDate) {
        doc.text(`- Tanggal Target: ${new Date(data.followUpDate).toLocaleDateString('id-ID')}`, 30, yPosition);
        yPosition += 8;
      }
      if (data.followUpNotes) {
        doc.text(`- Catatan: ${data.followUpNotes}`, 30, yPosition);
        yPosition += 8;
      }
      yPosition += 5;
    }

    // Access Level
    doc.setFontSize(14);
    doc.text('LEVEL AKSES:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const accessLevelLabels: Record<string, string> = {
      CORE_TEAM_ONLY: "Hanya Tim Inti",
      FULL_SATGAS: "Satgas Penuh",
      LEADERSHIP_ONLY: "Pimpinan Tertentu",
    };
    doc.text(`${accessLevelLabels[data.accessLevel] ?? data.accessLevel ?? "Tidak ditentukan"}`, 30, yPosition);
    yPosition += 15;

    // Check if we need a new page for attachments
    if (attachments && attachments.length > 0 && yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // Attachments/Documents
    if (attachments && attachments.length > 0) {
      doc.setFontSize(14);
      doc.text('DOKUMEN LAMPIRAN:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      attachments.forEach((file: any, idx: number) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(`${idx + 1}. ${file.name}`, 30, yPosition);
        yPosition += 6;
        doc.text(`   Ukuran: ${(file.size / 1024).toFixed(1)} KB | Tipe: ${file.type}`, 30, yPosition);
        yPosition += 8;

        // Try to embed image if it's an image file
        if (file.type && file.type.startsWith('image/') && file.path) {
          try {
            // Check if we need a new page for the image
            if (yPosition > 150) {
              doc.addPage();
              yPosition = 20;
            }

            // For server-side file access, we need to read from the public/uploads directory
            // Assuming files are stored in public/uploads relative to the project root
            const publicDir = path.join(process.cwd(), 'public');
            const filePath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
            const fullPath = path.join(publicDir, filePath);

            if (fs.existsSync(fullPath)) {
              // Read image file
              const imageBuffer = fs.readFileSync(fullPath);
              const base64Image = imageBuffer.toString('base64');

              // Add image to PDF (resize to fit)
              const imgWidth = 80; // Max width
              const imgHeight = 60; // Max height
              const imgX = 30;
              const imgY = yPosition;

              doc.addImage(`data:${file.type};base64,${base64Image}`, file.type.split('/')[1].toUpperCase(), imgX, imgY, imgWidth, imgHeight);
              yPosition += imgHeight + 10;
            } else {
              doc.text(`   [Gambar tidak ditemukan: ${file.name}]`, 30, yPosition);
              yPosition += 8;
            }
          } catch (error) {
            console.error('Error embedding image:', error);
            doc.text(`   [Error loading image: ${file.name}]`, 30, yPosition);
            yPosition += 8;
          }
        } else {
          yPosition += 2;
        }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Dibuat pada: ${new Date().toLocaleString('id-ID')} | Halaman ${i} dari ${pageCount}`, 20, 285);
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proses-investigasi-${reportNumber}-entry-${processIndex}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}