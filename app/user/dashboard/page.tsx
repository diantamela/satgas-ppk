"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  User,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  Plus,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  Phone,
  Settings,
  Bell,
  LogOut,
  Mail,
  Shield
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { signOut, useSession } from "@/lib/auth/auth-client";
import { NavUser } from "@/components/navigation/nav-user";

export default function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
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
        // Fetch user reports
        const reportsResponse = await fetch(`/api/reports?reporterId=${session.user.id}`);
        const reportsData = await reportsResponse.json();

        if (reportsData.success) {
          const reports = reportsData.reports;
          setRecentReports(reports.slice(0, 5)); // Show latest 5 reports

          // Calculate stats
          const totalReports = reports.length;
          const pendingReports = reports.filter((r: any) => r.status === 'PENDING').length;
          const resolvedReports = reports.filter((r: any) => r.status === 'COMPLETED').length;

          setUserStats({
            totalReports,
            pendingReports,
            resolvedReports,
            unreadMessages: 0 // TODO: implement notifications
          });
        }

        // Set profile data from session
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

  const quickActions = [
    {
      title: "Laporkan Kasus Baru",
      description: "Ajukan laporan kekerasan baru",
      icon: Plus,
      href: "/user/laporkan-kasus",
      color: "bg-red-500"
    },
    {
      title: "Cek Status Laporan",
      description: "Lihat status laporan Anda",
      icon: Eye,
      href: "/user/cek-status",
      color: "bg-blue-500"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Sedang Diproses</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Sedang Ditangani</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500 text-white hover:bg-green-600">Selesai</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "VERIFIED":
        return <Badge className="bg-purple-500 text-white hover:bg-purple-600">Terverifikasi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <RoleGuard requiredRoles={['USER']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Selamat Datang{profileData?.name ? `, ${profileData.name}` : ''}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Kelola laporan dan akses layanan dukungan Satgas PPK</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifikasi ({userStats.unreadMessages})
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/user/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Pengaturan
                </Link>
              </Button>
              <Button
                variant="outline"
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
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Total Laporan</CardDescription>
                <FileText className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{userStats.totalReports}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Laporan yang telah diajukan</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-950/20 dark:to-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Sedang Diproses</CardDescription>
                <Clock className="w-5 h-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{userStats.pendingReports}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Menunggu penanganan</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white dark:from-green-950/20 dark:to-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Selesai</CardDescription>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{userStats.resolvedReports}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Telah ditangani</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Pesan</CardDescription>
                <MessageSquare className="w-5 h-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{userStats.unreadMessages}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pesan belum dibaca</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Reports */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Laporan Terbaru</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/user/cek-status">
                        Lihat Semua
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>Laporan yang telah Anda ajukan</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Memuat laporan...</div>
                  ) : recentReports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada laporan yang diajukan
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg mr-4">
                              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-medium">{report.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {report.incidentLocation || 'Lokasi tidak ditentukan'} • {new Date(report.createdAt).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(report.status)}
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Detail
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                  <CardDescription>Fitur yang sering digunakan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 justify-start"
                        asChild
                      >
                        <Link href={action.href}>
                          <div className={`p-2 rounded-lg mr-3 ${action.color}`}>
                            <action.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {action.description}
                            </div>
                          </div>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Profile Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Profil Pengguna</CardTitle>
              <CardDescription>
                Informasi akun dari pendaftaran dan statistik penggunaan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Registration Information */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Informasi Pendaftaran
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Nama Lengkap</Label>
                            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white font-medium">
                              {profileData.name}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Email</Label>
                            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                              {profileData.email}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Role</Label>
                            <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md text-blue-800 dark:text-blue-400 font-medium">
                              {profileData.role}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Status Akun</Label>
                            <div className="mt-1 p-3 bg-green-50 dark:bg-green-950/20 rounded-md text-green-800 dark:text-green-400 font-medium">
                              Aktif
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Statistics */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Statistik Laporan
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <span className="text-sm font-medium">Total Laporan</span>
                          <Badge variant="secondary" className="font-bold">{userStats.totalReports}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <span className="text-sm font-medium">Sedang Diproses</span>
                          <Badge className="bg-yellow-500 text-white font-bold">{userStats.pendingReports}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <span className="text-sm font-medium">Selesai</span>
                          <Badge className="bg-green-500 text-white font-bold">{userStats.resolvedReports}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Aksi Cepat</h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                          <Link href="/user/settings">
                            <Settings className="w-4 h-4 mr-2" />
                            Ubah Password
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                          <Link href="/user/laporkan-kasus">
                            <Plus className="w-4 h-4 mr-2" />
                            Buat Laporan Baru
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Memuat data profil...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}