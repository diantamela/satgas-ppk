"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Plus,
  Shield,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Report {
  id: number;
  reportNumber: string;
  title: string;
  status: string;
  createdAt: string;
  category: string;
  reporter: string;
  severity: string;
}

interface ReportStats {
  total: number;
  pending: number;
  investigating: number;
  completed: number;
  rejected: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportStats, setReportStats] = useState<ReportStats>({
    total: 0,
    pending: 0,
    investigating: 0,
    completed: 0,
    rejected: 0
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/signin');
          return;
        }
        const data = await response.json();
        setUser(data.user);
        
        // Load dashboard data
        await loadDashboardData();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Fetch report statistics
      const statsResponse = await fetch('/api/reports/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setReportStats(statsData);
      }

      // Fetch recent reports
      const reportsResponse = await fetch('/api/reports?limit=5&sort=recent');
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setRecentReports(reportsData.reports || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use mock data as fallback
      setReportStats({
        total: 42,
        pending: 8,
        investigating: 15,
        completed: 19,
        rejected: 3
      });
      
      setRecentReports([
        {
          id: 1,
          reportNumber: "SPPK-123456",
          title: "Dugaan Pelecehan Seksual",
          status: "under_investigation",
          createdAt: "2024-10-15",
          category: "Sexual Harassment",
          reporter: "Anonim",
          severity: "High"
        },
        {
          id: 2,
          reportNumber: "SPPK-789012",
          title: "Kekerasan Verbal",
          status: "pending",
          createdAt: "2024-10-14",
          category: "Verbal Abuse",
          reporter: "Ahmad Kurniawan",
          severity: "Medium"
        },
        {
          id: 3,
          reportNumber: "SPPK-345678",
          title: "Bullying Online",
          status: "completed",
          createdAt: "2024-10-10",
          category: "Cyberbullying",
          reporter: "Siti Nurhaliza",
          severity: "Low"
        }
      ]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Menunggu</Badge>;
      case "under_investigation":
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Dalam Investigasi</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Satgas PPKS
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Selamat datang, {user?.name || user?.email}
            </p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/laporkan-kasus">
              <Plus className="w-4 h-4 mr-2" />
              Buat Laporan Baru
            </Link>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total Laporan</CardDescription>
              <FileText className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reportStats.total}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Semua laporan yang masuk
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Menunggu</CardDescription>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reportStats.pending}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Dalam verifikasi awal
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Dalam Investigasi</CardDescription>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reportStats.investigating}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Proses pemeriksaan
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Selesai</CardDescription>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reportStats.completed}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Telah ditangani
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Reports */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Laporan Terbaru</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/laporan">
                      Lihat Semua
                    </Link>
                  </Button>
                </div>
                <CardDescription>
                  Daftar laporan yang baru masuk dan sedang diproses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada laporan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div 
                        key={report.id} 
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center flex-1">
                          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg mr-4">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{report.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {report.reportNumber} • {report.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right hidden md:block">
                            <p className="text-sm font-medium">{report.reporter}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(report.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(report.status)}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/laporan/${report.id}`}>
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline ml-1">Lihat</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Statistik Laporan</CardTitle>
                <CardDescription>Distribusi laporan berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Pelecehan Seksual</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-pink-600 h-2 rounded-full transition-all" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Kekerasan Verbal</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: "28%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Bullying</span>
                      <span className="text-sm font-medium">22%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full transition-all" style={{ width: "22%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Lainnya</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>Perubahan status laporan terbaru</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full mr-3 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Laporan SPPK-345678</span> telah diselesaikan
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3 flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Laporan SPPK-123456</span> dalam investigasi
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-full mr-3 flex-shrink-0">
                      <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Laporan SPPK-789012</span> menunggu verifikasi
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1 hari yang lalu</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Tindakan Cepat</CardTitle>
            <CardDescription>Akses cepat ke fitur utama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/dashboard/laporan" className="flex flex-col items-center gap-2">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Semua Laporan</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/dashboard/investigasi" className="flex flex-col items-center gap-2">
                  <Shield className="w-6 h-6" />
                  <span className="text-sm">Investigasi</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/dashboard/rekomendasi" className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-sm">Rekomendasi</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/dashboard/anggota" className="flex flex-col items-center gap-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Anggota Satgas</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}