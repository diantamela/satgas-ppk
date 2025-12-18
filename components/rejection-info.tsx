"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RejectionInfoProps {
  rejectionReason: string;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export function RejectionInfo({ 
  rejectionReason, 
  className = "", 
  showIcon = true, 
  compact = false 
}: RejectionInfoProps) {
  if (!rejectionReason) return null;

  if (compact) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 ${className}`}>
        <div className="flex items-start gap-2">
          {showIcon && <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />}
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Alasan Penolakan
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
              {rejectionReason}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Alert className={`border-red-500 bg-red-50 dark:bg-red-900/20 ${className}`}>
      {showIcon && <AlertTriangle className="h-4 w-4 text-red-600" />}
      <AlertDescription className="text-red-800 dark:text-red-200">
        <div className="font-medium mb-1">Laporan Ini Ditolak</div>
        <div className="text-sm whitespace-pre-line">{rejectionReason}</div>
      </AlertDescription>
    </Alert>
  );
}