# Document Download 404 Error - Troubleshooting Guide

## Issue Analysis

You encountered this error:
```
GET http://localhost:3000/api/documents/cmj78ojp60003kslae2jeli4i/download 404 (Not Found)
```

## Root Cause Investigation

I tested the API endpoint and found that the route is actually working correctly (returns 401 Unauthorized, not 404). This suggests the 404 error was likely due to one of these reasons:

### 1. **Document ID Doesn't Exist** ❌
The document ID `cmj78ojp60003kslae2jeli4i` may not exist in the database.

### 2. **Permission Issue** 🔒
The document exists but you don't have permission to access it.

### 3. **File Storage Issue** 💾
The document exists in the database but the actual file is missing from storage.

### 4. **Temporary Server Issue** ⚡
Brief connectivity or server restart occurred.

## How to Debug and Fix

### Step 1: Check Document Existence

I've created a debug endpoint to help identify the issue:

**API Endpoint:** `GET /api/debug/check-document/{id}`

**Example:**
```bash
curl -H "Cookie: session=your-session-token" \
     http://localhost:3000/api/debug/check-document/cmj78ojp60003kslae2jeli4i
```

This will return:
- Whether the document exists in the database
- File storage status
- Document metadata
- Permission information

### Step 2: Check File Storage

The API handles different storage types:

#### External Storage (URLs)
- If `storagePath` starts with `http`, it redirects to the external URL
- No local file check needed

#### Local Storage
- Files stored in `/uploads/` directory
- Check if file exists on disk
- Verify file permissions

### Step 3: Verify Database Records

Check the `InvestigationDocument` table:

```sql
SELECT 
  id,
  fileName,
  fileType,
  fileSize,
  storagePath,
  documentType,
  uploadedById,
  reportId,
  createdAt
FROM InvestigationDocument 
WHERE id = 'cmj78ojp60003kslae2jeli4i';
```

### Step 4: Check File System

If using local storage, verify the file exists:

```bash
# Check if file exists
ls -la uploads/cmj78ojp60003kslae2jeli4i*

# Check directory permissions
ls -la uploads/
```

## Common Solutions

### Solution 1: Document Doesn't Exist
**If document is missing from database:**
1. Check if it was accidentally deleted
2. Restore from backup if available
3. Re-upload the document if it's critical

### Solution 2: Permission Issues
**If user doesn't have access:**
1. Verify user role (must be SATGAS or REKTOR)
2. Check if document belongs to the correct report
3. Ensure user is assigned to the investigation

### Solution 3: File Storage Issues
**If file is missing from disk:**
1. Check upload process for errors
2. Verify file path in database matches actual location
3. Restore file from backup or re-upload

### Solution 4: API Route Issues
**If route is not working:**
1. Restart the development server
2. Check for TypeScript compilation errors
3. Verify route file structure is correct

## Enhanced Error Handling

I've improved the download API with better error messages:

### Current Error Responses:
- `401 Unauthorized` - User not logged in or insufficient permissions
- `404 Not Found` - Document ID doesn't exist
- `404 File not found` - Document exists but file is missing from storage
- `500 Internal Server Error` - Server processing error

### Improved Error Information:
The debug endpoint provides detailed information:
- Document existence status
- File storage status
- Permission details
- Storage path verification

## Prevention Measures

### 1. File Existence Validation
Before allowing document upload, validate that:
- File can be successfully written to storage
- Database record can be created
- User has proper permissions

### 2. Regular Health Checks
Implement periodic checks to verify:
- All documents in database have corresponding files
- File permissions are correct
- Storage space is available

### 3. Better User Feedback
Update the UI to show:
- Clear error messages when download fails
- Loading states during file operations
- Confirmation when files are successfully uploaded

## Testing the Fix

### Test 1: Document Existence
```bash
# Should return document details if exists
curl -H "Cookie: session=valid-session" \
     http://localhost:3000/api/debug/check-document/cmj78ojp60003kslae2jeli4i
```

### Test 2: Download Functionality
```bash
# Should return file or redirect to external URL
curl -H "Cookie: session=valid-session" \
     -I http://localhost:3000/api/documents/cmj78ojp60003kslae2jeli4i/download
```

### Test 3: Error Scenarios
```bash
# Should return 404 for non-existent document
curl -H "Cookie: session=valid-session" \
     http://localhost:3000/api/debug/check-document/non-existent-id
```

## Quick Resolution Steps

1. **Restart the development server**
   ```bash
   npm run dev
   ```

2. **Check if the document ID exists in the database**

3. **Verify file storage location and permissions**

4. **Test the debug endpoint for detailed information**

5. **Ensure user has proper role permissions**

## Next Steps

If the issue persists after trying these solutions:

1. Check the browser's developer console for additional errors
2. Verify network requests in the Network tab
3. Check server logs for detailed error information
4. Consider implementing file upload validation
5. Add more comprehensive error logging

The download functionality should work correctly once the underlying issue (document existence, permissions, or file storage) is resolved.