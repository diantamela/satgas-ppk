"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Shield,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("detail");

  // Action states
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [notesType, setNotesType] = useState<"verification" | "investigation" | "recommendation">("verification");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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
      case "pending":
        return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
      case "verified":
        return <Badge variant="default">Terverifikasi</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="default">Dalam Investigasi</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "completed":
        return <Badge variant="success">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Action handlers
  const handleDownloadReport = async () => {
    if (!id) return;

    try {
      const response = await fetch(`/api/reports/${id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-${report?.reportNumber || id}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setAlertMessage({ type: 'error', message: 'Gagal mengunduh laporan' });
      }
    } catch (error) {
      console.error('Download error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat mengunduh laporan' });
    }
  };

  const handleAddNotes = async () => {
    if (!id || !notesText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reports/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteType: notesType, notes: notesText }),
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.report);
        setShowNotesDialog(false);
        setNotesText("");
        setAlertMessage({ type: 'success', message: 'Catatan berhasil ditambahkan' });
        setTimeout(() => setAlertMessage(null), 3000);
      } else {
        setAlertMessage({ type: 'error', message: data.message || 'Gagal menambahkan catatan' });
      }
    } catch (error) {
      console.error('Add notes error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat menambahkan catatan' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: string, notes?: string) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reports/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.report);
        setShowRejectDialog(false);
        setNotesText("");
        setAlertMessage({
          type: 'success',
          message: status === 'rejected' ? 'Laporan berhasil ditolak' : 'Status laporan berhasil diperbarui'
        });
        setTimeout(() => setAlertMessage(null), 3000);
      } else {
        setAlertMessage({ type: 'error', message: data.message || 'Gagal memperbarui status' });
      }
    } catch (error) {
      console.error('Update status error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat memperbarui status' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    if (notesText.trim()) {
      handleUpdateStatus('rejected', notesText);
    }
  };

  const handleForward = () => {
    handleUpdateStatus('IN_PROGRESS');
  };

  const handleViewEvidence = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      const data = await response.json();

      if (data.success) {
        // Open the file in a new tab
        window.open(data.url, '_blank');
      } else {
        setAlertMessage({ type: 'error', message: data.message || 'Gagal membuka file' });
        setTimeout(() => setAlertMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error viewing evidence:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat membuka file' });
      setTimeout(() => setAlertMessage(null), 3000);
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
            <Link href="/satgas/dashboard/laporan">Kembali ke Daftar Laporan</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {alertMessage && (
          <Alert className={`mb-6 ${alertMessage.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
            <AlertDescription className={alertMessage.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
              {alertMessage.message}
            </AlertDescription>
          </Alert>
        )}

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
            <Button onClick={() => setShowNotesDialog(true)}>
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
                      {report.status === "PENDING" && <Clock className="w-4 h-4 text-yellow-500" />}
                      {report.status === "IN_PROGRESS" && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                      {report.status === "COMPLETED" && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {report.status !== "PENDING" && report.status !== "IN_PROGRESS" && report.status !== "COMPLETED" && <FileText className="w-4 h-4 text-blue-500" />}
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

            {report.documents && report.documents.filter((doc: any) => doc.documentType === 'EVIDENCE').length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Bukti Dokumentasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.documents.filter((doc: any) => doc.documentType === 'EVIDENCE').map((file: any, index: number) => (
                      <div key={file.id || index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
                            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{file.fileName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{file.fileType} • {(file.fileSize / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEvidence(file.id)}
                        >
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
                  {report.decisionNotes && (
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Keputusan</h3>
                      <p className="text-gray-600 dark:text-gray-300">{report.decisionNotes}</p>
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
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleDownloadReport}
                  disabled={isSubmitting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Unduh Laporan
                </Button>
                <Button
                  className="w-full"
                  onClick={() => setShowNotesDialog(true)}
                  disabled={isSubmitting}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Tambah Catatan
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isSubmitting || report.status === 'rejected'}
                  >
                    Tolak
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleForward}
                    disabled={isSubmitting || report.status === 'IN_PROGRESS' || report.status === 'COMPLETED'}
                  >
                    Teruskan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Catatan</DialogTitle>
            <DialogDescription>
              Tambahkan catatan untuk laporan ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tipe Catatan</label>
              <select
                className="w-full mt-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                value={notesType}
                onChange={(e) => setNotesType(e.target.value as any)}
              >
                <option value="verification">Verifikasi</option>
                <option value="investigation">Investigasi</option>
                <option value="recommendation">Rekomendasi</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Catatan</label>
              <Textarea
                placeholder="Masukkan catatan..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleAddNotes} disabled={isSubmitting || !notesText.trim()}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Report Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Laporan</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan laporan ini.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Alasan Penolakan</label>
            <Textarea
              placeholder="Masukkan alasan penolakan..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting || !notesText.trim()}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tolak Laporan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}