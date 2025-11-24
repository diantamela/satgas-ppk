"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import Link from "next/link";

// Definisikan Tipe Data untuk Aktivitas
interface Activity {
  id: number;
  type: 'report' | 'investigation' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'unread';
}

// Dashboard utama untuk Satgas PPK
export default function SatgasDashboardPage() {
  // Mock data for dashboard stats
  const dashboardStats = {
    totalReports: 47,
    pendingInvestigations: 12,
    completedInvestigations: 23,
    activeNotifications: 5,
    totalDocuments: 89,
    pendingRecommendations: 8
  };

  // Mock data for recent activities
  const recentActivities: Activity[] = [
    {
      id: 1,
      type: "report",
      title: "Laporan baru diterima",
      description: "SPPK-20241018-1005 - Dugaan bullying online",
      timestamp: "2024-10-18 14:30",
      status: "pending"
    },
    {
      id: 2,
      type: "investigation",
      title: "Investigasi selesai",
      description: "SPPK-20241015-2003 - Rekomendasi telah dibuat",
      timestamp: "2024-10-18 11:15",
      status: "completed"
    },
    {
      id: 3,
      type: "notification",
      title: "Notifikasi baru",
      description: "Pengingat: Rapat koordinasi Satgas hari ini",
      timestamp: "2024-10-18 09:00",
      status: "unread"
    }
  ];

  // Fungsi untuk mendapatkan varian badge yang sesuai
  const getBadgeVariant = (status: Activity['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'unread':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Fungsi untuk mendapatkan ikon berdasarkan tipe aktivitas
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'report':
        return <FileText className="w-4 h-4" />;
      case 'investigation':
        return <CheckCircle className="w-4 h-4" />;
      case 'notification':
        return <Bell className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Fungsi untuk mendapatkan warna ikon dan latar belakang
  const getIconStyle = (type: Activity['type']) => {
    switch (type) {
      case 'report':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-600 dark:text-blue-400'
        };
      case 'investigation':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-600 dark:text-green-400'
        };
      case 'notification':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          text: 'text-purple-600 dark:text-purple-400'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header Dashboard */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="sm:flex hidden" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard Satgas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Ringkasan aktivitas dan manajemen Satgas PPK
                </p>
              </div>
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

          {/* Notifikasi */}
          <Link href="/satgas/dashboard/notifikasi">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardDescription className="text-xs font-medium">Notifikasi Baru</CardDescription>
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
                  <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
                  <CardDescription>Aktivitas terbaru dalam sistem Satgas PPK</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <Link href="/satgas/dashboard/aktivitas">
                    Lihat Semua
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-700">
                {recentActivities.map((activity) => {
                  const iconStyle = getIconStyle(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
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
                            {activity.timestamp}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge 
                          variant={getBadgeVariant(activity.status)} 
                          className="min-w-[70px] justify-center text-xs"
                        >
                          {activity.status === 'pending' ? 'Tertunda' : 
                           activity.status === 'completed' ? 'Selesai' : 'Baru'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              {recentActivities.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada aktivitas terbaru.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}