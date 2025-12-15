import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { db } from "@/db";
import { Role, RecommendationStatus } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    // Only REKTOR can update recommendation status
    if (auth.role !== Role.REKTOR) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!status || !Object.values(RecommendationStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Get the current recommendation
    const currentRecommendation = await (db.recommendation as any).findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        report: { select: { reportNumber: true, title: true } }
      }
    });

    if (!currentRecommendation) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    // Update the recommendation
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === RecommendationStatus.APPROVED) {
      updateData.approvedById = "temp-rektor-id"; // TODO: Get actual rektor ID
      updateData.approvedAt = new Date();
    } else if (status === RecommendationStatus.REJECTED) {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }
      updateData.rejectionReason = rejectionReason;
    }

    const updatedRecommendation = await (db.recommendation as any).update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        report: { select: { reportNumber: true, title: true } }
      }
    });

    // Create notification for the investigator
    let notificationMessage = "";
    if (status === RecommendationStatus.APPROVED) {
      notificationMessage = `Rekomendasi Anda untuk laporan ${(updatedRecommendation as any).report.reportNumber} telah disetujui`;
    } else if (status === RecommendationStatus.REJECTED) {
      notificationMessage = `Rekomendasi Anda untuk laporan ${(updatedRecommendation as any).report.reportNumber} telah ditolak`;
    }

    if (notificationMessage) {
      await db.notification.create({
        data: {
          userId: updatedRecommendation.createdById,
          type: "DECISION_MADE",
          title: "Status Rekomendasi Diperbarui",
          message: notificationMessage,
          relatedEntityId: updatedRecommendation.id,
          relatedEntityType: "recommendation",
        },
      });
    }

    return NextResponse.json(updatedRecommendation);
  } catch (error) {
    console.error("Error updating recommendation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = checkAuth(request);
    if (!auth.authenticated) return auth.error!;

    // Only SATGAS and REKTOR can view individual recommendations
    if (auth.role !== Role.SATGAS && auth.role !== Role.REKTOR) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const recommendation = await (db.recommendation as any).findUnique({
      where: { id },
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
    });

    if (!recommendation) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    // Transform data to match expected interface
    const transformedRecommendation = {
      id: recommendation.id,
      investigationId: recommendation.report.reportNumber,
      title: recommendation.title,
      description: recommendation.description,
      recommendation: recommendation.content,
      status: recommendation.status.toLowerCase(),
      createdAt: recommendation.createdAt.toISOString().split('T')[0],
      investigator: recommendation.createdBy.name,
      priority: recommendation.priority.toLowerCase(),
      approvedBy: recommendation.approvedBy?.name,
      approvedAt: recommendation.approvedAt?.toISOString(),
      rejectionReason: recommendation.rejectionReason,
    };

    return NextResponse.json(transformedRecommendation);
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}