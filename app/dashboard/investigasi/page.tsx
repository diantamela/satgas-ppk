"use client";

import { useState } from "react";
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
  Upload, 
  Eye, 
  Download,
  Edit,
  MessageSquare,
  FilePlus,
  Users,
  BookOpen
} from "lucide-react";
import Link from "next/link";

export default function InvestigationPage() {
  const [activeTab, setActiveTab] = useState("active");

  // Mock data for investigation
  const investigationReports = [
    {
      id: 1,
      reportNumber: "SPPK-20241015-1001",
      title: "Dugaan Pelecehan Seksual",
      status: "under_investigation",
      category: "Pelecehan Seksual",
      severity: "Tinggi",
      reporterName: "Anonim",
      respondentName: "Budi Santoso",
      createdAt: "2024-10-15",
      assignedTo: "Siti Rahayu",
      progress: 60
    },
    {
      id: 2,
      reportNumber: "SPPK-20241014-2002",
      title: "Kekerasan Verbal",
      status: "investigation_scheduled",
      category: "Kekerasan Verbal",
      severity: "Sedang",
      reporterName: "Ahmad Kurniawan",
      respondentName: "Rina Wijaya",
      createdAt: "2024-10-14",
      assignedTo: "Agus Prasetyo",
      progress: 20
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "investigation_scheduled":
        return <Badge variant="secondary">Penjadwalan</Badge>;
      case "under_investigation":
        return <Badge variant="default">Dalam Investigasi</Badge>;
      case "awaiting_response":
        return <Badge variant="outline">Menunggu Respon</Badge>;
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Investigasi</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola proses investigasi laporan kekerasan</p>
          </div>
          <Button className="mt-4 md:mt-0">
            <FilePlus className="w-4 h-4 mr-2" />
            Jadwalkan Investigasi
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="border-b">
              <nav className="flex space-x-8">
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "active"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("active")}
                >
                  Aktif
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "scheduled"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("scheduled")}
                >
                  Terjadwal
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
          {investigationReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {report.status === "investigation_scheduled" && <Calendar className="w-4 h-4 text-blue-500" />}
                      {report.status === "under_investigation" && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                      {report.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
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
                          Ditugaskan ke: {report.assignedTo}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progres:</span>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${report.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
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
              <BookOpen className="w-5 h-5" />
              Dokumentasi Investigasi
            </CardTitle>
            <CardDescription>
              Upload dokumen hasil pemeriksaan, notulensi, dan berita acara
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Seret dan lepas file di sini, atau klik untuk memilih
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Format didukung: PDF, DOCX, XLSX, JPG, PNG, ZIP (max 50MB)
              </p>
              <Button variant="outline" asChild>
                <Link href="/dashboard/dokumen">
                  <Upload className="w-4 h-4 mr-2" />
                  Kelola Dokumen
                </Link>
              </Button>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">Dokumen Terkait Terbaru</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium">Notulensi Pemeriksaan Saksi</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">15 Oct 2024 • 2.4 MB</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileImage className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium">Bukti Foto Kejadian</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">14 Oct 2024 • 15.7 MB</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}