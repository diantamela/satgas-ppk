"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  TrendingUp,
  Loader2,
  Play,
  Pause,
  Square,
} from "lucide-react";
import { reportFormStyles as styles } from '@/lib/styles/report-form-styles';

interface CurrentActivity {
  id: string;
  title: string;
  description: string;
  activityType: string;
  status: string;
  assignedTo?: string;
  priority: string;
  startedAt: string;
  estimatedCompletion?: string;
  notes?: string;
}

interface CompletedActivity {
  id: string;
  title: string;
  description: string;
  activityType: string;
  completedAt: string;
}

interface UpcomingActivity {
  id: string;
  title: string;
  description: string;
  activityType: string;
  priority: string;
  startedAt: string;
}

interface ActivitySummary {
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  progressPercentage: number;
  hasActiveWork: boolean;
}

interface CurrentActivityData {
  report: {
    id: string;
    reportNumber: string;
    title: string;
    status: string;
    assigneeName: string;
  };
  currentActivities: CurrentActivity[];
  recentCompletedActivities: CompletedActivity[];
  upcomingActivities: UpcomingActivity[];
  summary: ActivitySummary;
}

interface CurrentActivitySectionProps {
  reportId: string;
  className?: string;
}

export default function CurrentActivitySection({ 
  reportId, 
  className = "" 
}: CurrentActivitySectionProps) {
  const [activityData, setActivityData] = useState<CurrentActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reports/${reportId}/current-activities`);
      const result = await response.json();

      if (result.success) {
        setActivityData(result.data);
      } else {
        setError(result.message || 'Gagal memuat data aktivitas');
      }
    } catch (error) {
      console.error('Error fetching current activities:', error);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchCurrentActivities();
    }
  }, [reportId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'PAUSED':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CANCELLED':
        return <Square className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'IN_PROGRESS': { label: 'Sedang Berjalan', className: 'bg-blue-100 text-blue-800' },
      'PAUSED': { label: 'Ditunda', className: 'bg-yellow-100 text-yellow-800' },
      'COMPLETED': { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      'CANCELLED': { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
      'NOT_STARTED': { label: 'Belum Dimulai', className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['NOT_STARTED'];
    
    return (
      <Badge className={`${config.className} border-none text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'HIGH': { label: 'Tinggi', className: 'bg-red-100 text-red-800' },
      'MEDIUM': { label: 'Sedang', className: 'bg-yellow-100 text-yellow-800' },
      'LOW': { label: 'Rendah', className: 'bg-gray-100 text-gray-800' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['MEDIUM'];
    
    return (
      <Badge variant="outline" className={`${config.className} border text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (estimatedCompletion?: string) => {
    if (!estimatedCompletion) return null;
    
    const now = new Date();
    const estimated = new Date(estimatedCompletion);
    const diffMs = estimated.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Melewati batas waktu';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} hari lagi`;
    } else if (diffHours > 0) {
      return `${diffHours} jam lagi`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} menit lagi`;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Sedang Bekerja Sekarang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Memuat aktivitas...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Sedang Bekerja Sekarang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activityData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Sedang Bekerja Sekarang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-semibold">Belum ada aktivitas</p>
            <p className="text-sm mt-1">Aktivitas akan muncul ketika satgas mulai bekerja</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { currentActivities, recentCompletedActivities, upcomingActivities, summary } = activityData;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Sedang Bekerja Sekarang
          {summary.hasActiveWork && (
            <Badge className="bg-blue-500 text-white border-none">
              Aktif
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Aktivitas terkini yang dikerjakan oleh tim satgas terhadap laporan {activityData.report.reportNumber}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress Keseluruhan</span>
            <span className="text-sm text-gray-600">
              {summary.completedActivities}/{summary.totalActivities} selesai
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${summary.progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {summary.progressPercentage}%
            </span>
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {summary.inProgressActivities} sedang berjalan
            </span>
          </div>
        </div>

        {/* Current Activities */}
        {currentActivities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-500" />
              Aktivitas Sedang Berjalan
            </h4>
            {currentActivities.map((activity) => (
              <div
                key={activity.id}
                className="border border-blue-200 bg-blue-50/50 p-4 rounded-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(activity.status)}
                      <h5 className="font-semibold text-gray-900">{activity.title}</h5>
                      {getStatusBadge(activity.status)}
                      {getPriorityBadge(activity.priority)}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      {activity.assignedTo && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.assignedTo}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Dimulai: {formatTime(activity.startedAt)}
                      </span>
                      {activity.estimatedCompletion && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeRemaining(activity.estimatedCompletion)}
                        </span>
                      )}
                    </div>
                    {activity.notes && (
                      <div className="mt-2 p-2 bg-white/70 rounded text-xs text-gray-600">
                        <strong>Catatan:</strong> {activity.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Completed Activities */}
        {recentCompletedActivities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Aktivitas Baru Selesai
            </h4>
            <div className="space-y-2">
              {recentCompletedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  {getStatusIcon('COMPLETED')}
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{activity.title}</h5>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(activity.completedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Activities */}
        {upcomingActivities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Akan Datang
            </h4>
            <div className="space-y-2">
              {upcomingActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  {getStatusIcon('NOT_STARTED')}
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{activity.title}</h5>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    {getPriorityBadge(activity.priority)}
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTime(activity.startedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Activities Message */}
        {currentActivities.length === 0 && recentCompletedActivities.length === 0 && upcomingActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-semibold">Belum ada aktivitas</p>
            <p className="text-sm mt-1">Tim satgas akan segera memulai penanganan laporan ini</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}