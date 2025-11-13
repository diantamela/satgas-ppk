// Temporarily disabled - investigationDocumentService removed
// import { NextRequest } from "next/server";
// import { investigationDocumentService } from "@/lib/services/reports/report-service";

export const runtime = "nodejs";

// POST /api/documents - Create a new investigation document
export async function POST() {
  return Response.json({
    success: false,
    message: "Service temporarily unavailable",
  }, { status: 503 });
}

// GET /api/documents - Get documents (for admin/satgas users)
export async function GET() {
  return Response.json({
    success: false,
    message: "Service temporarily unavailable",
  }, { status: 503 });
}