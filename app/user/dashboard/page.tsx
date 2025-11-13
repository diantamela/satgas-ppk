"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  LogOut
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { signOut } from "@/lib/auth/auth-client";

export default function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  // Mock data for user dashboard
  const userStats = {
    totalReports: 2,
    pendingReports: 1,
    resolvedReports: 1,
    unreadMessages: 3
  };

  const recentReports = [
    {
      id: 1,
      title: "Laporan Kekerasan Verbal",
      status: "Sedang Diproses",
      date: "2024-10-15",
      category: "Kekerasan Verbal"
    },
    {
      id: 2,
      title: "Dugaan Pelecehan Seksual",
      status: "Selesai",
      date: "2024-10-10",
      category: "Pelecehan Seksual"
    }
  ];

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
    },
    {
      title: "Materi Edukasi",
      description: "Pelajari tentang pencegahan kekerasan",
      icon: BookOpen,
      href: "/user/edukasi",
      color: "bg-green-500"
    },
    {
      title: "Kontak Satgas",
      description: "Hubungi tim pendamping",
      icon: Phone,
      href: "/user/kontak",
      color: "bg-purple-500"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sedang Diproses":
        return <Badge variant="secondary">Sedang Diproses</Badge>;
      case "Selesai":
        return <Badge variant="success">Selesai</Badge>;
      case "Ditolak":
        return <Badge variant="destructive">Ditolak</Badge>;
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Pengguna</h1>
              <p className="text-gray-600 dark:text-gray-400">Kelola laporan dan akses layanan dukungan</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifikasi ({userStats.unreadMessages})
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Total Laporan</CardDescription>
                <FileText className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalReports}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Laporan yang telah diajukan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Sedang Diproses</CardDescription>
                <Clock className="w-5 h-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.pendingReports}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Menunggu penanganan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Selesai</CardDescription>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.resolvedReports}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Telah ditangani</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Pesan</CardDescription>
                <MessageSquare className="w-5 h-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.unreadMessages}</div>
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
                              {report.category} • {report.date}
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

              {/* Support Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Butuh Bantuan?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Jika Anda mengalami kekerasan atau membutuhkan pendampingan segera,
                    hubungi tim Satgas PPK.
                  </p>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/user/kontak">
                      <Phone className="w-4 h-4 mr-2" />
                      Hubungi Sekarang
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Educational Content */}
          <Card>
            <CardHeader>
              <CardTitle>Materi Edukasi</CardTitle>
              <CardDescription>Pelajari tentang hak-hak Anda dan pencegahan kekerasan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2">Definisi Kekerasan</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Pahami berbagai bentuk kekerasan yang dapat terjadi di lingkungan kampus.
                  </p>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/user/edukasi">Baca Selengkapnya →</Link>
                  </Button>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2">Prosedur Pelaporan</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Langkah-langkah yang harus dilakukan ketika mengalami atau menyaksikan kekerasan.
                  </p>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/user/edukasi">Pelajari →</Link>
                  </Button>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2">Hak Korban</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Ketahui hak-hak Anda sebagai korban dan dukungan yang tersedia.
                  </p>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/user/edukasi">Lihat Detail →</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}