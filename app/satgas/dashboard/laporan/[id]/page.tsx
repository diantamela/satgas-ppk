"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  User, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Upload, 
  Eye, 
  Download,
  Edit,
  MessageSquare,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { reportService } from "@/lib/services/report-service";

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("detail");

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (id) {
          const reportId = typeof id === 'string' ? parseInt(id) : id[0];
          const data = await reportService.getReportById(reportId);
          setReport(data);
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
      case "pending":
        return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
      case "verified":
        return <Badge variant="default">Terverifikasi</Badge>;
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
            <Link href="/dashboard/laporan">Kembali ke Daftar Laporan</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Detail Laporan</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{report.reportNumber}</span>
              <span>{getStatusBadge(report.status)}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              Tambah Catatan
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content */}
          <div className="md:w-2/3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Detail Laporan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Judul Laporan</h3>
                  <p className="text-lg font-semibold">{report.title}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Deskripsi</h3>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{report.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori</h3>
                    <p className="text-gray-900 dark:text-white">{report.category}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tingkat Keparahan</h3>
                    <p className="text-gray-900 dark:text-white">{report.severity}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
                    <div className="flex items-center gap-2">
                      {report.status === "pending" && <Clock className="w-4 h-4 text-yellow-500" />}
                      {report.status === "under_investigation" && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                      {report.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {report.status !== "pending" && report.status !== "under_investigation" && report.status !== "completed" && <FileText className="w-4 h-4 text-blue-500" />}
                      <span>{getStatusBadge(report.status)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Dilaporkan Tanggal</h3>
                    <p className="text-gray-900 dark:text-white">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Detail Terlapor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Terlapor</h3>
                  <p className="text-gray-900 dark:text-white">{report.respondentName}</p>
                </div>
                {report.respondentPosition && (
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Posisi/Peran</h3>
                    <p className="text-gray-900 dark:text-white">{report.respondentPosition}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Detail Kejadian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.incidentDate && (
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Kejadian</h3>
                    <p className="text-gray-900 dark:text-white">{new Date(report.incidentDate).toLocaleDateString()}</p>
                  </div>
                )}
                {report.incidentLocation && (
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Lokasi Kejadian</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900 dark:text-white">{report.incidentLocation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {report.evidenceFiles && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Bukti Dokumentasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {JSON.parse(report.evidenceFiles).map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
                            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{file.type} • {(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Lihat
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:w-1/3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Pelapor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.isAnonymous ? (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>Laporan Anonim</span>
                  </div>
                ) : (
                  <>
                    {report.reporterName && (
                      <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Nama</h3>
                        <p className="text-gray-900 dark:text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          {report.reporterName}
                        </p>
                      </div>
                    )}
                    {report.reporterEmail && (
                      <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Email</h3>
                        <p className="text-gray-900 dark:text-white flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          {report.reporterEmail}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Catatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.verificationNotes && (
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Verifikasi</h3>
                      <p className="text-gray-600 dark:text-gray-300">{report.verificationNotes}</p>
                    </div>
                  )}
                  {report.investigationNotes && (
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Investigasi</h3>
                      <p className="text-gray-600 dark:text-gray-300">{report.investigationNotes}</p>
                    </div>
                  )}
                  {report.recommendation && (
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Rekomendasi</h3>
                      <p className="text-gray-600 dark:text-gray-300">{report.recommendation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Tindakan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Unduh Laporan
                </Button>
                <Button className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Tambah Catatan
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">Tolak</Button>
                  <Button size="sm">Teruskan</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}