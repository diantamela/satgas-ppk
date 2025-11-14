import { NextRequest, NextResponse } from "next/server";
import { investigationDocumentService } from "@/lib/services/reports/report-service";
import { prisma } from "@/lib/database/prisma";
import crypto from "crypto";

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

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Check if document exists and user has permission to delete it
    const document = await investigationDocumentService.getDocumentById(documentId);
    if (!document) {
      return NextResponse.json({
        success: false,
        message: "Document not found"
      }, { status: 404 });
    }

    // Only the uploader or SATGAS/REKTOR can delete
    if (document.uploadedById !== user.id && !['SATGAS', 'REKTOR'].includes(user.role)) {
      return NextResponse.json({
        success: false,
        message: "Forbidden"
      }, { status: 403 });
    }

    await investigationDocumentService.deleteDocument(documentId);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}

// GET /api/documents/[id] - Get a specific document (for download/view)
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

    return NextResponse.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}