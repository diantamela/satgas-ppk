"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, FileText, Shield, Search } from "lucide-react";

export default function StatusCheckPage() {
  const [reportNumber, setReportNumber] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [reportStatus, setReportStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration purposes
  const mockReports = [
    {
      id: 1,
      reportNumber: "SPPK-123456",
      title: "Dugaan Pelecehan Seksual",
      status: "under_investigation",
      statusText: "Dalam Investigasi",
      createdAt: "2024-10-01",
      updatedAt: "2024-10-10",
      progress: 60,
      description: "Laporan terkait dugaan pelecehan seksual yang terjadi di area kampus",
      category: "Sexual Harassment",
      severity: "High",
      assignedTo: "Budi Santoso (Ketua Satgas)",
      nextStep: "Pemeriksaan terhadap pelapor dan terlapor",
      estimatedCompletion: "2024-10-20"
    },
    {
      id: 2,
      reportNumber: "SPPK-789012",
      title: "Kekerasan Verbal",
      status: "completed",
      statusText: "Selesai",
      createdAt: "2024-09-15",
      updatedAt: "2024-10-05",
      progress: 100,
      description: "Laporan terkait kekerasan verbal dari dosen terhadap mahasiswa",
      category: "Verbal Abuse",
      severity: "Medium",
      assignedTo: "Siti Rahayu (Anggota Satgas)",
      nextStep: "Rekomendasi disetujui Rektor",
      estimatedCompletion: "2024-10-05"
    }
  ];

  const handleSearch = async () => {
    if (!reportNumber.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Call the API to check report status
      const response = await fetch(`/api/reports/check-status?reportNumber=${encodeURIComponent(reportNumber)}`);
      const result = await response.json();
      
      if (result.success) {
        setReportStatus(result.report);
      } else {
        setReportStatus(null);
      }
    } catch (error) {
      console.error("Error checking report status:", error);
      setReportStatus(null);
    } finally {
      setSearchPerformed(true);
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Cek Status Laporan</CardTitle>
            <CardDescription>
              Masukkan nomor laporan untuk mengecek status dan progres penanganan kasus Anda
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
              <Input
                type="text"
                placeholder="Masukkan nomor laporan (contoh: SPPK-123456)"
                value={reportNumber}
                onChange={(e) => setReportNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Mencari..." : "Cari"}
              </Button>
            </div>
            
            {searchPerformed && !reportStatus && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Laporan Tidak Ditemukan</h3>
                <p className="text-red-700 dark:text-red-300">
                  Nomor laporan yang Anda masukkan tidak ditemukan. Pastikan nomor laporan sudah benar.
                </p>
              </div>
            )}
            
            {reportStatus && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/50 border-blue-200 dark:border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{reportStatus.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{reportStatus.description}</p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        {getStatusBadge(reportStatus.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Nomor Laporan:</span> {reportStatus.reportNumber}</p>
                        <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Kategori:</span> {reportStatus.category}</p>
                        <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Tingkat Keparahan:</span> {reportStatus.severity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Tanggal Laporan:</span> {new Date(reportStatus.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Diperbarui:</span> {new Date(reportStatus.updatedAt).toLocaleDateString()}</p>
                        <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Ditangani oleh:</span> {reportStatus.assignedTo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Progres Penanganan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Progres: {reportStatus.progress}%</span>
                        <span className="text-sm font-medium">{reportStatus.statusText}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${reportStatus.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {reportStatus.status !== "completed" && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Langkah Selanjutnya</h4>
                        <p className="text-blue-700 dark:text-blue-300">{reportStatus.nextStep}</p>
                        <p className="text-blue-700 dark:text-blue-300 mt-1">
                          <span className="font-medium">Perkiraan selesai:</span> {new Date(reportStatus.estimatedCompletion).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Informasi Tambahan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {reportStatus.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-500" />
                        )}
                        <span>
                          {reportStatus.status === "completed" 
                            ? "Proses penanganan laporan telah selesai"
                            : "Laporan sedang dalam proses penanganan oleh tim Satgas PPK"}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="mb-2">Tim Satgas PPK berkomitmen untuk menyelesaikan setiap laporan secara profesional dan tepat waktu.</p>
                        <p>Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi kami melalui halaman kontak.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {!searchPerformed && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                <p className="text-blue-800 dark:text-blue-200 text-center">
                  Nomor laporan biasanya diberikan setelah Anda berhasil mengirimkan laporan. 
                  Contoh: <span className="font-mono">SPPK-123456</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}