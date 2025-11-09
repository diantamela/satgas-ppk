"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
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
  Shield,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function RektorReviewPage() {
  // Mock data for report to review
  const report = {
    id: 1,
    reportNumber: "SPPK-20241015-1001",
    title: "Dugaan Pelecehan Seksual",
    status: "recommendation_submitted",
    category: "Pelecehan Seksual",
    severity: "Tinggi",
    reporterName: "Anonim",
    reporterEmail: null,
    respondentName: "Budi Santoso",
    respondentPosition: "Dosen Tetap",
    incidentDate: "2024-10-10",
    incidentLocation: "Ruang Dosen Lt. 2",
    description: "Pelapor melaporkan bahwa pada tanggal 10 Oktober 2024, sekitar pukul 14.00, terlapor diduga melakukan pelecehan seksual dengan menyentuh bagian tubuh pelapor secara tidak pantas saat pelapor sedang berkonsultasi di ruang dosen...",
    evidenceFiles: [
      { name: "bukti-foto.jpg", size: "2.4 MB", type: "image/jpeg" },
      { name: "pesan-whatsapp.jpg", size: "1.2 MB", type: "image/jpeg" }
    ],
    investigationNotes: "Tim Satgas telah melakukan pemeriksaan terhadap pelapor, terlapor, dan 2 saksi. Berdasarkan hasil pemeriksaan, ditemukan bukti yang cukup bahwa pelanggaran terjadi.",
    recommendation: "Kami merekomendasikan agar yang bersangkutan diberhentikan sementara dari tugasnya dan dikenai sanksi sesuai dengan peraturan universitas.",
    recommendationStatus: "pending",
    investigationCompletedAt: "2024-10-17",
    assignedTo: "Ketua Satgas"
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "recommendation_submitted":
        return <Badge variant="secondary">Menunggu Persetujuan Rektor</Badge>;
      case "recommendation_approved":
        return <Badge variant="success">Disetujui Rektor</Badge>;
      case "recommendation_rejected":
        return <Badge variant="destructive">Ditolak Rektor</Badge>;
      case "recommendation_revised":
        return <Badge variant="default">Dikembalikan untuk Revisi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const [decision, setDecision] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmitDecision = () => {
    console.log("Decision submitted:", decision, notes);
    // In a real application, this would call an API to update the report status
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Tinjau Rekomendasi</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{report.reportNumber}</span>
              <span>{getStatusBadge(report.status)}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Unduh Lengkap
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
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{getStatusBadge(report.status)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Investigasi Selesai</h3>
                    <p className="text-gray-900 dark:text-white">{new Date(report.investigationCompletedAt).toLocaleDateString()}</p>
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
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Posisi/Peran</h3>
                  <p className="text-gray-900 dark:text-white">{report.respondentPosition}</p>
                </div>
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
                    {report.evidenceFiles.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
                            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{file.type} • {file.size}</p>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Temuan Investigasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{report.investigationNotes}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Rekomendasi dari Satgas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">{report.recommendation}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Decision Panel */}
          <div className="md:w-1/3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Keputusan Rektor
                </CardTitle>
                <CardDescription>
                  Beri keputusan terhadap rekomendasi dari Satgas PPK
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Keputusan</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="approve"
                        name="decision"
                        value="approve"
                        checked={decision === "approve"}
                        onChange={() => setDecision("approve")}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="approve" className="ml-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Setujui Rekomendasi
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="reject"
                        name="decision"
                        value="reject"
                        checked={decision === "reject"}
                        onChange={() => setDecision("reject")}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="reject" className="ml-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Tolak Rekomendasi
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="revise"
                        name="decision"
                        value="revise"
                        checked={decision === "revise"}
                        onChange={() => setDecision("revise")}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="revise" className="ml-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          Kembalikan untuk Revisi
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 h-32"
                    placeholder="Tambahkan catatan atau alasan keputusan Anda..."
                  ></textarea>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSubmitDecision}
                  disabled={!decision}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Simpan Keputusan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Dokumen Terkait
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Berita Acara Investigasi
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Notulensi Pemeriksaan
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Rekomendasi Satgas (PDF)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}