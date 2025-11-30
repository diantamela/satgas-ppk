import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

// Test endpoint to debug activities API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    console.log('Test endpoint received params:', { dateFrom, dateTo, page, limit });

    // Test 1: Check if there are any contact notifications in database
    const contactNotifications = await db.notification.findMany({
      where: {
        relatedEntityType: 'CONTACT_MESSAGE'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('Found contact notifications:', contactNotifications.length);

    // Test 2: Check notifications with date filtering
    const notificationWhere: any = {};
    
    if (dateFrom || dateTo) {
      notificationWhere.createdAt = {};
      if (dateFrom) {
        notificationWhere.createdAt.gte = new Date(dateFrom + 'T00:00:00.000Z');
      }
      if (dateTo) {
        notificationWhere.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    const filteredNotifications = await db.notification.findMany({
      where: notificationWhere,
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('Found filtered notifications:', filteredNotifications.length);

    return NextResponse.json({
      success: true,
      debug: {
        params: { dateFrom, dateTo, page, limit },
        totalContactNotifications: contactNotifications.length,
        totalFilteredNotifications: filteredNotifications.length,
        contactNotifications: contactNotifications.map(n => ({
          id: n.id,
          title: n.title,
          createdAt: n.createdAt.toISOString(),
          relatedEntityType: n.relatedEntityType
        })),
        filteredNotifications: filteredNotifications.map(n => ({
          id: n.id,
          title: n.title,
          createdAt: n.createdAt.toISOString(),
          relatedEntityType: n.relatedEntityType
        }))
      }
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}