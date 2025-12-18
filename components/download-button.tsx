/**
 * Download Button Component
 * Reusable download button with consistent styling and functionality
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface DownloadButtonProps {
  /** API endpoint to call for download */
  url: string;
  /** Custom filename for the download */
  filename?: string;
  /** Button variant */
  variant?: "default" | "outline" | "ghost" | "destructive";
  /** Button size */
  size?: "sm" | "default" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Loading state (controlled externally) */
  isLoading?: boolean;
  /** Whether to show loading text */
  showLoadingText?: boolean;
  /** Custom loading text */
  loadingText?: string;
  /** Success callback */
  onSuccess?: () => void;
  /** Error callback */
  onError?: (error: string) => void;
  /** Additional headers for the request */
  headers?: Record<string, string>;
  /** Request method */
  method?: string;
  /** Request body */
  body?: any;
  /** Button children */
  children?: React.ReactNode;
}

export function DownloadButton({
  url,
  filename,
  variant = "outline",
  size = "sm",
  className = "",
  isLoading: controlledLoading,
  showLoadingText = true,
  loadingText = "Mengunduh...",
  onSuccess,
  onError,
  headers = {},
  method = "GET",
  body,
  children
}: DownloadButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  
  const isLoading = controlledLoading !== undefined ? controlledLoading : internalLoading;

  const handleDownload = async () => {
    if (isLoading) return;

    const setLoading = (loading: boolean) => {
      if (controlledLoading === undefined) {
        setInternalLoading(loading);
      }
    };

    setLoading(true);

    try {
      const options: RequestInit = {
        method,
        headers: {
          ...headers,
          ...(body && { 'Content-Type': 'application/json' })
        }
      };

      if (body) {
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Download failed (Status: ${response.status})`);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // Handle JSON response (like redirect URLs)
        const data = await response.json();
        if (data.url) {
          // Open the URL in a new tab
          window.open(data.url, '_blank');
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        // Handle binary data (files)
        const blob = await response.blob();
        
        // Check if blob is valid
        if (blob.size === 0) {
          throw new Error('File is empty');
        }

        // Check file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (blob.size > maxSize) {
          throw new Error('File too large (max 50MB)');
        }

        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Determine filename
        const contentDisposition = response.headers.get('content-disposition');
        let downloadFilename = filename;
        
        if (!downloadFilename && contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) {
            downloadFilename = match[1];
          }
        }
        
        if (!downloadFilename) {
          // Fallback: extract filename from URL
          const urlParts = url.split('/');
          downloadFilename = urlParts[urlParts.length - 1] || 'download';
        }
        
        link.download = downloadFilename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(downloadUrl);
        }, 100);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {showLoadingText && loadingText}
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          {children || 'Unduh'}
        </>
      )}
    </Button>
  );
}

/**
 * Evidence File Download Component
 * Specialized component for downloading evidence files with file type detection
 */

interface EvidenceDownloadProps {
  /** File information */
  file: {
    id?: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
    storagePath?: string;
    path?: string; // Legacy field
  };
  /** File URL (legacy support) */
  fileUrl?: string;
  /** Download variant */
  variant?: "default" | "outline" | "ghost" | "destructive";
  /** Button size */
  size?: "sm" | "default" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Success callback */
  onSuccess?: () => void;
  /** Error callback */
  onError?: (error: string) => void;
}

export function EvidenceDownload({
  file,
  fileUrl,
  variant = "outline",
  size = "sm",
  className = "",
  onSuccess,
  onError
}: EvidenceDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // Handle legacy files with path field
      if (file.path && !file.id) {
        if (file.path.startsWith('http')) {
          // External URL - open directly
          window.open(file.path, '_blank');
          onSuccess?.();
          return;
        } else {
          // Try multiple download approaches for legacy files
          try {
            const baseUrl = window.location.origin;
            const pathParts = file.path.split('/');
            const fileName = pathParts[pathParts.length - 1];
            
            // Approach 1: Direct file access in uploads directory
            const directUrl = `${baseUrl}/uploads/${file.path.replace(/^\/+/, '')}`;
            let response = await fetch(directUrl);
            
            if (!response.ok) {
              // Approach 2: Try with just the filename
              const filenameUrl = `${baseUrl}/uploads/evidence/${fileName}`;
              response = await fetch(filenameUrl);
              
              if (!response.ok) {
                // Approach 3: Try legacy upload API endpoint
                const uploadApiUrl = `/api/upload/${encodeURIComponent(fileName)}`;
                response = await fetch(uploadApiUrl);
                
                if (!response.ok) {
                  throw new Error(`File "${file.fileName}" not found on server`);
                }
              }
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.fileName || fileName || 'evidence-file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          } catch (fetchError) {
            throw new Error(`Failed to download legacy file: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
          }
          onSuccess?.();
          return;
        }
      }
      
      // Handle new format files (with ID)
      if (file.id && file.fileName && !file.id.startsWith('legacy-')) {
        const downloadUrl = `/api/documents/${file.id}/download`;
        const fileName = file.fileName;
        
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`File "${fileName}" not found in database`);
          } else {
            throw new Error(`Failed to download file "${fileName}" (Status: ${response.status})`);
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        onSuccess?.();
        return;
      }
      
      // Handle direct file URLs (legacy)
      if (fileUrl) {
        if (fileUrl.startsWith('http')) {
          window.open(fileUrl, '_blank');
          onSuccess?.();
          return;
        } else {
          const url = `${window.location.origin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
          window.open(url, '_blank');
          onSuccess?.();
          return;
        }
      }
      
      throw new Error('Invalid file format for download');
    } catch (error) {
      console.error('Evidence download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      onError?.(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const isImage = file.fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName);
  const isAudio = file.fileType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|webm)$/i.test(file.fileName);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Mengunduh...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          {isImage && "Unduh Gambar"}
          {isAudio && "Unduh Audio"}
          {!isImage && !isAudio && "Unduh File"}
        </>
      )}
    </Button>
  );
}

/**
 * Report Download Component
 * Specialized component for downloading reports as PDF
 */

interface ReportDownloadProps {
  /** Report ID */
  reportId: string;
  /** Report number for filename */
  reportNumber?: string;
  /** Download variant */
  variant?: "default" | "outline" | "ghost" | "destructive";
  /** Button size */
  size?: "sm" | "default" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Success callback */
  onSuccess?: () => void;
  /** Error callback */
  onError?: (error: string) => void;
}

export function ReportDownload({
  reportId,
  reportNumber,
  variant = "outline",
  size = "sm",
  className = "",
  onSuccess,
  onError
}: ReportDownloadProps) {
  return (
    <DownloadButton
      url={`/api/reports/${reportId}/download`}
      filename={`laporan-${reportNumber || reportId}.pdf`}
      variant={variant}
      size={size}
      className={className}
      onSuccess={onSuccess}
      onError={onError}
    >
      Unduh Laporan PDF
    </DownloadButton>
  );
}

/**
 * Investigation Result PDF Download Component
 */

interface InvestigationResultDownloadProps {
  /** Report ID */
  reportId: string;
  /** Investigation result ID */
  resultId: string;
  /** Report number for filename */
  reportNumber?: string;
  /** Download variant */
  variant?: "default" | "outline" | "ghost" | "destructive";
  /** Button size */
  size?: "sm" | "default" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Success callback */
  onSuccess?: () => void;
  /** Error callback */
  onError?: (error: string) => void;
}

export function InvestigationResultDownload({
  reportId,
  resultId,
  reportNumber,
  variant = "outline",
  size = "sm",
  className = "",
  onSuccess,
  onError
}: InvestigationResultDownloadProps) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const filename = `berita-acara-${reportNumber || reportId}-${resultId.substring(0, 8)}-${dateStr}-${timeStr}.pdf`;

  return (
    <DownloadButton
      url={`/api/reports/${reportId}/results/${resultId}/pdf`}
      filename={filename}
      variant={variant}
      size={size}
      className={className}
      onSuccess={onSuccess}
      onError={onError}
      loadingText="Membuat PDF..."
      showLoadingText={true}
    >
      Unduh PDF Berita Acara
    </DownloadButton>
  );
}