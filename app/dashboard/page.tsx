"use client";

import { useState } from "react";
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
  Download, 
  Plus,
  BarChart3,
  User,
  Shield
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const reportStats = {
    total: 42,
    pending: 8,
    investigating: 15,
    completed: 19,
    rejected: 3
  };

  const recentReports = [
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
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Menunggu</Badge>;
      case "under_investigation":
        return <Badge variant="default">Dalam Investigasi</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "completed":
        return <Badge variant="success">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Satgas PPK</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola dan pantau laporan kekerasan di lingkungan kampus</p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/laporkan-kasus">
              <Plus className="w-4 h-4 mr-2" />
              Buat Laporan Baru
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total Laporan</CardDescription>
              <FileText className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.total}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Semua laporan yang masuk</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Menunggu</CardDescription>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.pending}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dalam verifikasi awal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Dalam Investigasi</CardDescription>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.investigating}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Proses pemeriksaan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Selesai</CardDescription>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.completed}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Telah ditangani</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Laporan Terbaru</CardTitle>
                  <Button variant="outline" size="sm">
                    Lihat Semua
                  </Button>
                </div>
                <CardDescription>Daftar laporan yang baru masuk dan sedang diproses</CardDescription>
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
                          <p className="text-sm text-gray-600 dark:text-gray-400">{report.reportNumber} • {report.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                          <p className="text-sm font-medium">{report.reporter}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{report.createdAt}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(report.status)}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/laporan/${report.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              Lihat
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
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
                      <div className="bg-pink-600 h-2 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Kekerasan Verbal</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: "28%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Bullying</span>
                      <span className="text-sm font-medium">22%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "22%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Lainnya</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>Perubahan status laporan terbaru</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full mr-3">
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
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
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
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-full mr-3">
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

        <Card>
          <CardHeader>
            <CardTitle>Tindakan Cepat</CardTitle>
            <CardDescription>Akses cepat ke fitur utama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/laporan">
                  <FileText className="w-4 h-4 mr-2" />
                  Semua Laporan
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/investigasi">
                  <Shield className="w-4 h-4 mr-2" />
                  Investigasi
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/rekomendasi">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Rekomendasi
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/anggota">
                  <Users className="w-4 h-4 mr-2" />
                  Anggota Satgas
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}