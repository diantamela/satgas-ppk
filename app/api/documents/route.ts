import { NextRequest, NextResponse } from "next/server";
import { investigationDocumentService } from "@/lib/services/reports/report-service";
import { prisma } from "@/lib/database/prisma";
import crypto from "crypto";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export const runtime = "nodejs";

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

// POST /api/documents - Create a new investigation document
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }

    // Check if it's FormData or JSON
    const contentType = request.headers.get('content-type') || '';

    let reportId: string;
    let fileName: string;
    let fileType: string;
    let fileSize: number;
    let storagePath: string;
    let documentType: string;
    let description: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      const formData = await request.formData();
      reportId = formData.get("reportId") as string;
      fileName = formData.get("fileName") as string;
      fileType = formData.get("fileType") as string;
      fileSize = parseInt(formData.get("fileSize") as string);
      storagePath = formData.get("storagePath") as string;
      documentType = formData.get("documentType") as string;
      description = formData.get("description") as string || undefined;
    } else {
      // Handle JSON
      const body = await request.json();
      reportId = body.reportId;
      fileName = body.fileName;
      fileType = body.fileType;
      fileSize = body.fileSize;
      storagePath = body.storagePath;
      documentType = body.documentType;
      description = body.description;
    }

    if (!reportId || !fileName || !fileType || !fileSize || !storagePath || !documentType) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }

    const document = await investigationDocumentService.createDocument({
      reportId,
      fileName,
      fileType,
      fileSize,
      storagePath,
      documentType: documentType as any,
      uploadedById: user.id,
      description
    });

    return NextResponse.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}

// GET /api/documents - Get documents (for admin/satgas users)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    const documentType = searchParams.get("documentType");

    const filters: any = {};
    if (reportId) filters.reportId = reportId;
    if (documentType) filters.documentType = documentType;

    const documents = await investigationDocumentService.getAllDocuments(filters);

    return NextResponse.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}
