import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    // Get report basic info
    const report = await db.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        reportNumber: true,
        title: true,
        status: true,
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Laporan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get current activities (status IN_PROGRESS and isCurrent = true)
    const currentActivities = await db.reportActivity.findMany({
      where: {
        reportId: reportId,
        isCurrent: true,
      },
      orderBy: [
        { status: 'asc' }, // IN_PROGRESS first
        { startedAt: 'desc' }, // Most recent first
      ],
    });

    // Get recent completed activities (last 5)
    const recentCompletedActivities = await db.reportActivity.findMany({
      where: {
        reportId: reportId,
        status: 'COMPLETED',
        isCurrent: false,
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
    });

    // Get upcoming activities (NOT_STARTED)
    const upcomingActivities = await db.reportActivity.findMany({
      where: {
        reportId: reportId,
        status: 'NOT_STARTED',
        isCurrent: false,
      },
      orderBy: { startedAt: 'asc' },
      take: 3,
    });

    // Calculate progress summary
    const totalActivities = await db.reportActivity.count({
      where: { reportId: reportId },
    });

    const completedActivities = await db.reportActivity.count({
      where: {
        reportId: reportId,
        status: 'COMPLETED',
      },
    });

    const inProgressActivities = await db.reportActivity.count({
      where: {
        reportId: reportId,
        status: 'IN_PROGRESS',
      },
    });

    const progressPercentage = totalActivities > 0 
      ? Math.round((completedActivities / totalActivities) * 100) 
      : 0;

    // Format response
    const response = {
      success: true,
      data: {
        report: {
          id: report.id,
          reportNumber: report.reportNumber,
          title: report.title,
          status: report.status,
          assigneeName: report.assignee?.name || 'Belum ditugaskan',
        },
        currentActivities: currentActivities.map((activity: Prisma.ReportActivityGetPayload<{}>) => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          activityType: activity.activityType,
          status: activity.status,
          assignedTo: activity.assignedTo,
          priority: activity.priority,
          startedAt: activity.startedAt,
          estimatedCompletion: activity.estimatedCompletion,
          notes: activity.notes,
        })),
        recentCompletedActivities: recentCompletedActivities.map((activity: Prisma.ReportActivityGetPayload<{}>) => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          activityType: activity.activityType,
          completedAt: activity.completedAt,
        })),
        upcomingActivities: upcomingActivities.map((activity: Prisma.ReportActivityGetPayload<{}>) => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          activityType: activity.activityType,
          priority: activity.priority,
          startedAt: activity.startedAt,
        })),
        summary: {
          totalActivities,
          completedActivities,
          inProgressActivities,
          progressPercentage,
          hasActiveWork: currentActivities.length > 0,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching current activities:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST method to create new activity
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    const body = await request.json();
    
    const {
      title,
      description,
      activityType,
      assignedTo,
      priority = 'MEDIUM',
      estimatedCompletion,
      notes,
    } = body;

    // Validate required fields
    if (!title || !description || !activityType) {
      return NextResponse.json(
        { success: false, message: 'Field title, description, dan activityType wajib diisi' },
        { status: 400 }
      );
    }

    // Check if report exists
    const report = await db.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Laporan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create new activity
    const newActivity = await db.reportActivity.create({
      data: {
        reportId,
        title,
        description,
        activityType,
        assignedTo,
        priority,
        estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : null,
        notes,
        status: 'IN_PROGRESS',
        isCurrent: true,
      },
    });

    // Set other current activities to not current if this is marked as current
    if (newActivity.isCurrent) {
      await db.reportActivity.updateMany({
        where: {
          reportId,
          id: { not: newActivity.id },
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Aktivitas berhasil ditambahkan',
      data: newActivity,
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}