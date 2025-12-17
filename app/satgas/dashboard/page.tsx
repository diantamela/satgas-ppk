"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  FileText,
  Clock,
  CheckCircle,
  MessageSquare,
  FolderOpen,
  Gavel,
  Bell,
  ListChecks,
  Activity as ActivityIcon,
  AlertTriangle,
  Search,   
  Settings,
  BookOpen,
  Eye,
  EyeOff,
  MessageSquare as MessageSquareIcon,
  Building,
  User,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Definisikan Tipe Data untuk Aktivitas
interface Activity {
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

// Dashboard utama untuk Satuan Tugas PPK
export default function SatuanTugasPPK() {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for dashboard stats (you can fetch real data later)
  const dashboardStats = {
    totalReports: 47,
    pendingInvestigations: 12,
    completedInvestigations: 23,
    activeNotifications: 5,
    totalDocuments: 89,
    pendingRecommendations: 8
  };

  // Fetch today's activities from API
  const fetchTodayActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get today's date range in Asia/Jakarta timezone
      const now = new Date();
      // Get Asia/Jakarta timezone offset (UTC+7)
      const jakartaOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
      const jakartaTime = new Date(now.getTime() + jakartaOffset);
      const todayStart = format(jakartaTime, 'yyyy-MM-dd');
      const todayEnd = format(jakartaTime, 'yyyy-MM-dd');

      console.log('Dashboard fetching today activities for Jakarta timezone:', { todayStart, todayEnd });

      const params = new URLSearchParams({
        page: '1',
        limit: '5',
        dateFrom: todayStart,
        dateTo: todayEnd,
      });

      const response = await fetch(`/api/activities?${params}`);
      const result = await response.json();

      if (result.success) {
        setRecentActivities(result.data.activities || []);
      } else {
        setError(result.message || 'Gagal mengambil aktivitas');
        setRecentActivities([]);
      }
    } catch (err) {
      console.error('Error fetching today activities:', err);
      setError('Terjadi kesalahan saat mengambil aktivitas');
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Load today's activities on component mount
  useEffect(() => {
    fetchTodayActivities();
  }, []);

  // Fungsi untuk mendapatkan varian badge yang sesuai
  const getBadgeVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (['completed', 'approved', 'published'].includes(normalizedStatus)) {
      return 'default';
    } else if (['rejected', 'cancelled'].includes(normalizedStatus)) {
      return 'destructive';
    } else if (['pending', 'unread', 'draft'].includes(normalizedStatus)) {
      return 'secondary';
    }
    return 'outline';
  };

  // Fungsi untuk mendapatkan ikon berdasarkan tipe aktivitas
  const getActivityIcon = (type: Activity['type']) => {
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
        return <ActivityIcon className="w-4 h-4" />;
    }
  };

  // Fungsi untuk mendapatkan warna ikon dan latar belakang
  const getIconStyle = (type: Activity['type']) => {
    switch (type) {
      case 'notification':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          text: 'text-purple-600 dark:text-purple-400'
        };
      case 'activity_log':
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-600 dark:text-gray-400'
        };
      case 'report_timeline':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'report':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-600 dark:text-blue-400'
        };
      case 'investigation':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          text: 'text-orange-600 dark:text-orange-400'
        };
      case 'recommendation':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-600 dark:text-green-400'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-400'
        };
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
        return <MessageSquareIcon className="w-3 h-3" />;
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

  // Get status badge text
  const getStatusText = (status: string) => {
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

    return statusMap[status.toLowerCase()] || status;
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
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header Dashboard */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="flex sm:hidden" />
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard Satuan Tugas
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Ringkasan aktivitas dan manajemen Satuan Tugas PPK
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Total Laporan */}
          <Link href="/satgas/dashboard/laporan">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-medium">Total Laporan</CardDescription>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalReports}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Laporan yang masuk</p>
              </CardContent>
            </Card>
          </Link>

          {/* Investigasi Aktif */}
          <Link href="/satgas/dashboard/investigasi">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-yellow-200 dark:hover:border-yellow-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-medium">Investigasi Aktif</CardDescription>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.pendingInvestigations}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sedang dalam proses</p>
              </CardContent>
            </Card>
          </Link>

          {/* Investigasi Selesai */}
          <Link href="/satgas/dashboard/investigasi">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-green-200 dark:hover:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-medium">Investigasi Selesai</CardDescription>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.completedInvestigations}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Kasus ditutup</p>
              </CardContent>
            </Card>
          </Link>

          {/* Konsultasi */}
          <Link href="/satgas/dashboard/konsultasi">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-medium">Konsultasi Baru</CardDescription>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.activeNotifications}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pesan belum dibaca</p>
              </CardContent>
            </Card>
          </Link>

          {/* Total Dokumen */}
          <Link href="/satgas/dashboard/dokumen">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-medium">Total Dokumen</CardDescription>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalDocuments}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dokumen tersimpan</p>
              </CardContent>
            </Card>
          </Link>

          {/* Rekomendasi Tertunda */}
          <Link href="/satgas/dashboard/rekomendasi">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-medium">Rekomendasi Tertunda</CardDescription>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <ListChecks className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.pendingRecommendations}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Menunggu persetujuan</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <CardTitle className="text-lg">Aktivitas Terbaru (Hari Ini)</CardTitle>
                  <CardDescription>Aktivitas terbaru dalam sistem Satuan Tugas PPK hari ini</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchTodayActivities} disabled={loading}>
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                    <Link href="/satgas/dashboard/aktivitas">
                      Lihat Semua
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-700">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Memuat aktivitas...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                    <Button onClick={fetchTodayActivities} variant="outline" size="sm">
                      Coba Lagi
                    </Button>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <ActivityIcon className="w-12 h-12 mx-auto mb-4" />
                    <p>Tidak ada aktivitas hari ini.</p>
                  </div>
                ) : (
                  recentActivities.map((activity) => {
                    const iconStyle = getIconStyle(activity.type);
                    return (
                      <div
                        key={activity.id}
                        className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                          activity.type === 'notification' && activity.status === 'unread' 
                            ? 'bg-gray-100 dark:bg-gray-800' 
                            : ''
                        }`}
                      >
                        <div className={`${iconStyle.bg} p-2 rounded-lg flex-shrink-0`}>
                          <div className={iconStyle.text}>
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <h3 className="font-medium text-sm truncate">{activity.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 sm:ml-auto">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {activity.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              {getRoleIcon(activity.userRole)}
                              <span>{activity.userName}</span>
                            </div>
                            <span>•</span>
                            <Badge variant="outline" className={`text-xs ${getRoleColor(activity.userRole)}`}>
                              {getRoleText(activity.userRole)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge 
                            variant={getBadgeVariant(activity.status)} 
                            className="min-w-[70px] justify-center text-xs"
                          >
                            {getStatusText(activity.status)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}