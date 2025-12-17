import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { db } from "@/db";
import { Role, RecommendationStatus, Priority, NotificationType } from "@prisma/client";
import { notifyRecommendationCreated } from "@/lib/utils/notifications";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching recommendations - Request headers:", Object.fromEntries(request.headers.entries()));
    
    const auth = checkAuth(request);
    console.log("🔐 Auth check result:", { authenticated: auth.authenticated, role: auth.role });
    
    if (!auth.authenticated) {
      console.error("❌ Authentication failed");
      return auth.error!;
    }

    // Only SATGAS and REKTOR can view recommendations
    if (auth.role !== Role.SATGAS && auth.role !== Role.REKTOR) {
      console.error("❌ Insufficient permissions. User role:", auth.role);
      return NextResponse.json({ error: "Forbidden", details: "Insufficient permissions" }, { status: 403 });
    }

    console.log("✅ Authentication successful. Fetching recommendations from database...");
    
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

    console.log("🔍 Attempting to fetch recommendations with relations...");
    
    let recommendations;
    try {
      // First try with relations
      recommendations = await (db.recommendation as any).findMany({
        include: {
          report: {
            select: {
              id: true,
              reportNumber: true,
              title: true,
              description: true,
            },
          },
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
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      console.log("✅ Successfully fetched recommendations with relations");
    } catch (relationError) {
      console.warn("⚠️ Relations failed, trying without relations:", relationError);
       
      // Fallback: fetch without relations
      recommendations = await (db.recommendation as any).findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
       
      console.log(`📊 Found ${recommendations.length} recommendations (without relations)`);

      // For each recommendation, try to get related data separately
      const recommendationsWithData = await Promise.all(
        recommendations.map(async (rec: any) => {
          let reportData = null;
          let createdByData = null;
          let approvedByData = null;

          try {
            // Try to get report data
            if (rec.reportId) {
              reportData = await db.report.findUnique({
                where: { id: rec.reportId },
                select: { id: true, reportNumber: true, title: true, description: true },
              });
            }
          } catch (e) {
            console.warn("Failed to fetch report data:", e);
          }

          try {
            // Try to get createdBy data
            if (rec.createdById) {
              createdByData = await db.user.findUnique({
                where: { id: rec.createdById },
                select: { id: true, name: true },
              });
            }
          } catch (e) {
            console.warn("Failed to fetch createdBy data:", e);
          }

          try {
            // Try to get approvedBy data
            if (rec.approvedById) {
              approvedByData = await db.user.findUnique({
                where: { id: rec.approvedById },
                select: { id: true, name: true },
              });
            }
          } catch (e) {
            console.warn("Failed to fetch approvedBy data:", e);
          }

          return { ...rec, report: reportData, createdBy: createdByData, approvedBy: approvedByData };
        })
      );

      recommendations = recommendationsWithData;
    }

    console.log(`📊 Found ${recommendations.length} recommendations`);

    // Transform data to match the expected interface
    const transformedRecommendations = recommendations.map((rec: any) => ({
      id: rec.id,
      investigationId: rec.report?.reportNumber || `RPT-${rec.reportId?.slice(-8) || 'Unknown'}`,
      title: rec.title,
      description: rec.description,
      recommendation: rec.content,
      status: rec.status.toLowerCase(),
      createdAt: rec.createdAt.toISOString().split('T')[0],
      investigator: rec.createdBy?.name || 'Unknown Investigator',
      priority: rec.priority.toLowerCase(),
      approvedBy: rec.approvedBy?.name,
      approvedAt: rec.approvedAt?.toISOString(),
      rejectionReason: rec.rejectionReason,
    }));

    console.log("✅ Successfully fetched and transformed recommendations");
    return NextResponse.json(transformedRecommendations);
  } catch (error) {
    console.error("💥 Critical error in GET /api/recommendations:", error);
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

    // Only SATGAS can create recommendations
    if (auth.role !== Role.SATGAS) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, title, description, content, priority, userId } = body;

    if (!reportId || !title || !description || !content || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the report exists
    const report = await db.report.findUnique({
      where: { id: reportId },
      select: { id: true, assigneeId: true, reporterId: true, reportNumber: true, title: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const recommendation = await (db.recommendation as any).create({
      data: {
        reportId,
        title,
        description,
        content,
        priority: (priority?.toUpperCase() as Priority) || Priority.MEDIUM,
        createdById: userId,
      },
      include: {
        report: {
          select: {
            reportNumber: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create notification for REKTOR
    const rektorUsers = await db.user.findMany({
      where: { role: Role.REKTOR },
      select: { id: true },
    });

    if (rektorUsers.length > 0) {
      await db.notification.createMany({
        data: rektorUsers.map((user) => ({
          userId: user.id,
          type: NotificationType.NEW_RECOMMENDATION,
          title: "Rekomendasi Baru",
          message: `Rekomendasi baru untuk laporan ${(recommendation as any).report.reportNumber} telah diajukan`,
          relatedEntityId: recommendation.id,
          relatedEntityType: "recommendation",
        })),
      });
    }

    // Send notification to the report reporter
    if (report.reporterId) {
      try {
        await notifyRecommendationCreated(
          reportId,
          report.reporterId,
          report.reportNumber,
          (recommendation as any).createdBy.name
        );
      } catch (notificationError) {
        console.error('Error sending notification to reporter:', notificationError);
        // Don't fail the whole request if notification fails
      }
    }

    return NextResponse.json(recommendation, { status: 201 });
  } catch (error) {
    console.error("Error creating recommendation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}