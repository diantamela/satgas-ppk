import { NextRequest } from "next/server";
import { reportService, investigationDocumentService } from "@/lib/services/reports/report-service";
import { processEvidenceUploads } from "@/lib/utils/file-upload";
import { checkAuth } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/reports - Create a new report
export async function POST(request: NextRequest) {
  try {
    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    const body = await request.json();

    // Create report using the service
    const newReport = await reportService.createReport({
      title: body.title,
      description: body.description,
      incidentDate: body.incidentDate ? new Date(body.incidentDate) : null,
      incidentLocation: body.incidentLocation || null,
      reporterId: body.reporterId,
      reporterEmail: body.reporterEmail,
    });

    // If evidence files are provided, upload them
    let evidenceCount = 0;
    if (body.evidenceFiles && Array.isArray(body.evidenceFiles) && body.evidenceFiles.length > 0) {
      try {
        // Convert base64 files to File objects and upload
        for (const fileData of body.evidenceFiles) {
          if (fileData.base64 && fileData.name && fileData.type) {
            // Convert base64 to buffer
            const base64Data = fileData.base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            const buffer = Buffer.from(base64Data, 'base64');

            // Upload file to storage
            const { uploadFileToStorage, saveLocalFile } = await import('@/lib/utils/file-upload');
            let filePath: string;

            if (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
              filePath = await uploadFileToStorage(buffer, `${newReport.id}-${fileData.name}`, fileData.type);
            } else {
              filePath = await saveLocalFile(buffer, fileData.name, 'public/uploads/evidence');
            }

            // Save document record in database
            await investigationDocumentService.createDocument({
              reportId: newReport.id,
              fileName: fileData.name,
              fileType: fileData.type,
              fileSize: fileData.size,
              storagePath: filePath,
              documentType: 'EVIDENCE',
              uploadedById: body.reporterId,
              description: 'Bukti dari pelapor',
            });

            evidenceCount++;
          }
        }

        // Update report with evidence count
        if (evidenceCount > 0) {
          await reportService.updateReport(newReport.id, { evidenceCount });
        }
      } catch (evidenceError) {
        console.error("Error uploading evidence:", evidenceError);
        // Don't fail the entire request if evidence upload fails
      }
    }

    return Response.json({
      success: true,
      report: newReport,
      message: "Laporan berhasil dikirim",
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengirim laporan" },
      { status: 500 }
    );
  }
}

// GET /api/reports - Get reports with optional filters
export async function GET(request: NextRequest) {
  try {
    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    const { searchParams } = new URL(request.url);
    const reporterId = searchParams.get('reporterId');
    const reportNumber = searchParams.get('reportNumber');

    let filters: any = {};
    if (reporterId) {
      filters.reporterId = reporterId;
    }

    // If reportNumber is provided, get specific report by number
    if (reportNumber) {
      const report = await reportService.getReportByNumber(reportNumber);
      return Response.json({
        success: true,
        reports: report ? [report] : [],
      });
    }

    const reports = await reportService.getAllReports(filters);

    return Response.json({
      success: true,
      reports: reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil laporan" },
      { status: 500 }
    );
  }
}