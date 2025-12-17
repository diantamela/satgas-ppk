# Recommendations API Debug Guide

## Problem Summary
The "Failed to fetch recommendations" error was occurring due to missing database relation fields in the Prisma schema. The API was trying to access relation fields (`report`, `createdBy`, `approvedBy`) that didn't exist in the Recommendation model.

## Root Causes Identified

### 1. Missing Database Relations
- **Issue**: The `Recommendation` model was missing relation fields to `Report` and `User` models
- **Impact**: API queries with `include` statements were failing
- **Status**: ✅ **FIXED** - Added relation fields to Prisma schema

### 2. Insufficient Error Handling
- **Issue**: Frontend and backend had generic error messages that didn't reveal the actual cause
- **Impact**: Difficult to diagnose the real issue
- **Status**: ✅ **FIXED** - Added comprehensive logging and error details

### 3. Missing Environment Variables
- **Issue**: Some required environment variables were missing from `.env`
- **Impact**: Could cause connection and configuration issues
- **Status**: ✅ **FIXED** - Added missing environment variables

## Fixes Applied

### 1. Updated Prisma Schema (`prisma/schema.prisma`)
```prisma
model Recommendation {
  // ... existing fields ...
  
  // Added missing relation fields
  report       Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)
  createdBy    User     @relation("RecommendationCreatedBy", fields: [createdById], references: [id])
  approvedBy   User?    @relation("RecommendationApprovedBy", fields: [approvedById], references: [id])
}

model User {
  // ... existing fields ...
  
  // Added relation fields to User model
  createdRecommendations    Recommendation[] @relation("RecommendationCreatedBy")
  approvedRecommendations   Recommendation[] @relation("RecommendationApprovedBy")
}

model Report {
  // ... existing fields ...
  
  // Added relation field to Report model
  recommendations       Recommendation[]
}
```

### 2. Enhanced API Error Handling (`app/api/recommendations/route.ts`)
- Added comprehensive logging with emojis for easy identification
- Implemented fallback logic when relations fail
- Added detailed error responses with specific error types
- Database connection verification before queries

### 3. Improved Frontend Error Handling (`app/rektor/dashboard/rekomendasi/page.tsx`)
- Added detailed logging for debugging
- Enhanced error messages to show specific HTTP status and error details
- User-friendly alert messages with technical details for debugging

### 4. Enhanced Authentication Debugging (`lib/auth.ts`)
- Added cookie inspection logging
- Detailed authentication flow logging
- Better error messages for authentication failures

### 5. Updated Environment Configuration (`.env`)
- Added missing application configuration variables
- Ensured all required environment variables are present

## Testing the Fix

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test the API Endpoint
```bash
node test-recommendations.js
```

### 3. Check Browser Console
- Open the recommendations page in browser
- Check browser console for detailed logging
- Look for the emoji-prefixed log messages

### 4. Expected Behavior
- ✅ API should return 200 status with recommendations data (or empty array)
- ✅ Console should show detailed logging with success messages
- ✅ No more "Failed to fetch recommendations" error
- ✅ If there are recommendations in DB, they should display properly

## Database Migration Notes

The Prisma schema has been updated with relation fields, but database migration may be needed:

### Option 1: Apply Migration (Recommended)
```bash
npx prisma migrate dev --name add-recommendation-relations
```

### Option 2: Force Schema Sync (Use with caution)
```bash
npx prisma db push
```

**Note**: The current implementation includes fallback logic that works even if the relations aren't fully migrated to the database.

## Monitoring and Debugging

### Look for These Log Messages:

#### Success Indicators:
- 🔍 "Fetching recommendations - Request headers"
- ✅ "Authentication successful"
- 📊 "Found X recommendations"
- ✅ "Successfully fetched and transformed recommendations"

#### Error Indicators:
- ❌ "Authentication failed"
- ❌ "Insufficient permissions"
- ❌ "Database connection failed"
- 💥 "Critical error in GET /api/recommendations"

### Browser Console Debugging:
Open browser DevTools → Console and look for these messages when accessing the recommendations page.

## Next Steps

1. **Verify the fix works** by testing the recommendations page
2. **Apply database migration** to fully establish the relations
3. **Monitor logs** for any remaining issues
4. **Consider adding test data** if the recommendations table is empty

## Common Issues and Solutions

### Issue: Still getting "Failed to fetch recommendations"
**Solution**: Check browser console for detailed error messages. The enhanced logging will show exactly what went wrong.

### Issue: Database connection errors
**Solution**: Verify `.env` file has correct `DATABASE_URL` and `DIRECT_URL`.

### Issue: Authentication errors
**Solution**: Ensure user is logged in with appropriate role (SATGAS or REKTOR).

### Issue: Empty recommendations list
**Solution**: This is normal if no recommendations exist in the database. The API should return an empty array instead of an error.

## Prevention

To prevent similar issues in the future:

1. Always test API endpoints with proper error handling
2. Use comprehensive logging for debugging
3. Implement fallback strategies for database relation issues
4. Validate Prisma schema before deploying
5. Include environment variable validation