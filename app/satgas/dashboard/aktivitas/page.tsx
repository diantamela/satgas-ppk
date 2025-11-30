"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  FileText, 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  User,
  Shield,
  Building,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Calendar as CalendarIcon,
  MessageSquare,
  Settings,
  Gavel,
  Users,
  BookOpen
} from "lucide-react";
import { RoleGuard } from "../../../../components/auth/role-guard";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface ActivityItem {
  id: string;
  type: 'notification' | 'activity_log' | 'report_timeline' | 'report' | 'investigation' | 'recommendation';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  userName: string;
  userRole: string;
  entityId?: string;
  entityType?: string;
  details?: any;
}

interface ActivityDetailModalProps {
  activity: ActivityItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function ActivityDetailModal({ activity, isOpen, onClose }: ActivityDetailModalProps) {
  if (!isOpen || !activity) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'notification':
        return <Bell className="w-4 h-4" />;
      case 'activity_log':
        return <Settings className="w-4 h-4" />;
      case 'report_timeline':
        return <Clock className="w-4 h-4" />;
      case 'report':
        return <FileText className="w-4 h-4" />;
      case 'investigation':
        return <Search className="w-4 h-4" />;
      case 'recommendation':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SATGAS':
        return <Shield className="w-4 h-4" />;
      case 'REKTOR':
        return <Building className="w-4 h-4" />;
      case 'USER':
        return <User className="w-4 h-4" />;
      case 'CONTACT':
        return <MessageSquare className="w-4 h-4" />;
      case 'SYSTEM':
        return <Settings className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string, type: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Tertunda',
      'verified': 'Terverifikasi',
      'scheduled': 'Terjadwal',
      'in_progress': 'Berlangsung',
      'completed': 'Selesai',
      'rejected': 'Ditolak',
      'read': 'Dibaca',
      'unread': 'Belum Dibaca',
      'planned': 'Direncanakan',
      'cancelled': 'Dibatalkan',
      'submitted': 'Dikirim',
      'approved': 'Disetujui',
      'implemented': 'Dilaksanakan',
      'draft': 'Draft',
      'published': 'Dipublikasikan',
      'archived': 'Diarsipkan'
    };

    const translatedStatus = statusMap[status.toLowerCase()] || status;
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    if (['completed', 'approved', 'published'].includes(status.toLowerCase())) {
      variant = "default";
    } else if (['rejected', 'cancelled'].includes(status.toLowerCase())) {
      variant = "destructive";
    } else if (['pending', 'unread', 'draft'].includes(status.toLowerCase())) {
      variant = "secondary";
    }

