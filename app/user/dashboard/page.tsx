"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  MessageSquare,
  Search,
  Plus,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { RoleGuard } from "@/components/auth/role-guard";
import Link from "next/link";

export default function UserDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for user's reports
  const userReports = [
    {
      id: 1,
      title: "Laporan Kekerasan di Kampus",
      status: "VERIFIED",
      submittedDate: "2024-10-15",
      lastUpdate: "2024-10-18",
      description: "Laporan mengenai insiden kekerasan yang terjadi di area parkir kampus"
    },
    {
      id: 2,
      title: "Pengaduan Fasilitas Rusak",
      status: "IN_PROGRESS",
      submittedDate: "2024-10-10",
      lastUpdate: "2024-10-16",
      description: "AC di ruang kuliah tidak berfungsi dengan baik"
    },
    {
      id: 3,
      title: "Saran Perbaikan Sistem",
      status: "COMPLETED",
      submittedDate: "2024-09-28",
      lastUpdate: "2024-10-05",
      description: "Saran untuk meningkatkan sistem pengaduan online"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Menunggu Verifikasi</Badge>;
      case "VERIFIED":
        return <Badge variant="default" className="bg-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Terverifikasi</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Sedang Diproses</Badge>;
      case "COMPLETED":
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Selesai</Badge>;
      case "REJECTED":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const quickActions = [
    {
      title: "Laporkan Kasus Baru",
      description: "Buat laporan pengaduan baru",
      icon: Plus,
      href: "/user/laporkan-kasus",
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      title: "Cek Status Laporan",
      description: "Pantau status laporan Anda",
      icon: Search,
      href: "/user/cek-status",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Materi Edukasi",
      description: "Pelajari tentang pencegahan kekerasan",
      icon: BookOpen,
      href: "/user/edukasi",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Kontak & Bantuan",
      description: "Hubungi tim dukungan",
      icon: MessageSquare,
      href: "/user/kontak",
      color: "bg-purple-500 hover:bg-purple-600"
    },
  ];

  return (
    <RoleGuard requiredRoles={['USER']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Pengguna</h1>
              <p className="text-gray-600 dark:text-gray-400">Pantau laporan Anda dan akses layanan dukungan</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full text-white ${action.color}`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{action.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent Reports */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Laporan Terbaru
              </CardTitle>
              <CardDescription>
                Status laporan pengaduan yang telah Anda ajukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{report.title}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Diajukan: {new Date(report.submittedDate).toLocaleDateString()}</span>
                          <span>Update terakhir: {new Date(report.lastUpdate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userReports.length}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Laporan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userReports.filter(r => r.status === 'COMPLETED').length}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Laporan Selesai</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userReports.filter(r => r.status === 'IN_PROGRESS').length}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Sedang Diproses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userReports.filter(r => r.status === 'PENDING').length}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Menunggu Verifikasi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}