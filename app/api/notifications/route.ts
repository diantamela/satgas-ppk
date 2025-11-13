// Temporarily disabled - notificationService removed
// import { NextRequest } from "next/server";
// import { notificationService } from "@/lib/services/reports/report-service";

// POST /api/notifications - Create a new notification
export async function POST() {
  return Response.json({
    success: false,
    message: "Service temporarily unavailable",
  }, { status: 503 });
}

// GET /api/notifications - Get notifications (for admin/satgas users)
export async function GET() {
  return Response.json({
    success: false,
    message: "Service temporarily unavailable",
  }, { status: 503 });
}