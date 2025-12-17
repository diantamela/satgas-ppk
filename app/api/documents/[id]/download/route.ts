import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";
import fs from 'fs';
import path from 'path';

export const runtime = "nodejs";

// GET /api/documents/[id]/download - Download investigation document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    if (!id) {
      return Response.json(
        { success: false, message: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get the document from database
    const document = await db.investigationDocument.findUnique({
      where: { id },
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
      return Response.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    // Handle different storage types
    if (document.storagePath.startsWith('http')) {
      // If it's a URL (S3 or external storage), redirect to it
      return Response.redirect(document.storagePath, 302);
    } else {
      // Handle local file storage
      const filePath = path.join(process.cwd(), document.storagePath.startsWith('/') 
        ? document.storagePath.substring(1) // Remove leading slash
        : document.storagePath);

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
      headers.set('Content-Type', document.fileType);
      headers.set('Content-Length', document.fileSize.toString());
      headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`);

      return new Response(fileBuffer, {
        status: 200,
        headers
      });
    }
  } catch (error) {
    console.error("Error downloading document:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengunduh file" },
      { status: 500 }
    );
  }
}