import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { processFileUpload } from '@/lib/file-upload';
import { db } from '@/db';
import { getNormalizedRoleFromSession } from '@/lib/auth-utils';

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

    // If report ID is provided, update the report's evidence files
    if (reportId) {
      // Verify that the user has permission to add evidence to this report
      const report = await db.report.findUnique({
        where: { id: parseInt(reportId) }
      });

      if (!report) {
        return Response.json({ error: 'Report not found' }, { status: 404 });
      }

      // Only report creator or satgas can add evidence
      if (
        getNormalizedRoleFromSession(session) !== 'SATGAS' &&
        session.user.email !== report.reporterEmail
      ) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Get existing evidence files and add the new one
      const existingEvidence = report.evidenceFiles ? JSON.parse(report.evidenceFiles) : [];
      const updatedEvidence = [...existingEvidence, result.filePath];

      // Update the report with the new evidence file
      await db.report.update({
        where: { id: parseInt(reportId) },
        data: {
          evidenceFiles: JSON.stringify(updatedEvidence),
          updatedAt: new Date(),
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