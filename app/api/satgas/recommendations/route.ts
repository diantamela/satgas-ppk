import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { db } from "@/db";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import crypto from "crypto";

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

// Helper function to get current user from session
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    console.log('🔍 SATGAS API - Session token found:', sessionToken ? 'Yes' : 'No');
    
    if (!sessionToken) {
      console.log('❌ SATGAS API - No session token in cookies');
      return null;
    }

    const tokenHash = sha256(sessionToken);
    console.log('🔍 SATGAS API - Token hash:', tokenHash.substring(0, 16) + '...');

    // Find valid session with user data
    const session = await db.session.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return session?.user || null;
  } catch (error) {
    console.error('❌ SATGAS API - Error getting current user:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } else {
      console.error('Error details:', {
        message: 'Unknown error type',
        error: String(error)
      });
    }
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching recommendations for SATGAS - Request headers:", Object.fromEntries(request.headers.entries()));

    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Only SATGAS can view all recommendations
    console.log("🔍 SATGAS role check:", user.role, "Required:", Role.SATGAS);
    if (user.role !== Role.SATGAS) {
      console.log("❌ Access denied - User role is", user.role, "but only", Role.SATGAS, "role is allowed");
      return NextResponse.json({ 
        error: "Forbidden", 
        details: `Access denied. This endpoint is for ${Role.SATGAS} role only. Your role: ${user.role}`,
        yourRole: user.role,
        requiredRole: Role.SATGAS
      }, { status: 403 });
    }

    console.log("✅ Authentication successful. Fetching all recommendations from database...");

    // Get all user recommendations (for SATGAS to respond to)
    const recommendations = await db.recommendation.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
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

    console.log(`📊 Found ${recommendations.length} total recommendations`);

    // Transform data to match the expected interface
    const transformedRecommendations = recommendations.map((rec) => ({
      id: rec.id,
      title: rec.title,
      description: rec.description,
      content: rec.content,
      type: rec.type || 'lainnya',
      status: rec.status.toUpperCase() as any, // Keep database enum format for SATGAS
      createdAt: rec.createdAt.toISOString(),
      updatedAt: rec.updatedAt.toISOString(),
      response: rec.response, // Now available from database
      respondedAt: rec.respondedAt ? rec.respondedAt.toISOString() : null, // Now available from database
      user: rec.createdBy || { id: '', name: 'Unknown', email: 'Unknown' },
      respondedBy: rec.respondedBy, // Now available from database
      report: rec.report ? {
        id: rec.report.id,
        reportNumber: rec.report.reportNumber,
        title: rec.report.title,
        status: rec.report.status,
      } : null,
    }));

    console.log("✅ Successfully fetched and transformed recommendations for SATGAS");
    console.log("📤 SATGAS API returning data:", {
      count: transformedRecommendations.length,
      sampleStatus: transformedRecommendations[0]?.status,
      sampleResponse: transformedRecommendations[0]?.response ? 'Present' : 'None',
      sampleRespondedAt: transformedRecommendations[0]?.respondedAt
    });
    return NextResponse.json(transformedRecommendations);
  } catch (error) {
    console.error("💥 Critical error in GET /api/satgas/recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🔍 Updating recommendation response - Request headers:", Object.fromEntries(request.headers.entries()));

    // Auth check - require session
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Only SATGAS can respond to recommendations
    if (user.role !== Role.SATGAS) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, response } = body;

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: id, status" },
        { status: 400 }
      );
    }

    // Map frontend status to database status
    const statusMapping: Record<string, string> = {
      'responded': 'SUBMITTED',
      'in_progress': 'APPROVED', 
      'completed': 'IMPLEMENTED',
      'rejected': 'REJECTED',
      // Also support direct database values
      'PENDING': 'PENDING',
      'SUBMITTED': 'SUBMITTED',
      'APPROVED': 'APPROVED',
      'REJECTED': 'REJECTED',
      'IMPLEMENTED': 'IMPLEMENTED'
    };

    const dbStatus = statusMapping[status] || status.toUpperCase();
    
    const validStatuses = ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IMPLEMENTED'];
    if (!validStatuses.includes(dbStatus)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Find the recommendation
    const recommendation = await db.recommendation.findUnique({
      where: { id },
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    // Update the recommendation with response
    const updatedRecommendation = await db.recommendation.update({
      where: { id },
      data: {
        status: dbStatus as any,
        response: response || null,
        respondedAt: new Date(),
        respondedBy: user.name,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
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
    });

    // Notify the user about the response
    await db.notification.create({
      data: {
        userId: recommendation.createdById,
        type: "NEW_RECOMMENDATION",
        title: "Respons Rekomendasi",
        message: `SATGAS telah memberikan respons untuk rekomendasi Anda: ${recommendation.title}`,
        relatedEntityId: recommendation.id,
        relatedEntityType: "user_recommendation",
      },
    });

    console.log("✅ Successfully updated recommendation response");
    return NextResponse.json(updatedRecommendation);
  } catch (error) {
    console.error("Error updating recommendation response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}