    return <Badge variant={variant}>{translatedStatus}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      'notification': 'Konsultasi',
      'activity_log': 'Aktivitas Sistem',
      'report_timeline': 'Timeline Laporan',
      'report': 'Laporan',
      'investigation': 'Investigasi',
      'recommendation': 'Rekomendasi'
    };

    const translatedType = typeMap[type] || type;
    return <Badge variant="outline">{translatedType}</Badge>;
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role display text
  const getRoleText = (role: string) => {
    const roleMap: Record<string, string> = {
      'SATGAS': 'Satgas',
      'REKTOR': 'Rektor',
      'USER': 'User',
      'CONTACT': 'Kontak',
      'SYSTEM': 'Sistem'
    };

    return roleMap[role.toUpperCase()] || role;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                {getActivityIcon(activity.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detail Aktivitas
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(activity.timestamp)}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Main Info */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Judul:</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {activity.title}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Deskripsi:</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {activity.description}
                </p>
              </div>
            </div>
            
            {/* Activity Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Jenis:</span>
                <div className="mt-1">
                  {getTypeBadge(activity.type)}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Status:</span>
                <div className="mt-1">
                  {getStatusBadge(activity.status, activity.type)}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">User:</span>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleIcon(activity.userRole)}
                  <span className="text-gray-600 dark:text-gray-400">
                    {activity.userName} ({getRoleText(activity.userRole)})
                  </span>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Waktu:</span>
                <div className="mt-1">
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDateTime(activity.timestamp)}
                  </p>
                </div>
              </div>
              {activity.entityId && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-900 dark:text-white">Entity ID:</span>
                  <div className="mt-1">
                    <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                      {activity.entityId}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details */}
            {activity.details && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detail Tambahan:</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-gray-700 dark:text-gray-300 text-sm overflow-x-auto">
                    {JSON.stringify(activity.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AktivitasPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState("all");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const limit = 20;

  // Fetch activities from API
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(activityTypeFilter !== 'all' && { type: activityTypeFilter }),
        ...(userRoleFilter !== 'all' && { userRole: userRoleFilter }),
        ...(selectedDateRange?.from && { dateFrom: format(selectedDateRange.from, 'yyyy-MM-dd') }),
        ...(selectedDateRange?.to && { dateTo: format(selectedDateRange.to, 'yyyy-MM-dd') }),
      });

      const response = await fetch(`/api/activities?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setActivities(result.data.activities);
        setTotalPages(result.data.pagination.totalPages);
        setTotalActivities(result.data.pagination.total);
      } else {
        setError(result.message || 'Gagal mengambil aktivitas');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Terjadi kesalahan saat mengambil aktivitas');
    } finally {
      setLoading(false);
    }
  };



  // Load activities on component mount and when filters change
  useEffect(() => {
    fetchActivities();
  }, [currentPage, searchTerm, activityTypeFilter, userRoleFilter, selectedDateRange]);

  // Mark activity as read
  const markActivityAsRead = async (activity: ActivityItem) => {
    if (activity.type === 'notification' && activity.status === 'unread') {
      try {
        const response = await fetch('/api/activities', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activityId: activity.id,
            markAsRead: true
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          // Update local state
          setActivities(prevActivities => 
            prevActivities.map(act => 
              act.id === activity.id 
                ? { ...act, status: 'read' }
                : act
            )
          );
        }
      } catch (error) {
        console.error('Error marking activity as read:', error);
      }
    }
  };

  // Open activity detail modal
  const openActivityDetail = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
    
    // Mark as read when opened
    markActivityAsRead(activity);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'notification':
        return <Bell className="w-4 h-4" />;
      case 'activity_log':
        return <Settings className="w-4 h-4" />;
      case 'report_timeline':
        return <Clock className="w-4 h-4" />;
      case 'report':
        return <FileText className="w-4 h-4" />;
      case 'investigation':
        return <Search className="w-4 h-4" />;
      case 'recommendation':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Get activity type color
  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'notification':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'activity_log':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      case 'report_timeline':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'report':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'investigation':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'recommendation':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SATGAS':
        return <Shield className="w-3 h-3" />;
      case 'REKTOR':
        return <Building className="w-3 h-3" />;
      case 'USER':
        return <User className="w-3 h-3" />;
      case 'CONTACT':
        return <MessageSquare className="w-3 h-3" />;
      case 'SYSTEM':
        return <Settings className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SATGAS':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'REKTOR':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      case 'USER':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'CONTACT':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'SYSTEM':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  // Format date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role display text
  const getRoleText = (role: string) => {
    const roleMap: Record<string, string> = {
      'SATGAS': 'Satgas',
      'REKTOR': 'Rektor',
      'USER': 'User',
      'CONTACT': 'Kontak',
      'SYSTEM': 'Sistem'
    };

    return roleMap[role.toUpperCase()] || role;
  };

  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="flex sm:hidden" />
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Aktivitas
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Semua aktivitas dan notifikasi dalam sistem ({totalActivities} total)
              </p>
            </div>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            variant="outline"
            onClick={fetchActivities}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari aktivitas berdasarkan judul, deskripsi, atau user..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select 
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                  value={activityTypeFilter}
                  onChange={(e) => {
                    setActivityTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Semua Jenis</option>
                  <option value="notification">Konsultasi</option>
                  <option value="activity_log">Aktivitas Sistem</option>
                  <option value="report_timeline">Timeline Laporan</option>
                  <option value="report">Laporan</option>
                  <option value="investigation">Investigasi</option>
                  <option value="recommendation">Rekomendasi</option>
                </select>
                
                <select 
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Semua Role</option>
                  <option value="USER">User</option>
                  <option value="SATGAS">Satgas</option>
                  <option value="REKTOR">Rektor</option>
                </select>

                {/* Date Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[280px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDateRange?.from ? (
                        selectedDateRange.to ? (
                          <>
                            {format(selectedDateRange.from, "dd MMM yyyy", { locale: id })} -{" "}
                            {format(selectedDateRange.to, "dd MMM yyyy", { locale: id })}
                          </>
                        ) : (
                          format(selectedDateRange.from, "dd MMM yyyy", { locale: id })
                        )
                      ) : (
                        <span>Pilih rentang tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={selectedDateRange?.from}
                      selected={selectedDateRange}
                      onSelect={(range) => {
                        setSelectedDateRange(range);
                        setCurrentPage(1);
                      }}
                      numberOfMonths={2}
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setActivityTypeFilter("all");
                    setUserRoleFilter("all");
                    setSelectedDateRange(undefined);
                    setCurrentPage(1);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Memuat aktivitas...</h3>
                <p className="text-gray-500 dark:text-gray-400">Mohon tunggu sebentar</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Error</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                <Button onClick={fetchActivities} variant="outline">
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          ) : activities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Tidak ada aktivitas</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Belum ada aktivitas yang ditemukan.
                </p>
              </CardContent>
            </Card>
          ) : (
            activities.map((activity) => (
              <Card 
                key={activity.id} 
                className={`hover:shadow-md transition-shadow ${
                  activity.type === 'notification' && activity.status === 'unread' 
                    ? 'bg-gray-100 dark:bg-gray-800' 
                    : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getActivityTypeColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                              {activity.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                              {activity.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                {getRoleIcon(activity.userRole)}
                                <span>{activity.userName}</span>
                              </div>
                              <span>•</span>
                              <span>{formatDate(activity.timestamp)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className={getRoleColor(activity.userRole)}>
                              {getRoleText(activity.userRole)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openActivityDetail(activity)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Activity Detail Modal */}
        <ActivityDetailModal
          activity={selectedActivity}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </RoleGuard>
  );
}