// Prisma client export for database operations
import { prisma } from '@/lib/database/prisma';

// Export the Prisma client instance
export const db = prisma;

// Also export as default for compatibility
export default prisma;