import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";
import fs from 'fs';
import path from 'path';

export const runtime = "nodejs";

// GET /api/reports/[id]/evidence-files/[fileId]/download - Download evidence file for a report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS', 'REKTOR'])) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, fileId } = await params;

    if (!id || !fileId) {
      return Response.json(
        { success: false, message: "Report ID and File ID are required" },
        { status: 400 }
      );
    }

    // Get the report and evidence file
    const report = await db.report.findUnique({
      where: { id },
      include: {
        documents: {
          where: { id: fileId }
        }
      }
    });

    if (!report) {
      return Response.json(
        { success: false, message: "Report tidak ditemukan" },
        { status: 404 }
      );
    }

    // Find the evidence file
    const evidenceFile = report.documents.find((doc: any) => doc.id === fileId);

    if (!evidenceFile) {
      return Response.json(
        { success: false, message: "File bukti tidak ditemukan" },
        { status: 404 }
      );
    }

    // Handle different storage types
    if (evidenceFile.storagePath.startsWith('http')) {
      // If it's a URL (S3 or external storage), redirect to it
      return Response.redirect(evidenceFile.storagePath, 302);
    } else {
      // Handle local file storage
      const filePath = path.join(process.cwd(), evidenceFile.storagePath.startsWith('/') 
        ? evidenceFile.storagePath.substring(1) // Remove leading slash
        : evidenceFile.storagePath);

      if (!fs.existsSync(filePath)) {
        return Response.json(
          { success: false, message: "File tidak ditemukan di storage" },
          { status: 404 }
        );
      }

      // Get file content
      const fileBuffer = fs.readFileSync(filePath);

      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', evidenceFile.fileType);
      headers.set('Content-Length', evidenceFile.fileSize.toString());
      headers.set('Content-Disposition', `attachment; filename="${evidenceFile.fileName}"`);

      return new Response(fileBuffer, {
        status: 200,
        headers
      });
    }
  } catch (error) {
    console.error("Error downloading evidence file:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengunduh file bukti" },
      { status: 500 }
    );
  }
}