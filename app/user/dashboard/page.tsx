"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, FileText, Clock, CheckCircle, Eye, Plus, AlertTriangle, MessageSquare, BookOpen, Phone, Settings, Bell, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth/auth-client";
import { reportFormStyles as styles } from '@/lib/styles/report-form-styles';

export default function UserDashboardPage() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userStats, setUserStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    unreadMessages: 0
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Fetch user reports and stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      try {
        const reportsResponse = await fetch(`/api/reports?reporterId=${session.user.id}`);
        const reportsData = await reportsResponse.json();

        if (reportsData.success) {
          const reports = reportsData.reports;
          reports.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          setRecentReports(reports.slice(0, 5)); 

          // Calculate stats
          const totalReports = reports.length;
          const pendingReports = reports.filter((r: any) => r.status === 'PENDING' || r.status === 'IN_PROGRESS' || r.status === 'VERIFIED').length;
          const completedReports = reports.filter((r: any) => r.status === 'COMPLETED').length;

          setUserStats({
            totalReports,
            pendingReports,
            resolvedReports: completedReports,
            unreadMessages: 0 
          });
        }

        setProfileData({
          name: session.user.name || 'N/A',
          email: session.user.email || 'N/A',
          role: session.user.role || 'USER',
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500 text-white">Menunggu Verifikasi</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500 text-white">Sedang Ditangani</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500 text-white">Selesai</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "VERIFIED":
        return <Badge className="bg-purple-500 text-white">Terverifikasi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgress = (report: any) => {
    return report.investigationProgress || 0;
  };

  return (
    <RoleGuard requiredRoles={['USER']}>
      <div className={styles.root}>
        <div className={styles.wrap}>
          <div className={styles.topbar}>
            SISTEM INFORMASI PENGADUAN SATGAS PPKS
          </div>
          {/* Header Dashboard */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="flex sm:hidden" />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                  Selamat Datang Kembali{profileData?.name ? `, ${profileData.name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Kelola laporan dan akses layanan dukungan Satgas PPK UIN Imam Bonjol</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              {/* Konsultasi */}
              <Button variant="outline" size="sm" className="border-red-500 text-red-600 hover:bg-red-50">
                <Bell className="w-4 h-4 mr-2" />
                Konsultasi ({userStats.unreadMessages})
              </Button>
              {/* Pengaturan */}
              <Button variant="outline" size="sm" asChild className="border-red-500 text-red-600 hover:bg-red-50">
                <Link href="/user/settings" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Pengaturan
                </Link>
              </Button>
              {/* Keluar */}
              <Button
                variant="default"
                style={{ background: "#A13D3D", color: "#E9B44C" }}
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isSigningOut ? "Keluar..." : "Keluar"}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Laporan */}
            <Card className="border-l-4 border-l-red-600 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-red-600 font-semibold">Total Laporan</CardDescription>
                <FileText className="w-5 h-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{userStats.totalReports}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Laporan yang telah diajukan</p>
              </CardContent>
            </Card>

            {/* Sedang Diproses */}
            <Card className="border-l-4 border-l-amber-500 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-amber-600 font-semibold">Sedang Diproses</CardDescription>
                <Clock className="w-5 h-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{userStats.pendingReports}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Menunggu/sedang ditangani</p>
              </CardContent>
            </Card>

            {/* Selesai */}
            <Card className="border-l-4 border-l-green-600 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-green-600 font-semibold">Selesai</CardDescription>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{userStats.resolvedReports}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Telah ditangani & diselesaikan</p>
              </CardContent>
            </Card>

            {/* Pesan */}
            <Card className="border-l-4 border-l-purple-600 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-purple-600 font-semibold">Pesan Baru</CardDescription>
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{userStats.unreadMessages}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pesan/notifikasi belum dibaca</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg dark:bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">Aktivitas Laporan Terbaru</CardTitle>
                  <Button variant="outline" size="sm" asChild className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                    <Link href="/user/cek-status">
                      Lihat Semua ({userStats.totalReports})
                    </Link>
                  </Button>
                </div>
                <CardDescription>Lima laporan terakhir yang telah Anda ajukan.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 flex items-center justify-center text-red-600">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memuat laporan...
                  </div>
                ) : recentReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed rounded-lg p-6">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                    <p className="font-semibold">Belum ada laporan yang diajukan.</p>
                    <p className="text-sm mt-1">Silakan gunakan tombol "Laporkan Kasus Baru" untuk memulai.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-xl mr-4">
                              <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white">{report.title} <span className="text-xs font-normal text-gray-400 ml-2">({report.id})</span></h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{report.incidentLocation || 'Lokasi tidak ditentukan'} &bull; Diajukan pada {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Kode Laporan: {report.reportNumber}</p>
                              {report.status === "REJECTED" && report.decisionNotes && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
                                  <p className="text-xs text-red-800 dark:text-red-200"><strong>Alasan Penolakan:</strong> {report.decisionNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(report.status)}
                            {report.status !== "PENDING" && report.status !== "REJECTED" && (
                              <div className="mt-2">
                                <Progress value={getProgress(report)} className="w-20 h-2" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">{getProgress(report)}% Progres</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
