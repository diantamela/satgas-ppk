import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";
import fs from 'fs';
import path from 'path';

export const runtime = "nodejs";

// GET /api/debug/check-document/[id] - Debug document existence
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

    // Check if document exists
    const document = await db.investigationDocument.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { name: true, email: true }
        },
        report: {
          select: { 
            reportNumber: true,
            title: true,
            status: true
          }
        }
      }
    });

    if (!document) {
      return Response.json({
        success: false,
        message: "Document tidak ditemukan",
        documentId: id,
        exists: false
      }, { status: 404 });
    }

    // Check if file exists on disk
    let fileExists = false;
    let fileExistsStatus = 'unknown';
    
    if (document.storagePath.startsWith('http')) {
      fileExistsStatus = 'external_url';
    } else {
      const filePath = path.join(
        process.cwd(), 
        document.storagePath.startsWith('/') 
          ? document.storagePath.substring(1) 
          : document.storagePath
      );
      fileExists = fs.existsSync(filePath);
      fileExistsStatus = fileExists ? 'exists' : 'not_found';
    }

    return Response.json({
      success: true,
      message: "Document ditemukan",
      document: {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        storagePath: document.storagePath,
        documentType: document.documentType,
        uploadedBy: document.uploadedBy,
        report: document.report,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      },
      exists: true,
      fileExists: fileExists,
      fileExistsStatus: fileExistsStatus
    });

  } catch (error) {
    console.error("Error checking document:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat memeriksa document", error: errorMessage },
      { status: 500 }
    );
  }
}