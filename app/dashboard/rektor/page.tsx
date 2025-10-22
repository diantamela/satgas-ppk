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
  Eye, 
  Download, 
  BarChart3,
  User,
  Shield,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function RektorDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for rektor dashboard
  const reportStats = {
    total: 42,
    pendingReview: 5,
    approved: 12,
    rejected: 3,
    underReview: 8
  };

  const pendingReports = [
    {
      id: 1,
      reportNumber: "SPPK-20241015-1001",
      title: "Dugaan Pelecehan Seksual",
      category: "Pelecehan Seksual",
      severity: "Tinggi",
      submittedDate: "2024-10-17",
      recommendation: "Sanksi pemecatan",
      status: "recommendation_submitted"
    },
    {
      id: 2,
      reportNumber: "SPPK-20241014-2002",
      title: "Kekerasan Verbal",
      category: "Kekerasan Verbal",
      severity: "Sedang",
      submittedDate: "2024-10-16",
      recommendation: "Sanksi pembinaan",
      status: "recommendation_submitted"
    }
  ];

  const recentApprovals = [
    {
      id: 3,
      reportNumber: "SPPK-20241013-3003",
      title: "Bullying Online",
      category: "Cyberbullying",
      severity: "Rendah",
      decision: "Disetujui",
      decisionDate: "2024-10-15"
    },
    {
      id: 4,
      reportNumber: "SPPK-20241012-4004",
      title: "Kekerasan Fisik",
      category: "Kekerasan Fisik",
      severity: "Tinggi",
      decision: "Ditolak",
      decisionDate: "2024-10-14"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "recommendation_submitted":
        return <Badge variant="secondary">Menunggu Persetujuan</Badge>;
      case "approved":
        return <Badge variant="success">Disetujui</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "revised":
        return <Badge variant="default">Direvisi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Rektor</h1>
            <p className="text-gray-600 dark:text-gray-400">Tinjau dan setujui rekomendasi hasil investigasi</p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/laporkan-kasus">
              <FileText className="w-4 h-4 mr-2" />
              Lihat Laporan Penuh
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
              <CardDescription>Menunggu Tinjauan</CardDescription>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.pendingReview}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rekomendasi perlu ditinjau</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Disetujui</CardDescription>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.approved}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rekomendasi yang disetujui</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Revisi</CardDescription>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.rejected}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rekomendasi direvisi/tolak</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Laporan Menunggu Persetujuan</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/rektor/laporan-menunggu">
                      Lihat Semua
                    </Link>
                  </Button>
                </div>
                <CardDescription>Rekomendasi hasil investigasi yang menunggu persetujuan Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingReports.map((report) => (
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
                          <p className="text-sm font-medium">{report.severity}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{report.submittedDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(report.status)}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/rektor/review/${report.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              Tinjau
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
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Riwayat Keputusan
                </CardTitle>
                <CardDescription>Keputusan yang telah Anda buat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApprovals.map((item) => (
                    <div key={item.id} className="flex items-start">
                      <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full mr-3">
                        {item.decision === "Disetujui" ? 
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" /> : 
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          <span className="font-semibold">{item.reportNumber}</span> {item.decision.toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.decisionDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Kebijakan
                </CardTitle>
                <CardDescription>Kebijakan terkait PPK</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Permendikbudristek No. 55 Tahun 2024
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Pedoman PPK Universitas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Laporan Tahunan PPK
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tindakan Cepat</CardTitle>
            <CardDescription>Akses cepat ke fitur manajemen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/rektor/laporan-menunggu">
                  <FileText className="w-4 h-4 mr-2" />
                  Laporan Menunggu
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/rektor/rekomendasi">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Rekomendasi
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/rektor/keputusan">
                  <Shield className="w-4 h-4 mr-2" />
                  Keputusan Saya
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/rektor/laporan-akhir">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Laporan Akhir
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}