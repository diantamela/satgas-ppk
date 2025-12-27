import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { db } from "@/db";
import { Role, NotificationType } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth/server-session";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching user recommendations - Request headers:", Object.fromEntries(request.headers.entries()));
    
    const auth = checkAuth(request);
    console.log("🔐 Auth check result:", { authenticated: auth.authenticated, role: auth.role });
    
    if (!auth.authenticated) {
      console.error("❌ Authentication failed");
      return auth.error!;
    }

    // Only USER can view their own recommendations
    if (auth.role !== Role.USER) {
      console.error("❌ Insufficient permissions. User role:", auth.role);
      return NextResponse.json({ error: "Forbidden", details: "Only users can access this endpoint" }, { status: 403 });
    }

    // Get session to access user ID
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 401 });
    }

    console.log("✅ Authentication successful. Fetching user recommendations from database...");
    
    // Check database connection
    try {
      await db.$queryRaw`SELECT 1`;
      console.log("✅ Database connection verified");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      return NextResponse.json(
        { error: "Database connection failed", details: dbError instanceof Error ? dbError.message : "Unknown database error" },
        { status: 503 }
      );
    }

    console.log("🔍 Attempting to fetch user recommendations...");
    
    // For now, we'll store user recommendations in the same table but with different structure
    // This is a temporary approach - in a real app you might want a separate table
    const userRecommendations = await (db.recommendation as any).findMany({
      where: {
        createdById: session.user.id,
        // Filter recommendations that are not linked to rejected reports
        OR: [
          { reportId: null },
          { reportId: "" },
          {
            report: {
              status: {
                not: 'REJECTED'
              }
            }
          }
        ]
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        report: {
          select: {
            id: true,
            reportNumber: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📊 Found ${userRecommendations.length} user recommendations`);

    // Transform data to match the expected interface
    const transformedRecommendations = userRecommendations.map((rec: any) => ({
      id: rec.id,
      title: rec.title,
      description: rec.description,
      content: rec.content,
      type: rec.type || 'lainnya', // Default to 'lainnya' if not set
      status: rec.status.toLowerCase(),
      createdAt: rec.createdAt.toISOString(),
      updatedAt: rec.updatedAt?.toISOString() || rec.createdAt.toISOString(),
      response: rec.response || rec.rejectionReason, // Use response or rejectionReason as response
      respondedAt: rec.approvedAt?.toISOString(),
      report: rec.report ? {
        id: rec.report.id,
        reportNumber: rec.report.reportNumber,
        title: rec.report.title,
        status: rec.report.status
      } : null,
    }));

    console.log("✅ Successfully fetched and transformed user recommendations");
    return NextResponse.json(transformedRecommendations);
  } catch (error) {
    console.error("💥 Critical error in GET /api/user/recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          'X-Error-Type': 'CRITICAL_ERROR'
        }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    // Only USER can create recommendations
    if (auth.role !== Role.USER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get session to access user ID
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, content, type, userId, reportId } = body;

    if (!title || !description || !content || !userId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the user exists and matches the auth user
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "User ID mismatch" },
        { status: 400 }
      );
    }

    // If reportId is provided, verify the report exists and belongs to the user and is not rejected
    let verifiedReportId = null;
    if (reportId && reportId.trim()) {
      const report = await db.report.findUnique({
        where: { id: reportId },
        select: { id: true, reporterId: true, status: true }
      });

      if (!report) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }

      if (report.reporterId !== userId) {
        return NextResponse.json(
          { error: "Report does not belong to user" },
          { status: 403 }
        );
      }

      if (report.status === 'REJECTED') {
        return NextResponse.json(
          { error: "Cannot create recommendation for rejected report" },
          { status: 400 }
        );
      }

      verifiedReportId = reportId;
    }

    // Create a user recommendation
    const recommendation = await (db.recommendation as any).create({
      data: {
        title,
        description,
        content,
        type: type, // Store the type as a string
        status: 'PENDING', // Default status
        createdById: userId,
        reportId: verifiedReportId, // Can be null if no report is selected
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create notification for SATGAS members
    const satgasUsers = await db.user.findMany({
      where: { role: Role.SATGAS },
      select: { id: true },
    });

    if (satgasUsers.length > 0) {
      await db.notification.createMany({
        data: satgasUsers.map((user) => ({
          userId: user.id,
          type: NotificationType.NEW_RECOMMENDATION,
          title: "Rekomendasi Baru dari User",
          message: `User ${(recommendation as any).createdBy.name} telah mengajukan rekomendasi: ${title}`,
          relatedEntityId: recommendation.id,
          relatedEntityType: "user_recommendation",
        })),
      });
    }

    console.log("✅ Successfully created user recommendation");
    return NextResponse.json(recommendation, { status: 201 });
  } catch (error) {
    console.error("Error creating user recommendation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}