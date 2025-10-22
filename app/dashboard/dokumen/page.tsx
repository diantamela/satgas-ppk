"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  Download,
  Upload,
  AlertTriangle,
  Clock,
  CheckCircle,
  File,
  FileImage,
  FileAudio,
  FileVideo,
  Trash2,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function DocumentManagementPage() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: "Notulensi Pemeriksaan Saksi",
      reportNumber: "SPPK-20241015-1001",
      documentType: "minutes",
      fileName: "notulensi-saksi-1.pdf",
      fileSize: "2.4 MB",
      uploadedBy: "Siti Rahayu",
      uploadedAt: "2024-10-16",
      reportId: 1
    },
    {
      id: 2,
      title: "Bukti Foto Kejadian",
      reportNumber: "SPPK-20241014-2002",
      documentType: "evidence",
      fileName: "bukti-foto-kejadian.zip",
      fileSize: "15.7 MB",
      uploadedBy: "Budi Santoso",
      uploadedAt: "2024-10-15",
      reportId: 2
    },
    {
      id: 3,
      title: "Berita Acara Pemeriksaan",
      reportNumber: "SPPK-20241015-1001",
      documentType: "report",
      fileName: "berita-acara-pemeriksaan.docx",
      fileSize: "0.8 MB",
      uploadedBy: "Siti Rahayu",
      uploadedAt: "2024-10-17",
      reportId: 1
    }
  ]);
  const [filteredDocuments, setFilteredDocuments] = useState(documents);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply filters when search term or type filter changes
  useState(() => {
    let result = documents;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.reportNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter(doc => doc.documentType === typeFilter);
    }

    setFilteredDocuments(result);
  });

  const getDocumentIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <FileImage className="w-5 h-5 text-blue-500" />;
    } else if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
      return <FileAudio className="w-5 h-5 text-green-500" />;
    } else if (['mp4', 'avi', 'mov'].includes(ext || '')) {
      return <FileVideo className="w-5 h-5 text-purple-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case "minutes":
        return <Badge variant="outline">Notulensi</Badge>;
      case "evidence":
        return <Badge variant="secondary">Bukti</Badge>;
      case "report":
        return <Badge variant="default">Berita Acara</Badge>;
      case "recommendation":
        return <Badge variant="success">Rekomendasi</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log("File selected:", file.name);
      // In a real app, you would upload the file to your server/storage
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dokumen Investigasi</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola dokumen hasil pemeriksaan dan bukti investigasi</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={handleFileUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Unggah Dokumen
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              multiple
            />
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari dokumen berdasarkan judul, nama file, atau nomor laporan..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Semua Jenis</option>
                  <option value="minutes">Notulensi</option>
                  <option value="evidence">Bukti</option>
                  <option value="report">Berita Acara</option>
                  <option value="recommendation">Rekomendasi</option>
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Tidak ada dokumen</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {documents.length === 0 
                  ? "Belum ada dokumen yang diunggah." 
                  : "Tidak ada dokumen yang sesuai dengan filter pencarian Anda."}
              </p>
              <Button className="mt-4" onClick={handleFileUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Unggah Dokumen Pertama
              </Button>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getDocumentIcon(doc.fileName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{doc.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{doc.fileName}</p>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {doc.fileSize}
                        </Badge>
                        {getDocumentTypeBadge(doc.documentType)}
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <p>Laporan: {doc.reportNumber}</p>
                        <p>Diunggah oleh: {doc.uploadedBy}</p>
                        <p>{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/laporan/${doc.reportId}`}>
                        <FileText className="w-4 h-4 mr-1" />
                        Laporan
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Unggah Dokumen Baru
            </CardTitle>
            <CardDescription>
              Unggah dokumen hasil pemeriksaan, bukti, atau dokumen pendukung lainnya
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jenis Dokumen
                  </label>
                  <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800">
                    <option value="">Pilih Jenis Dokumen</option>
                    <option value="minutes">Notulensi Pemeriksaan</option>
                    <option value="evidence">Bukti Dokumentasi</option>
                    <option value="report">Berita Acara</option>
                    <option value="recommendation">Rekomendasi</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nomor Laporan Terkait
                  </label>
                  <Input placeholder="Masukkan nomor laporan" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Judul Dokumen
                </label>
                <Input placeholder="Judul dokumen yang deskriptif" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Dokumen
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Seret dan lepas file di sini, atau klik untuk memilih
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Format didukung: PDF, DOCX, XLSX, JPG, PNG, ZIP (max 50MB)
                  </p>
                  <Button variant="outline" onClick={handleFileUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    Pilih File
                  </Button>
                </div>
              </div>
              
              <Button className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Simpan Dokumen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}