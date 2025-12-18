import { NextRequest } from "next/server";
import { db } from "@/db";
import { DownloadService, type FileInfo } from "@/lib/services/download-service";

export const runtime = "nodejs";

// GET /api/reports/[id]/evidence-files/[fileId]/download - Download evidence file for a report using standardized service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id: reportId, fileId } = await params;

  if (!reportId || !fileId) {
    return DownloadService.formatErrorResponse({
      code: 400,
      message: "Report ID and File ID are required"
    });
  }

  // Create a handler that retrieves evidence file info and downloads it
  const handler = DownloadService.createDownloadHandler<FileInfo>(
    async (params: { id: string; fileId: string }) => {
      console.log(`[EVIDENCE DOWNLOAD] Attempting to download evidence file ID: ${params.fileId} for report: ${params.id}`);

      // Get the report and evidence file
      const report = await db.report.findUnique({
        where: { id: params.id },
        include: {
          reporter: {
            select: { name: true }
          },
          documents: {
            where: { id: params.fileId }
          }
        }
      });

      if (!report) {
        console.log(`[EVIDENCE DOWNLOAD] Report not found for ID: ${params.id}`);
        return null;
      }

      // Find the evidence file
      const evidenceFile = report.documents.find((doc: any) => doc.id === params.fileId);

      if (!evidenceFile) {
        console.log(`[EVIDENCE DOWNLOAD] Evidence file not found for ID: ${params.fileId}`);
        return null;
      }

      console.log(`[EVIDENCE DOWNLOAD] Found evidence file: ${evidenceFile.fileName}, storagePath: ${evidenceFile.storagePath}`);

      // Convert to FileInfo format
      const fileInfo: FileInfo = {
        id: evidenceFile.id,
        fileName: evidenceFile.fileName,
        fileType: evidenceFile.fileType || 'application/octet-stream',
        fileSize: evidenceFile.fileSize,
        storagePath: evidenceFile.storagePath || '',
        uploadedBy: {
          name: report.reporter?.name || 'Unknown'
        },
        metadata: {
          documentType: evidenceFile.documentType,
          uploadedAt: evidenceFile.createdAt,
          reportNumber: report.reportNumber,
          reportTitle: report.title
        }
      };

      return fileInfo;
    },
    {
      allowedRoles: ['SATGAS', 'REKTOR'],
      maxFileSize: 50 * 1024 * 1024, // 50MB
      requireAuth: true
    }
  );

  return handler(request, { id: reportId, fileId });
}