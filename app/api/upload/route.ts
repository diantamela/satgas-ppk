import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { processFileUpload } from '@/lib/utils/file-upload';
import { db } from '@/db';
import { getNormalizedRoleFromSession } from '@/lib/auth/auth-utils';

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Verify user session
    const session = await (auth as any)
      .$get('session', { headers: request.headers })
      .then((r: any) => r.json())
      .catch((e: any) => null);

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to upload evidence (normalize role)
    const role = getNormalizedRoleFromSession(session);
    if (role !== 'SATGAS' && role !== 'USER') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Process the file upload
    const result = await processFileUpload(request);

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    // Get report ID from form data if provided
    const formData = await request.formData();
    const reportId = formData.get('reportId') as string | null;
    const file = formData.get('file') as File | null;

    // If report ID is provided, create an investigation document
    if (reportId && file) {
      // Verify that the user has permission to add evidence to this report
      const report = await db.report.findUnique({
        where: { id: reportId },
        include: { reporter: true }
      });

      if (!report) {
        return Response.json({ error: 'Report not found' }, { status: 404 });
      }

      // Only report creator or satgas can add evidence
      if (
        getNormalizedRoleFromSession(session) !== 'SATGAS' &&
        session.user.email !== report.reporter.email
      ) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Create an investigation document for the uploaded file
      await db.investigationDocument.create({
        data: {
          reportId: reportId,
          documentType: 'EVIDENCE',
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storagePath: result.filePath!,
          description: `Uploaded evidence for report ${report.reportNumber}`,
          uploadedById: session.user.id
        }
      });
    }

    return Response.json({
      message: 'File uploaded successfully',
      filePath: result.filePath,
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}