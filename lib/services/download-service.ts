/**
 * Centralized Download Service
 * Provides standardized download functionality across the application
 */

import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/server-session";
import { isRoleAllowed } from "@/lib/auth/auth-utils";
import fs from 'fs';
import path from 'path';

export interface DownloadOptions {
  allowedRoles?: string[];
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  requireAuth?: boolean;
}

export interface DownloadResult {
  success: boolean;
  data?: Buffer;
  headers?: Headers;
  error?: {
    code: number;
    message: string;
    details?: any;
  };
}

export interface FileInfo {
  id: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  storagePath: string;
  uploadedBy?: {
    name: string;
  };
  metadata?: Record<string, any>;
}

export class DownloadService {
  /**
   * Standard authentication check for download routes
   */
  static async authenticateRequest(
    request: NextRequest,
    options: DownloadOptions = {}
  ): Promise<{ success: boolean; session?: any; error?: DownloadResult['error'] }> {
    const {
      allowedRoles = ['SATGAS', 'REKTOR'],
      requireAuth = true
    } = options;

    if (!requireAuth) {
      return { success: true };
    }

    try {
      const session = await getSessionFromRequest(request);
      
      if (!session) {
        return {
          success: false,
          error: {
            code: 401,
            message: "Anda harus login untuk mengakses resource ini"
          }
        };
      }

      if (!isRoleAllowed(session, allowedRoles)) {
        return {
          success: false,
          error: {
            code: 403,
            message: "Anda tidak memiliki akses untuk mengunduh file ini"
          }
        };
      }

      return { success: true, session };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: {
          code: 500,
          message: "Terjadi kesalahan saat memverifikasi autentikasi"
        }
      };
    }
  }

  /**
   * Standard file validation
   */
  static validateFile(fileInfo: FileInfo, options: DownloadOptions = {}): { success: boolean; error?: DownloadResult['error'] } {
    const { maxFileSize = 50 * 1024 * 1024, allowedFileTypes } = options; // 50MB default

    // Validate file size
    if (fileInfo.fileSize && fileInfo.fileSize > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      return {
        success: false,
        error: {
          code: 413,
          message: `File terlalu besar. Maksimal ${maxSizeMB}MB`
        }
      };
    }

    // Validate file type
    if (allowedFileTypes && allowedFileTypes.length > 0) {
      const isAllowedType = allowedFileTypes.some(type => 
        fileInfo.fileType.toLowerCase().includes(type.toLowerCase())
      );
      
      if (!isAllowedType) {
        return {
          success: false,
          error: {
            code: 415,
            message: `Tipe file tidak diizinkan. Hanya file: ${allowedFileTypes.join(', ')}`
          }
        };
      }
    }

    return { success: true };
  }

  /**
   * Enhanced file path resolution with multiple fallback paths
   */
  static resolveFilePath(storagePath: string, fileName?: string): string | null {
    try {
      let filePath: string;

      // Handle different storage path formats
      if (storagePath.startsWith('/')) {
        // Absolute path from project root
        filePath = path.join(process.cwd(), storagePath.substring(1));
      } else if (storagePath.startsWith('http')) {
        // External URL - cannot resolve local path
        return null;
      } else {
        // Relative path
        filePath = path.join(process.cwd(), storagePath);
      }

      // If file exists at the resolved path, return it
      if (fs.existsSync(filePath)) {
        return filePath;
      }

      // Try alternative paths for legacy files
      const alternativePaths = [
        path.join(process.cwd(), 'uploads', path.basename(filePath)),
        path.join(process.cwd(), 'public', 'uploads', path.basename(filePath)),
        path.join(process.cwd(), 'static', path.basename(filePath)),
        path.join(process.cwd(), 'uploads', 'evidence', path.basename(filePath)),
        // Additional paths for better file discovery
        path.join(process.cwd(), 'public', filePath.replace(/^\//, '')),
        path.join(process.cwd(), 'public', 'uploads', 'evidence', path.basename(filePath)),
        path.join(process.cwd(), 'public', 'uploads', 'documents', path.basename(filePath)),
      ];

      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
          console.log(`[DOWNLOAD-SERVICE] Found file at alternative path: ${altPath}`);
          console.log(`[DOWNLOAD-SERVICE] Original storagePath: ${storagePath}`);
          console.log(`[DOWNLOAD-SERVICE] File basename: ${path.basename(filePath)}`);
          return altPath;
        }
      }

      // If no path found, return null
      return null;
    } catch (error) {
      console.error('[DOWNLOAD-SERVICE] Error resolving file path:', error);
      return null;
    }
  }

  /**
   * Standard file download handler
   */
  static async downloadFile(
    fileInfo: FileInfo,
    options: DownloadOptions = {}
  ): Promise<DownloadResult> {
    try {
      console.log(`[DOWNLOAD-SERVICE] Starting download for file: ${fileInfo.fileName}`);

      // Validate file
      const validation = this.validateFile(fileInfo, options);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }

      // Handle external URLs (S3, CDN, etc.)
      if (fileInfo.storagePath.startsWith('http')) {
        console.log(`[DOWNLOAD-SERVICE] Redirecting to external URL: ${fileInfo.storagePath}`);
        const headers = new Headers();
        headers.set('Location', fileInfo.storagePath);
        headers.set('Cache-Control', 'public, max-age=3600');
        
        return {
          success: true,
          data: undefined,
          headers
        };
      }

      // Handle local files
      const resolvedPath = this.resolveFilePath(fileInfo.storagePath, fileInfo.fileName);
      
      if (!resolvedPath) {
        console.log(`[DOWNLOAD-SERVICE] File not found for path: ${fileInfo.storagePath}`);
        return {
          success: false,
          error: {
            code: 404,
            message: "File tidak ditemukan di storage",
            details: {
              fileName: fileInfo.fileName,
              storagePath: fileInfo.storagePath
            }
          }
        };
      }

      // Read file
      const fileBuffer = fs.readFileSync(resolvedPath);
      console.log(`[DOWNLOAD-SERVICE] Successfully read file, size: ${fileBuffer.length} bytes`);

      // Set standard headers
      const headers = new Headers();
      headers.set('Content-Type', fileInfo.fileType || 'application/octet-stream');
      headers.set('Content-Length', (fileInfo.fileSize || fileBuffer.length).toString());
      headers.set('Content-Disposition', `attachment; filename="${fileInfo.fileName || 'download'}"`);
      headers.set('Cache-Control', 'private, max-age=0, no-cache');
      headers.set('X-Content-Type-Options', 'nosniff');

      return {
        success: true,
        data: fileBuffer,
        headers
      };
    } catch (error) {
      console.error('[DOWNLOAD-SERVICE] Download error:', error);
      return {
        success: false,
        error: {
          code: 500,
          message: "Terjadi kesalahan saat membaca file",
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }
      };
    }
  }

  /**
   * Standard error response formatter
   */
  static formatErrorResponse(error: DownloadResult['error'], includeDetails = false) {
    if (!error) {
      return Response.json(
        { success: false, message: "Unknown error occurred" },
        { status: 500 }
      );
    }

    const response: any = {
      success: false,
      message: error.message
    };

    if (includeDetails && error.details) {
      response.details = error.details;
    }

    // Add debug info in development
    if (process.env.NODE_ENV === 'development' && error.details) {
      response.debug = error.details;
    }

    return Response.json(response, { status: error.code });
  }

  /**
   * Standard success response handler
   */
  static formatSuccessResponse(data: Buffer, headers: Headers) {
    // Convert Buffer to Uint8Array for proper Response handling
    const uint8Array = new Uint8Array(data);
    return new Response(uint8Array, {
      status: 200,
      headers
    });
  }

  /**
   * Create standardized download route handler
   */
  static createDownloadHandler<T extends FileInfo>(
    getFileInfo: (params: any) => Promise<T | null>,
    options: DownloadOptions = {}
  ) {
    return async (request: NextRequest, params: any) => {
      try {
        // Step 1: Authenticate request
        const auth = await this.authenticateRequest(request, options);
        if (!auth.success) {
          return this.formatErrorResponse(auth.error, true);
        }

        // Step 2: Get file information
        const fileInfo = await getFileInfo(params);
        if (!fileInfo) {
          return this.formatErrorResponse({
            code: 404,
            message: "File tidak ditemukan"
          }, true);
        }

        // Step 3: Download file
        const result = await this.downloadFile(fileInfo, options);
        
        if (!result.success) {
          return this.formatErrorResponse(result.error, true);
        }

        // Step 4: Handle response
        if (result.data === undefined) {
          // Redirect response (for external URLs)
          return new Response(null, {
            status: 302,
            headers: result.headers
          });
        } else {
          // File data response
          return this.formatSuccessResponse(result.data, result.headers!);
        }

      } catch (error) {
        console.error('[DOWNLOAD-SERVICE] Route handler error:', error);
        return this.formatErrorResponse({
          code: 500,
          message: "Terjadi kesalahan internal server",
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }, true);
      }
    };
  }
}