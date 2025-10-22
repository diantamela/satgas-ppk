"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Calendar, 
  Download,
  Edit,
  MessageSquare,
  FilePlus,
  Shield,
  Mail
} from "lucide-react";
import Link from "next/link";

export default function RecommendationPage() {
  const [activeTab, setActiveTab] = useState("pending");

  // Mock data for recommendations
  const recommendationReports = [
    {
      id: 1,
      reportNumber: "SPPK-20241015-1001",
      title: "Dugaan Pelecehan Seksual",
      status: "recommendation_pending",
      category: "Pelecehan Seksual",
      severity: "Tinggi",
      reporterName: "Anonim",
      respondentName: "Budi Santoso",
      createdAt: "2024-10-15",
      recommendationStatus: "pending",
      investigationCompletedAt: "2024-10-18",
      assignedTo: "Ketua Satgas"
    },
    {
      id: 2,
      reportNumber: "SPPK-20241014-2002",
      title: "Kekerasan Verbal",
      status: "recommendation_submitted",
      category: "Kekerasan Verbal",
      severity: "Sedang",
      reporterName: "Ahmad Kurniawan",
      respondentName: "Rina Wijaya",
      createdAt: "2024-10-14",
      recommendationStatus: "submitted",
      recommendation: "Sanksi penulisan surat pernyataan dan pembinaan",
      investigationCompletedAt: "2024-10-17",
      assignedTo: "Ketua Satgas"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "recommendation_pending":
        return <Badge variant="secondary">Menunggu Rekomendasi</Badge>;
      case "recommendation_submitted":
        return <Badge variant="default">Rekomendasi Diajukan</Badge>;
      case "recommendation_approved":
        return <Badge variant="success">Rekomendasi Disetujui</Badge>;
      case "recommendation_rejected":
        return <Badge variant="destructive">Rekomendasi Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Rekomendasi</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola rekomendasi hasil investigasi</p>
          </div>
          <Button className="mt-4 md:mt-0">
            <FilePlus className="w-4 h-4 mr-2" />
            Buat Rekomendasi
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="border-b">
              <nav className="flex space-x-8">
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "pending"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("pending")}
                >
                  Menunggu
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "submitted"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("submitted")}
                >
                  Diajukan
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "completed"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("completed")}
                >
                  Selesai
                </button>
              </nav>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {recommendationReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {report.recommendationStatus === "pending" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      {report.recommendationStatus === "submitted" && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      {report.recommendationStatus === "approved" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate max-w-[200px] md:max-w-md">{report.title}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{report.reportNumber}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{report.category}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{report.severity}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Investigasi selesai: {report.investigationCompletedAt}
                        </span>
                      </div>
                      
                      {report.recommendation && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <p className="text-gray-700 dark:text-gray-300"><strong>Rekomendasi:</strong> {report.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <div>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/laporan/${report.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Catatan
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Proses Rekomendasi
            </CardTitle>
            <CardDescription>
              Buat dan kelola rekomendasi untuk ditetapkan oleh pimpinan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status Rekomendasi
                  </label>
                  <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800">
                    <option value="pending">Dalam Proses</option>
                    <option value="submitted">Diajukan ke Rektor</option>
                    <option value="approved">Disetujui Rektor</option>
                    <option value="rejected">Ditolak Rektor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ditugaskan Kepada
                  </label>
                  <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800">
                    <option value="">Pilih Penanggung Jawab</option>
                    <option value="ketua">Ketua Satgas</option>
                    <option value="anggota1">Siti Rahayu</option>
                    <option value="anggota2">Budi Santoso</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rekomendasi
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 h-32"
                  placeholder="Tulis rekomendasi berdasarkan hasil investigasi..."
                ></textarea>
              </div>
              
              <div className="flex gap-3">
                <Button>
                  <FilePlus className="w-4 h-4 mr-2" />
                  Simpan Rekomendasi
                </Button>
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Kirim ke Rektor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}