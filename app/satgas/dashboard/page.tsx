"use client";
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
  Gavel
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import Link from "next/link";

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
const recentActivities = [
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



  // --- Perbaikan Error 17008 ---
  // Periksa penutupan div utama sebelum Modal

  return (
    <RoleGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Satgas</h1>
<p className="text-gray-600 dark:text-gray-400">Ringkasan aktivitas dan manajemen Satgas PPK</p>
            </div>
<Button asChild className="mt-4 md:mt-0">
  <Link href="/satgas/dashboard/laporan">
    <FileText className="w-4 h-4 mr-2" />
    Laporan Baru
  </Link>
</Button>
          </div>

{/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardDescription>Total Laporan</CardDescription>
      <FileText className="w-5 h-5 text-blue-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{dashboardStats.totalReports}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Laporan yang masuk</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardDescription>Investigasi Aktif</CardDescription>
      <Clock className="w-5 h-5 text-yellow-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{dashboardStats.pendingInvestigations}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Sedang dalam proses</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardDescription>Selesai</CardDescription>
      <CheckCircle className="w-5 h-5 text-green-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{dashboardStats.completedInvestigations}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Investigasi selesai</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardDescription>Notifikasi</CardDescription>
      <MessageSquare className="w-5 h-5 text-purple-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{dashboardStats.activeNotifications}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Pesan belum dibaca</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardDescription>Dokumen</CardDescription>
      <FolderOpen className="w-5 h-5 text-indigo-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{dashboardStats.totalDocuments}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Dokumen tersimpan</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardDescription>Rekomendasi</CardDescription>
      <Gavel className="w-5 h-5 text-orange-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{dashboardStats.pendingRecommendations}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Menunggu keputusan</p>
    </CardContent>
  </Card>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
  {/* Recent Activities */}
  <div className="lg:col-span-2">
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <Button variant="outline" size="sm">
            Lihat Semua
          </Button>
        </div>
        <CardDescription>Aktivitas terbaru dalam sistem Satgas PPK</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center">
                <div className={`bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg mr-4 ${
                  activity.type === 'report' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  activity.type === 'investigation' ? 'bg-green-100 dark:bg-green-900/20' :
                  'bg-purple-100 dark:bg-purple-900/20'
                }`}>
                  {activity.type === 'report' && <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  {activity.type === 'investigation' && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  {activity.type === 'notification' && <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                </div>
                <div>
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{activity.timestamp}</p>
                <Badge variant={activity.status === 'pending' ? 'secondary' : activity.status === 'completed' ? 'success' : 'outline'}>
                  {activity.status === 'pending' ? 'Pending' : activity.status === 'completed' ? 'Selesai' : 'Unread'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Quick Actions */}
  <div>
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
        <CardDescription>Akses cepat ke fitur utama</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <Button variant="outline" asChild>
            <Link href="/satgas/dashboard/laporan">
              <FileText className="w-4 h-4 mr-2" />
              Kelola Laporan
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/satgas/dashboard/investigasi">
              <Shield className="w-4 h-4 mr-2" />
              Investigasi
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/satgas/dashboard/dokumen">
              <FolderOpen className="w-4 h-4 mr-2" />
              Dokumen
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/satgas/dashboard/rekomendasi">
              <Gavel className="w-4 h-4 mr-2" />
              Rekomendasi
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/satgas/dashboard/notifikasi">
              <MessageSquare className="w-4 h-4 mr-2" />
              Notifikasi
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/user-roles">
              <Users className="w-4 h-4 mr-2" />
              Kelola Anggota
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

        </div> {/* Penutup div className="max-w-7xl mx-auto" */}

    </div> {/* Penutup div className="min-h-screen..." */}
    </RoleGuard>
  );
}