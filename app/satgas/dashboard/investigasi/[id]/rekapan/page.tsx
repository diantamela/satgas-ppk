"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  AlertTriangle,
  User,
  BookOpen,
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  FileCheck,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function InvestigationRekapanPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (id) {
          const reportId = Array.isArray(id) ? id[0] : id;
          const response = await fetch(`/api/reports/${reportId}`);
          const data = await response.json();
          if (data.success) {
            setReport(data.report);
          } else {
            console.error("Error fetching report:", data.message);
          }
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Dalam Investigasi</Badge>;
      case "SCHEDULED":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Terjadwal</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownloadReport = async () => {
    if (!id) return;

    try {
      const response = await fetch(`/api/reports/${id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-${report?.reportNumber || id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Gagal mengunduh laporan');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Terjadi kesalahan saat mengunduh laporan');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 h-32"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 h-48"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Laporan Tidak Ditemukan</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Laporan dengan ID yang Anda cari tidak ditemukan.
          </p>
          <Button asChild>
            <Link href="/satgas/dashboard/investigasi">Kembali ke Daftar Investigasi</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Button variant="outline" size="sm" asChild>
              <Link href="/satgas/dashboard/investigasi">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Rekapan Proses Investigasi</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{report.reportNumber}</span>
                <span>{getStatusBadge(report.status)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Unduh Laporan
            </Button>
            <Button asChild>
              <Link href={`/satgas/dashboard/investigasi/${id}/proses`}>
                <FileCheck className="w-4 h-4 mr-2" />
                Proses Investigasi
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Informasi Dasar Laporan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Laporan</h4>
                    <p className="text-gray-900 dark:text-white font-semibold">{report.title}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</h4>
                    <p className="text-gray-900 dark:text-white">{report.category || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tingkat Keparahan</h4>
                    <p className="text-gray-900 dark:text-white font-semibold text-red-500">{report.severity || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Laporan</h4>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(report.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Deskripsi</h4>
                  <p className="text-gray-900 dark:text-white">{report.description || 'Tidak ada deskripsi'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Progress Investigasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress Keseluruhan</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{report.investigationProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-red-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${report.investigationProgress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className={`text-center p-3 rounded-lg ${report.investigationProgress >= 25 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                      <div className={`font-semibold ${report.investigationProgress >= 25 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>Pengumpulan Data</div>
                      <div className="text-gray-600 dark:text-gray-400">25%</div>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${report.investigationProgress >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                      <div className={`font-semibold ${report.investigationProgress >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>Analisis</div>
                      <div className="text-gray-600 dark:text-gray-400">50%</div>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${report.investigationProgress >= 75 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                      <div className={`font-semibold ${report.investigationProgress >= 75 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>Penyusunan Laporan</div>
                      <div className="text-gray-600 dark:text-gray-400">75%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling Information */}
            {report.scheduledDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Informasi Penjadwalan Proses Investigasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Dijadwalkan</h4>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(report.scheduledDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {report.scheduledNotes && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Penjadwalan</h4>
                        <p className="text-gray-900 dark:text-white">{report.scheduledNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Detail lengkap proses investigasi dapat dilihat di halaman Proses Investigasi
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Pelapor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Nama</h4>
                  <p className="text-gray-900 dark:text-white">{report.reporter?.name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Email</h4>
                  <p className="text-gray-900 dark:text-white">{report.reporter?.email || 'N/A'}</p>
                </div>
                {report.reporter?.phone && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Telepon</h4>
                    <p className="text-gray-900 dark:text-white">{report.reporter.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href={`/satgas/dashboard/investigasi/${id}/proses`}>
                    <FileCheck className="w-4 h-4 mr-2" />
                    Proses Investigasi
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/satgas/dashboard/investigasi/${id}/kegiatan`}>
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat Kegiatan
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/satgas/dashboard/investigasi/${id}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Detail Lengkap
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}