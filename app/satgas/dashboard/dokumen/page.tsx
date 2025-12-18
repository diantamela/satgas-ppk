"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Upload,
  File,
  FileImage,
  FileAudio,
  FileVideo,
  Trash2,
  Plus,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "../../../../components/auth/role-guard";

enum DocumentType {
  EVIDENCE = "EVIDENCE",
  INVESTIGATION_REPORT = "INVESTIGATION_REPORT",
  OFFICIAL_LETTER = "OFFICIAL_LETTER",
  PROCEEDINGS = "PROCEEDINGS",
  RECOMMENDATION = "RECOMMENDATION"
}

interface Document {
  id: string;
  reportId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  description?: string;
  createdAt: string;
  report: {
    reportNumber: string;
    title: string;
  };
  uploadedBy: {
    name: string;
  };
}

export default function DocumentManagementPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: "" as DocumentType,
    reportNumber: "",
    title: "",
    selectedFile: null as File | null
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentViewDocument, setCurrentViewDocument] = useState<{ url: string; fileName: string } | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [showUploadForm, setShowUploadForm] = useState(false); // ⭐ state untuk show/hide form

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/documents");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDocuments(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    let result = documents;

    if (searchTerm) {
      result = result.filter((doc) =>
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((doc) => doc.documentType === (typeFilter as DocumentType));
    }

    setFilteredDocuments(result);
  }, [documents, searchTerm, typeFilter]);

  const getDocumentIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      return <FileImage className="w-5 h-5 text-blue-500" />;
    } else if (["mp3", "wav", "ogg"].includes(ext || "")) {
      return <FileAudio className="w-5 h-5 text-green-500" />;
    } else if (["mp4", "avi", "mov"].includes(ext || "")) {
      return <FileVideo className="w-5 h-5 text-purple-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDocumentTypeBadge = (type: DocumentType) => {
    switch (type) {
      case DocumentType.EVIDENCE:
        return <Badge variant="outline">Bukti Dokumentasi</Badge>;
      case DocumentType.INVESTIGATION_REPORT:
        return <Badge variant="secondary">Laporan Investigasi</Badge>;
      case DocumentType.PROCEEDINGS:
        return <Badge variant="default">Berita Acara</Badge>;
      case DocumentType.RECOMMENDATION:
        return <Badge variant="success">Rekomendasi</Badge>;
      case DocumentType.OFFICIAL_LETTER:
        return <Badge variant="outline">Surat Resmi</Badge>;
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
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      alert("File terlalu besar. Maksimal 50MB.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/zip"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Tipe file tidak didukung. Format yang didukung: PDF, DOCX, XLSX, JPG, PNG, ZIP");
      return;
    }

    setUploadForm((prev) => ({ ...prev, selectedFile: file }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.selectedFile || !uploadForm.documentType || !uploadForm.reportNumber) {
      alert("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    setUploading(true);
    try {
      const reportResponse = await fetch(`/api/reports?reportNumber=${uploadForm.reportNumber}`);
      if (!reportResponse.ok) {
        throw new Error("Laporan tidak ditemukan");
      }

      const reportData = await reportResponse.json();
      if (!reportData.success || reportData.reports.length === 0) {
        throw new Error("Laporan tidak ditemukan");
      }

      const report = reportData.reports[0];

      const formData = new FormData();
      formData.append("file", uploadForm.selectedFile);
      formData.append("reportId", report.id);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        try {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Gagal mengunggah file");
        } catch {
          throw new Error("Gagal mengunggah file: Server error");
        }
      }

      const uploadResult = await uploadResponse.json();

      const documentData = {
        reportId: report.id,
        fileName: uploadForm.selectedFile.name,
        fileType: uploadForm.selectedFile.type,
        fileSize: uploadForm.selectedFile.size,
        storagePath: uploadResult.filePath,
        documentType: uploadForm.documentType,
        description: uploadForm.title || undefined
      };

      const documentResponse = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(documentData)
      });

      if (!documentResponse.ok) {
        throw new Error("Gagal membuat record dokumen");
      }

      const documentResult = await documentResponse.json();
      if (documentResult.success) {
        const fetchResponse = await fetch("/api/documents");
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          if (data.success) {
            setDocuments(data.data);
          }
        }

        setUploadForm({
          documentType: "" as DocumentType,
          reportNumber: "",
          title: "",
          selectedFile: null
        });

        alert("Dokumen berhasil diunggah!");
      } else {
        throw new Error(documentResult.message || "Gagal membuat record dokumen");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus dokumen");
      }

      const result = await response.json();
      if (result.success) {
        const fetchResponse = await fetch("/api/documents");
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          if (data.success) {
            setDocuments(data.data);
          }
        }
        alert("Dokumen berhasil dihapus!");
      } else {
        throw new Error(result.message || "Gagal menghapus dokumen");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus");
    }
  };

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error("Gagal mengambil informasi dokumen");
      }

      const result = await response.json();
      if (result.success) {
        const doc = result.data;
        let downloadUrl: string;

        if (doc.storagePath.startsWith("/uploads/")) {
          downloadUrl = doc.storagePath;
        } else if (doc.storagePath.startsWith("evidence/")) {
          const signedUrlResponse = await fetch(`/api/documents/${documentId}/download`);
          if (signedUrlResponse.ok) {
            const signedUrlResult = await signedUrlResponse.json();
            downloadUrl = signedUrlResult.url;
          } else {
            throw new Error("Gagal mendapatkan link download");
          }
        } else {
          throw new Error("Format path penyimpanan tidak didukung");
        }

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(result.message || "Gagal mengambil informasi dokumen");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat mengunduh dokumen");
    }
  };

  const handleViewDocument = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error("Gagal mengambil informasi dokumen");
      }

      const result = await response.json();
      if (result.success) {
        const doc = result.data;
        let viewUrl: string;

        if (doc.storagePath.startsWith("/uploads/")) {
          viewUrl = doc.storagePath;
        } else if (doc.storagePath.startsWith("evidence/")) {
          const signedUrlResponse = await fetch(`/api/documents/${documentId}/download`);
          if (signedUrlResponse.ok) {
            const signedUrlResult = await signedUrlResponse.json();
            viewUrl = signedUrlResult.url;
          } else {
            throw new Error("Gagal mendapatkan link view");
          }
        } else {
          throw new Error("Format path penyimpanan tidak didukung");
        }

        setCurrentViewDocument({ url: viewUrl, fileName });
        setViewError(null);
        setIsViewModalOpen(true);
      } else {
        throw new Error(result.message || "Gagal mengambil informasi dokumen");
      }
    } catch (error) {
      console.error("View error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat melihat dokumen");
    }
  };

  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* HEADER + TOMBOL UPLOAD DOKUMEN ⭐ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Dokumen Investigasi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola dokumen hasil pemeriksaan dan bukti investigasi
            </p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            {/* input file tetap hidden, dipakai oleh form */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              className="inline-flex items-center gap-2"
              onClick={() => setShowUploadForm((prev) => !prev)}
            >
              <Upload className="w-4 h-4" />
              {showUploadForm ? "Tutup Form Dokumen" : "Upload Dokumen"}
            </Button>
          </div>
        </div>

        {/* FORM UNGGAH DOKUMEN DI ATAS, BISA SHOW/HIDE ⭐ */}
        {showUploadForm && (
          <Card className="mb-6">
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
                      Jenis Dokumen *
                    </label>
                    <select
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                      value={uploadForm.documentType}
                      onChange={(e) =>
                        setUploadForm((prev) => ({
                          ...prev,
                          documentType: e.target.value as DocumentType
                        }))
                      }
                    >
                      <option value="">Pilih Jenis Dokumen</option>
                      <option value={DocumentType.EVIDENCE}>Bukti Dokumentasi</option>
                      <option value={DocumentType.INVESTIGATION_REPORT}>Laporan Investigasi</option>
                      <option value={DocumentType.OFFICIAL_LETTER}>Surat Resmi</option>
                      <option value={DocumentType.PROCEEDINGS}>Berita Acara</option>
                      <option value={DocumentType.RECOMMENDATION}>Rekomendasi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nomor Laporan Terkait *
                    </label>
                    <Input
                      placeholder="Masukkan nomor laporan (contoh: LPN-241234)"
                      value={uploadForm.reportNumber}
                      onChange={(e) =>
                        setUploadForm((prev) => ({ ...prev, reportNumber: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deskripsi Dokumen
                  </label>
                  <Input
                    placeholder="Deskripsi singkat tentang dokumen ini"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    File Dokumen *
                  </label>
                  <div
                    ref={dropZoneRef}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleFileUpload}
                  >
                    <Upload
                      className={`w-12 h-12 mx-auto mb-3 ${
                        isDragOver ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`mb-2 ${
                        isDragOver
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {uploadForm.selectedFile
                        ? `File dipilih: ${uploadForm.selectedFile.name}`
                        : "Seret dan lepas file di sini, atau klik untuk memilih"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Format didukung: PDF, DOCX, XLSX, JPG, PNG, ZIP (max 50MB)
                    </p>
                    <Button variant="outline" disabled={uploading}>
                      <Upload className="w-4 h-4 mr-2" />
                      Pilih File
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full md:w-auto"
                  onClick={handleUpload}
                  disabled={
                    uploading ||
                    !uploadForm.selectedFile ||
                    !uploadForm.documentType ||
                    !uploadForm.reportNumber
                  }
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {uploading ? "Mengunggah..." : "Simpan Dokumen"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FILTER & PENCARIAN */}
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
                  onChange={(e) => setTypeFilter(e.target.value as DocumentType)}
                >
                  <option value="all">Semua Jenis</option>
                  <option value={DocumentType.EVIDENCE}>Bukti Dokumentasi</option>
                  <option value={DocumentType.INVESTIGATION_REPORT}>Laporan Investigasi</option>
                  <option value={DocumentType.OFFICIAL_LETTER}>Surat Resmi</option>
                  <option value={DocumentType.PROCEEDINGS}>Berita Acara</option>
                  <option value={DocumentType.RECOMMENDATION}>Rekomendasi</option>
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GRID DOKUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400">Memuat dokumen...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Tidak ada dokumen
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {documents.length === 0
                  ? "Belum ada dokumen yang diunggah."
                  : "Tidak ada dokumen yang sesuai dengan filter pencarian Anda."}
              </p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getDocumentIcon(doc.fileName)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{doc.fileName}</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {doc.description || "Tidak ada deskripsi"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                        {getDocumentTypeBadge(doc.documentType)}
                      </div>

                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <p>Laporan: {doc.report.reportNumber}</p>
                        <p>Diunggah oleh: {doc.uploadedBy.name}</p>
                        <p>{new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/satgas/dashboard/laporan/${doc.reportId}`}>
                        <FileText className="w-4 h-4 mr-1" />
                        Laporan
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(doc.id, doc.fileName)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* MODAL VIEW DOKUMEN */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{currentViewDocument?.fileName}</DialogTitle>
              <DialogDescription>
                Preview dokumen investigasi. File akan ditampilkan dalam format aslinya.
              </DialogDescription>
            </DialogHeader>
            {currentViewDocument && (
              <div className="w-full h-[60vh]">
                {viewError ? (
                  <div className="flex items-center justify-center h-full text-red-500">
                    {viewError}
                  </div>
                ) : (
                  <iframe
                    src={currentViewDocument.url}
                    className="w-full h-full border rounded"
                    title={currentViewDocument.fileName}
                    onError={() =>
                      setViewError("File tidak ditemukan atau tidak dapat ditampilkan")
                    }
                  />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
