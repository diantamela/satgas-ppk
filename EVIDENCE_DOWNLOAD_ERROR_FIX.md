# Evidence Download Error Fix

## Issue Description
Console error was showing "Download failed: {}" when attempting to download evidence files from the laporan detail page. This occurred in the `handleViewEvidence` function at line 236.

## Root Cause
The error handling in `handleViewEvidence` function assumed all error responses from the API would be valid JSON with the expected structure. However, the API might return:
- Empty responses
- Non-JSON responses
- JSON responses without the expected `message` field

## Solution Applied

### Before (Problematic Code)
```javascript
} else {
  const errorData = await response.json();
  console.error('Download failed:', errorData);
  setAlertMessage({ type: 'error', message: errorData.message || 'Gagal mengunduh file' });
  setTimeout(() => setAlertMessage(null), 3000);
}
```

### After (Fixed Code)
```javascript
} else {
  try {
    const errorData = await response.json();
    console.error('Download failed:', errorData);
    setAlertMessage({
      type: 'error',
      message: errorData.message || errorData.error?.message || `Gagal mengunduh file (HTTP ${response.status})`
    });
  } catch (parseError) {
    // If JSON parsing fails, handle as plain text or unknown error
    console.error('Download failed (non-JSON response):', response.status, response.statusText);
    setAlertMessage({
      type: 'error',
      message: `Gagal mengunduh file (HTTP ${response.status})`
    });
  }
  setTimeout(() => setAlertMessage(null), 3000);
}
```

## Key Improvements

1. **Robust JSON Parsing**: Wrapped `response.json()` in try-catch to handle parsing failures
2. **Multiple Error Message Sources**: Check for `errorData.message`, `errorData.error?.message`, and fall back to HTTP status
3. **Better Error Logging**: Separate logging for JSON vs non-JSON response failures
4. **User-Friendly Messages**: Show HTTP status code when specific error message is unavailable

## Files Modified
- `app/satgas/dashboard/laporan/[id]/page.tsx` - Fixed `handleViewEvidence` function error handling

## Testing Recommendations
1. Test evidence file downloads with valid files
2. Test evidence file downloads with missing files (404 errors)
3. Test evidence file downloads with unauthorized access (403 errors)
4. Test with various network error conditions
5. Verify console logs show meaningful error information

## Additional Notes
- The API endpoint (`/api/documents/[id]/download`) uses `DownloadService.formatErrorResponse()` which returns proper JSON error responses
- The fix ensures graceful handling of edge cases where responses might be malformed or empty
- Similar improvements could be applied to other download functions in the codebase if needed