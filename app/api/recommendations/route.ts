import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { db } from "@/db";
import { Role, RecommendationStatus, Priority } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    // Only SATGAS and REKTOR can view recommendations
    if (auth.role !== Role.SATGAS && auth.role !== Role.REKTOR) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const recommendations = await (db.recommendation as any).findMany({
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

    // Transform data to match the expected interface
    const transformedRecommendations = recommendations.map((rec: any) => ({
      id: rec.id,
      investigationId: rec.report.reportNumber,
      title: rec.title,
      description: rec.description,
      recommendation: rec.content,
      status: rec.status.toLowerCase(),
      createdAt: rec.createdAt.toISOString().split('T')[0],
      investigator: rec.createdBy.name,
      priority: rec.priority.toLowerCase(),
      approvedBy: rec.approvedBy?.name,
      approvedAt: rec.approvedAt?.toISOString(),
      rejectionReason: rec.rejectionReason,
    }));

    return NextResponse.json(transformedRecommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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

    // Verify the report exists and user has access to it
    const report = await db.report.findUnique({
      where: { id: reportId },
      select: { id: true, assigneeId: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Only the assignee can create recommendations for a report
    if (report.assigneeId !== userId) {
      return NextResponse.json(
        { error: "You can only create recommendations for reports assigned to you" },
        { status: 403 }
      );
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
          type: "NEW_RECOMMENDATION" as const,
          title: "Rekomendasi Baru",
          message: `Rekomendasi baru untuk laporan ${(recommendation as any).report.reportNumber} telah diajukan`,
          relatedEntityId: recommendation.id,
          relatedEntityType: "recommendation",
        })),
      });
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