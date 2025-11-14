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
  type: 'report' | 'investigation' | 'notification'; // Definisikan tipe yang spesifik
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'unread'; // Definisikan status yang spesifik
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

  // Mock data for recent activities (menggunakan tipe Activity)
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
  const getBadgeVariant = (status: Activity['status']): "success" | "destructive" | "outline" | "default" | "secondary" => {
    switch (status) {
      case 'pending':
        return 'secondary'; // Menggunakan 'secondary' sebagai pengganti 'yellow'
      case 'completed':
        return 'success';
      case 'unread':
        return 'destructive'; // Menggunakan 'destructive' untuk highlight 'Baru'
      default:
        return 'outline';
    }
  };

  // Fungsi untuk mendapatkan ikon berdasarkan tipe aktivitas
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'report':
        return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'investigation':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'notification':
        return <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return null;
    }
  };

  // Fungsi untuk mendapatkan warna latar belakang ikon
  const getIconBgClass = (type: Activity['type']): string => {
    switch (type) {
      case 'report':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'investigation':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'notification':
        return 'bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 pt-0">
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b pb-4 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1 hidden sm:flex" />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" /> Dashboard Satgas
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ringkasan aktivitas dan manajemen Satgas PPK</p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Grid yang lebih padat di layar besar */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
          {/* Card 1: Total Laporan */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-sm">Total Laporan</CardDescription>
              <FileText className="w-6 h-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats.totalReports}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Laporan yang masuk</p>
            </CardContent>
          </Card>

          {/* Card 2: Investigasi Aktif */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-sm">Investigasi Aktif</CardDescription>
              <Clock className="w-6 h-6 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats.pendingInvestigations}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sedang dalam proses</p>
            </CardContent>
          </Card>

          {/* Card 3: Investigasi Selesai */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-sm">Investigasi Selesai</CardDescription>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats.completedInvestigations}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kasus ditutup</p>
            </CardContent>
          </Card>

          {/* Card 4: Notifikasi */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-sm">Notifikasi Baru</CardDescription>
              <Bell className="w-6 h-6 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats.activeNotifications}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pesan belum dibaca</p>
            </CardContent>
          </Card>

          {/* Card 5: Total Dokumen */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-sm">Total Dokumen</CardDescription>
              <FolderOpen className="w-6 h-6 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats.totalDocuments}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dokumen tersimpan</p>
            </CardContent>
          </Card>

          {/* Card 6: Rekomendasi Tertunda */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-sm">Rekomendasi Tertunda</CardDescription>
              <Gavel className="w-6 h-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats.pendingRecommendations}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Menunggu keputusan</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities - Kini mengambil lebar penuh (lg:grid-cols-1) */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="col-span-1"> {/* Memastikan Aktivitas Terbaru mengambil lebar penuh */}
            <Card>
              <CardHeader className="border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <CardTitle>Aktivitas Terbaru</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/satgas/dashboard/aktivitas">
                      Lihat Semua
                    </Link>
                  </Button>
                </div>
                <CardDescription>Aktivitas terbaru dalam sistem Satgas PPK</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y dark:divide-gray-700">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className={`${getIconBgClass(activity.type)} p-3 rounded-full mr-4 flex-shrink-0`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{activity.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{activity.description}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end ml-4 flex-shrink-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 hidden sm:block">{activity.timestamp}</p>
                        <Badge variant={getBadgeVariant(activity.status)} className="min-w-[70px] justify-center">
                          {activity.status === 'pending' ? 'Tertunda' : activity.status === 'completed' ? 'Selesai' : 'Baru'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {recentActivities.length === 0 && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">Tidak ada aktivitas terbaru.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
