import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import { db } from "@/db";
import fs from 'fs';
import path from 'path';

export const runtime = "nodejs";

// GET /api/upload/[filename] - Download legacy uploaded files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Get current user session
    const session = await getSessionFromRequest(request);

    if (!session || !isRoleAllowed(session, ['SATGAS', 'REKTOR'])) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { filename } = await params;

    if (!filename) {
      return Response.json(
        { success: false, message: "Filename is required" },
        { status: 400 }
      );
    }

    // Try multiple paths for the file
    const possiblePaths = [
      path.join(process.cwd(), 'uploads', filename),
      path.join(process.cwd(), 'public', 'uploads', filename),
      path.join(process.cwd(), 'static', 'uploads', filename),
      path.join(process.cwd(), 'storage', 'uploads', filename),
      path.join(process.cwd(), 'files', filename),
      path.join(process.cwd(), 'documents', filename)
    ];

    let filePath = null;
    let foundPath = null;

    // Check each possible path
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        filePath = possiblePath;
        foundPath = possiblePath;
        break;
      }
    }

    if (!filePath) {
      // If file not found locally, check if it's a URL in the database
      try {
        // Try to find the file in the database by filename
        const document = await db.investigationDocument.findFirst({
          where: {
            OR: [
              { storagePath: { contains: filename } },
              { fileName: filename }
            ]
          }
        });

        if (document && document.storagePath.startsWith('http')) {
          // Redirect to external URL
          return Response.redirect(document.storagePath, 302);
        }
      } catch (dbError) {
        console.error('Database lookup failed:', dbError);
      }

      return Response.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg'
    };

    if (mimeTypes[ext]) {
      contentType = mimeTypes[ext];
    }

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', stats.size.toString());
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(fileBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("Error downloading legacy file:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat mengunduh file" },
      { status: 500 }
    );
  }
}