import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Configuration for S3-compatible storage (like AWS S3, Supabase storage, etc.)
// Initialize only if environment variables are set
const s3Client = process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? 
  new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  }) : null;

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'satgas-ppk-evidence';

// Function to upload file to S3-compatible storage
export async function uploadFileToStorage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (!s3Client) {
    throw new Error('S3 configuration not found. Please set S3 environment variables.');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `evidence/${fileName}`,
    Body: fileBuffer,
    ContentType: contentType,
    Metadata: {
      uploadedAt: new Date().toISOString(),
    },
  });

  await s3Client.send(command);
  
  // Return the file path
  return `evidence/${fileName}`;
}

// Function to generate a signed URL for temporary file access (for downloads)
export async function generateSignedUrl(
  fileName: string,
  expiresIn: number = 3600 // 1 hour by default
): Promise<string> {
  if (!s3Client) {
    throw new Error('S3 configuration not found. Please set S3 environment variables.');
  }

  // The import needs to be inside function to avoid issues in Next.js
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `evidence/${fileName}`,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}

// Alternative implementation for local file storage (for development)
export async function saveLocalFile(
  fileBuffer: Buffer,
  originalName: string,
  uploadPath: string = './public/uploads'
): Promise<string> {
  // Note: For security reasons, in production you should:
  // 1. Store files outside of the public directory
  // 2. Use a more secure storage solution like S3
  // 3. Validate file contents, not just extensions

  // Create upload directory if it doesn't exist
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Sanitize filename for Windows compatibility
  const sanitizedName = originalName.replace(/[<>:"/\\|?*]/g, '_');
  const fileName = `${Date.now()}-${sanitizedName}`;
  const filePath = path.join(process.cwd(), uploadPath, fileName);

  // Write file to disk
  fs.writeFileSync(filePath, fileBuffer);

  // Return relative path from public directory
  // Assuming uploadPath starts with './public/' or 'public/', extract the path after 'public/'
  const relativePath = uploadPath.replace(/^(\.\/)?public\//, '');
  return `/${relativePath}/${fileName}`;
}

// Function to validate file upload (size, type, etc.)
export function validateFileUpload(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  size: number
): { isValid: boolean; error?: string } {
  // Check file size (max 10MB)
  if (size > 10 * 1024 * 1024) {
    return {
      isValid: false,
      error: 'File size exceeds 10MB limit',
    };
  }

  // Check file type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'video/mp4',
    'video/quicktime', // .mov files
  ];

  if (!allowedMimeTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: 'File type not allowed',
    };
  }

  // Additional security check: validate file signature
  const fileSignature = buffer.subarray(0, 4).toString('hex');
  
  // Common file signatures for allowed types
  const allowedSignatures = {
    'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2'],
    'image/png': ['89504e47'],
    'application/pdf': ['25504446'],
    'video/mp4': ['0000001866747970', '0000002066747970', '0000002866747970'],
    'video/quicktime': ['0000001466747970', '0000001866747970', '0000002066747970'],
  };

  const expectedSignatures = allowedSignatures[mimeType as keyof typeof allowedSignatures];
  if (expectedSignatures && !expectedSignatures.some(sig => fileSignature.startsWith(sig))) {
    return {
      isValid: false,
      error: 'File signature does not match declared type',
    };
  }

  return { isValid: true };
}

// Function to process file upload from Next.js API route
export async function processFileUpload(
  formData: FormData,
  folder: string = 'evidence'
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    // Get file from form data
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Validate file
    const validation = validateFileUpload(
      buffer,
      file.name,
      file.type,
      file.size
    );
    
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Generate a unique file name
    const extension = path.extname(file.name);
    const baseName = path.basename(file.name, extension).replace(/[<>:"/\\|?*]/g, '_');
    const uniqueFileName = `${baseName}-${Date.now()}${extension}`;
    
    // Choose storage method based on environment
    let filePath: string;
    
    if (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
      // Use S3 storage
      filePath = await uploadFileToStorage(buffer, uniqueFileName, file.type);
    } else {
      // Use local storage for development
      filePath = await saveLocalFile(buffer, uniqueFileName, `public/uploads/${folder}`);
    }

    return { success: true, filePath };
  } catch (error) {
    console.error('Error processing file upload:', error);
    return { success: false, error: 'Failed to process file upload' };
  }
}

// In a real implementation with Next.js API routes, you would handle multipart form data
// For now, we'll create a utility function that demonstrates how you might process uploads
export async function processEvidenceUploads(
  files: File[],
  reportId: number
): Promise<string[]> {
  const uploadedFilePaths: string[] = [];

  for (const file of files) {
    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Validate file
    const validation = validateFileUpload(
      buffer,
      file.name,
      file.type,
      file.size
    );
    
    if (!validation.isValid) {
      throw new Error(`Invalid file: ${validation.error}`);
    }

    // Generate a unique file name with report ID
    const extension = path.extname(file.name);
    const baseName = path.basename(file.name, extension).replace(/[<>:"/\\|?*]/g, '_');
    const uniqueFileName = `${reportId}-${baseName}-${Date.now()}${extension}`;
    
    // Choose storage method based on environment
    let filePath: string;
    
    if (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
      // Use S3 storage
      filePath = await uploadFileToStorage(buffer, uniqueFileName, file.type);
    } else {
      // Use local storage for development
      filePath = await saveLocalFile(buffer, uniqueFileName, 'public/uploads/evidence');
    }
    
    uploadedFilePaths.push(filePath);
  }

  return uploadedFilePaths;
}