import { NextRequest } from 'next/server';
import { db } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportNumber = searchParams.get('reportNumber');

    if (!reportNumber) {
      return Response.json({ error: 'Report number is required' }, { status: 400 });
    }

    // Find report by report number
    const report = await db.report.findUnique({
      where: { reportNumber }
    });

    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // Calculate progress based on status
    const progress = report.status === 'completed' ? 100 : report.status === 'under_investigation' ? 60 : 20;

    // Mock data for status text
    let statusText = '';
    switch (report.status) {
      case 'pending':
        statusText = 'Menunggu Verifikasi';
        break;
      case 'under_investigation':
        statusText = 'Dalam Investigasi';
        break;
      case 'rejected':
        statusText = 'Ditolak';
        break;
      case 'completed':
        statusText = 'Selesai';
        break;
      default:
        statusText = report.status;
    }

    // Add more detailed status information
    const statusDetails = {
      id: report.id,
      reportNumber: report.reportNumber,
      title: report.title,
      status: report.status,
      description: report.description,
      category: report.category,
      severity: report.severity,
      assignedTo: report.assignedTo,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      progress,
      statusText,
      nextStep: report.status === 'completed' 
        ? 'Rekomendasi disetujui Rektor' 
        : report.status === 'under_investigation' 
          ? 'Pemeriksaan terhadap pelapor dan terlapor' 
          : 'Verifikasi awal oleh tim Satgas',
      estimatedCompletion: report.status === 'completed' 
        ? report.updatedAt 
        : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 10 days from now
    };

    return Response.json({ report: statusDetails });
  } catch (error) {
    console.error('Error fetching report status:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}