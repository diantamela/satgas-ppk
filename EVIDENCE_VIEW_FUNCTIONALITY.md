# Evidence View Functionality Implementation

## Overview
Changed the evidence documentation functionality from "Unduh" (download) to "Lihat" (view/preview) as requested by the user.

## Changes Made

### 1. Button and UI Changes
- **Button Text**: Changed from "Unduh" to "Lihat"
- **Button Icon**: Changed from `Download` to `Eye` icon
- **Button Action**: Updated to call `handleViewEvidence` function

### 2. Function Behavior Updates
The `handleViewEvidence` function was updated with:
- Better console logging (changed from "download" to "view" terminology)
- Updated success message: "File berhasil dibuka"
- Updated error messages: "Gagal membuka file" instead of "Gagal mengunduh file"
- Maintained robust error handling for API failures

### 3. Error Handling Improvements
The function includes comprehensive error handling that:
- Attempts to parse JSON error responses
- Falls back to HTTP status codes when JSON parsing fails
- Provides meaningful error messages to users
- Logs detailed error information for debugging

## Files Modified
- `app/satgas/dashboard/laporan/[id]/page.tsx` - Updated button and function messaging

## User Experience
- **Before**: Users clicked "Unduh" to download evidence files
- **After**: Users click "Lihat" to view/open evidence files
- The underlying functionality still fetches and processes the file, but the UI now indicates "viewing" rather than "downloading"

## Technical Implementation
- Uses the same API endpoint (`/api/documents/[id]/download`)
- Maintains file blob processing and URL creation
- Preserves error handling improvements made earlier
- Updates all user-facing messages to reflect "view" functionality

## Testing Recommendations
1. Test evidence file viewing with valid files
2. Test evidence file viewing with missing files (404 errors)
3. Test evidence file viewing with unauthorized access (403 errors)
4. Verify console logs show "view" related messages
5. Verify user sees "File berhasil dibuka" on success
6. Verify user sees appropriate error messages on failures

## Additional Notes
- The terminology change improves user understanding of the action
- Users can still save files from the browser if needed
- The underlying API and file processing logic remains unchanged
- Error messages are now more contextually appropriate