import { NextRequest, NextResponse } from "next/server";
import { investigationDocumentService } from "@/lib/services/reports/report-service";
import { generateSignedUrl } from "@/lib/utils/file-upload";
import { prisma } from "@/lib/database/prisma";
import crypto from "crypto";
import fs from 'fs';
import path from 'path';

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

// Helper function to get user from session
async function getUserFromSession(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken) return null;

    const tokenHash = sha256(sessionToken);
    const session = await prisma.session.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    return session?.user || null;
  } catch (error) {
    console.error("Error getting user from session:", error);
    return null;
  }
}

// GET /api/documents/[id]/download - Download or get signed URL for a document
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }

    const resolvedParams = await params;
    const documentId = resolvedParams.id;
    if (!documentId) {
      return NextResponse.json({
        success: false,
        message: "Document ID is required"
      }, { status: 400 });
    }

    const document = await investigationDocumentService.getDocumentById(documentId);
    if (!document) {
      return NextResponse.json({
        success: false,
        message: "Document not found"
      }, { status: 404 });
    }

    // Check if user has permission to access this document
    // Users can access documents they uploaded or if they're SATGAS/REKTOR
    const hasPermission = document.uploadedById === user.id ||
                         ['SATGAS', 'REKTOR'].includes(user.role);

    if (!hasPermission) {
      return NextResponse.json({
        success: false,
        message: "Forbidden"
      }, { status: 403 });
    }

    let downloadUrl: string;

    if (document.storagePath.startsWith('/uploads/')) {
      // Local storage - serve from public directory
      downloadUrl = `${request.nextUrl.origin}${document.storagePath}`;
    } else if (document.storagePath.startsWith('evidence/')) {
      // S3 storage - generate signed URL
      try {
        downloadUrl = await generateSignedUrl(document.storagePath);
      } catch (error) {
        console.error("Error generating signed URL:", error);
        return NextResponse.json({
          success: false,
          message: "Failed to generate download URL"
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: "Unsupported storage path format"
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: downloadUrl,
      fileName: document.fileName
    });
  } catch (error) {
    console.error("Error getting download URL:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}