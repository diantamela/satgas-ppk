import { NextRequest } from "next/server";
import { db } from "@/db";
import { DownloadService, type FileInfo } from "@/lib/services/download-service";

export const runtime = "nodejs";

// GET /api/documents/[id]/download - Download investigation document using standardized service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return DownloadService.formatErrorResponse({
      code: 400,
      message: "Document ID is required"
    });
  }

  // Create a handler that retrieves document info and downloads it
  const handler = DownloadService.createDownloadHandler<FileInfo>(
    async (params: { id: string }) => {
      console.log(`[DOCUMENT DOWNLOAD] Attempting to download document ID: ${params.id}`);

      // Get the document from database
      const document = await db.investigationDocument.findUnique({
        where: { id: params.id },
        include: {
          uploadedBy: {
            select: { name: true }
          },
          report: {
            select: {
              reportNumber: true,
              title: true
            }
          }
        }
      });

      if (!document) {
        console.log(`[DOCUMENT DOWNLOAD] Document not found in database for ID: ${params.id}`);
        
        // Try to find if this might be a legacy ID or alternative reference
        const legacyDocument = await db.investigationDocument.findFirst({
          where: {
            OR: [
              { id: { contains: params.id } },
              { fileName: { contains: params.id } }
            ]
          }
        });

        if (legacyDocument) {
          console.log(`[DOCUMENT DOWNLOAD] Found potential match with ID: ${legacyDocument.id}`);
          return null; // Return null to trigger 404 with helpful message
        }

        return null;
      }

      console.log(`[DOCUMENT DOWNLOAD] Found document: ${document.fileName}, storagePath: ${document.storagePath}`);

      // Convert to FileInfo format
      const fileInfo: FileInfo = {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType || 'application/octet-stream',
        fileSize: document.fileSize,
        storagePath: document.storagePath || '',
        uploadedBy: {
          name: document.uploadedBy?.name || 'Unknown'
        },
        metadata: {
          documentType: document.documentType,
          uploadedAt: document.createdAt,
          reportNumber: document.report?.reportNumber,
          reportTitle: document.report?.title
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

  return handler(request, { id });
}