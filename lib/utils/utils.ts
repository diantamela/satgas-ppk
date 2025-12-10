import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format datetime string for datetime-local input
 * Converts ISO datetime strings to the format expected by datetime-local inputs (yyyy-MM-ddThh:mm)
 */
export function formatDateTimeForInput(dateTimeString: string | Date | null | undefined): string {
  if (!dateTimeString) return '';
  
  const date = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
  if (isNaN(date.getTime())) return '';
  
  // Format as yyyy-MM-ddThh:mm (24-hour format for datetime-local)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parse datetime-local input value to ISO string
 * Converts datetime-local format (yyyy-MM-ddThh:mm) to ISO format for storage
 */
export function parseDateTimeFromInput(dateTimeString: string | null | undefined): string | null {
  if (!dateTimeString) return null;
  
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString();
  } catch (error) {
    console.error('Error parsing datetime from input:', error);
    return null;
  }
}

/**
 * Format datetime for display purposes
 */
export function formatDateTimeForDisplay(dateTimeString: string | Date | null | undefined): string {
  if (!dateTimeString) return '';
  
  const date = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  }).format(date);
}
