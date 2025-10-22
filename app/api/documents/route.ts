import { NextRequest } from "next/server";
import { investigationDocumentService } from "@/lib/services/report-service";

export const runtime = "nodejs";

// POST /api/documents - Create a new investigation document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newDocument = await investigationDocumentService.createDocument({
      reportId: body.reportId,
      documentType: body.documentType,
      title: body.title,
      content: body.content,
      filePath: body.filePath,
      uploadedBy: body.uploadedBy,
    });

    return Response.json({
      success: true,
      document: newDocument,
      message: "Dokumen berhasil dibuat",
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat membuat dokumen" },
      { status: 500 }
    );
  }
}

// GET /api/documents - Get documents (for admin/satgas users)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    
    let documents;
    if (reportId) {
      // Get documents for a specific report
      documents = await investigationDocumentService.getDocumentsByReportId(parseInt(reportId));
    } else {
      // Get all documents (this might be restricted in a real app)
      // For now, we'll need to implement a way to get all documents if needed
      return Response.json({
        success: false,
        message: "reportId parameter is required",
      }, { status: 400 });
    }

    return Response.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengambil dokumen" },
      { status: 500 }
    );
  }
}