import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { db } from "@/db";
import { Role, RecommendationStatus } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth/server-session";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching user recommendations for SATGAS - Request headers:", Object.fromEntries(request.headers.entries()));
    
    const auth = checkAuth(request);
    console.log("🔐 Auth check result:", { authenticated: auth.authenticated, role: auth.role });
    
    if (!auth.authenticated) {
      console.error("❌ Authentication failed");
      return auth.error!;
    }

    // Only SATGAS can view user recommendations
    if (auth.role !== Role.SATGAS) {
      console.error("❌ Insufficient permissions. User role:", auth.role);
      return NextResponse.json({ error: "Forbidden", details: "Only SATGAS can access this endpoint" }, { status: 403 });
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

    console.log("🔍 Attempting to fetch user recommendations for SATGAS...");
    
    // Fetch user recommendations (those without reportId or with non-rejected reports)
    const userRecommendations = await (db.recommendation as any).findMany({
      where: {
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
            email: true,
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
      type: rec.type || 'lainnya',
      status: rec.status.toLowerCase(),
      createdAt: rec.createdAt.toISOString(),
      updatedAt: rec.updatedAt?.toISOString() || rec.createdAt.toISOString(),
      response: rec.response || rec.rejectionReason,
      respondedAt: rec.approvedAt?.toISOString(),
      user: {
        id: rec.createdBy.id,
        name: rec.createdBy.name,
        email: rec.createdBy.email,
      },
      respondedBy: rec.approvedBy?.name,
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
    console.error("💥 Critical error in GET /api/satgas/user-recommendations:", error);
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

export async function PUT(request: NextRequest) {
  try {
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    // Only SATGAS can update user recommendations
    if (auth.role !== Role.SATGAS) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get session to access user ID
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, response } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: id, status" },
        { status: 400 }
      );
    }

    // Verify the recommendation exists and is a user recommendation
    const currentRecommendation = await (db.recommendation as any).findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } }
      }
    });

    if (!currentRecommendation) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    // Check if this is a user recommendation (no reportId or non-rejected report)
    const isUserRecommendation = 
      currentRecommendation.reportId === null || 
      currentRecommendation.reportId === "" ||
      (currentRecommendation.report && currentRecommendation.report.status !== 'REJECTED');

    if (!isUserRecommendation) {
      return NextResponse.json({ error: "This is not a user recommendation" }, { status: 400 });
    }

    // Update the recommendation
    const updateData: any = {
      status: status.toUpperCase(),
      updatedAt: new Date(),
      response: response || null,
    };

    if (status === 'responded' || status === 'in_progress' || status === 'completed') {
      updateData.approvedById = session.user.id;
      updateData.approvedAt = new Date();
    } else if (status === 'rejected') {
      if (!response) {
        return NextResponse.json(
          { error: "Response is required when rejecting" },
          { status: 400 }
        );
      }
    }

    const updatedRecommendation = await (db.recommendation as any).update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
      }
    });

    // Create notification for the user
    let notificationMessage = "";
    if (status === 'responded') {
      notificationMessage = `SATGAS telah memberikan respons terhadap rekomendasi Anda: ${currentRecommendation.title}`;
    } else if (status === 'in_progress') {
      notificationMessage = `Rekomendasi Anda "${currentRecommendation.title}" sedang diproses oleh SATGAS`;
    } else if (status === 'completed') {
      notificationMessage = `Rekomendasi Anda "${currentRecommendation.title}" telah selesai ditangani`;
    } else if (status === 'rejected') {
      notificationMessage = `Maaf, rekomendasi Anda "${currentRecommendation.title}" tidak dapat dipenuhi saat ini`;
    }

    if (notificationMessage) {
      await db.notification.create({
        data: {
          userId: currentRecommendation.createdById,
          type: "DECISION_MADE",
          title: "Update Rekomendasi",
          message: notificationMessage,
          relatedEntityId: updatedRecommendation.id,
          relatedEntityType: "user_recommendation",
        },
      });
    }

    console.log("✅ Successfully updated user recommendation");
    return NextResponse.json(updatedRecommendation);
  } catch (error) {
    console.error("Error updating user recommendation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}