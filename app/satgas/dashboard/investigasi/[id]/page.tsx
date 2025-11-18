"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
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
  Loader2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function InvestigationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Action states
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [notesType, setNotesType] = useState<"investigation" | "recommendation">("investigation");
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
        a.download = `laporan-${report?.reportNumber || id}.pdf`;
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

  const handleCompleteInvestigation = async () => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reports/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.report);
        setAlertMessage({ type: 'success', message: 'Investigasi berhasil diselesaikan' });
        setTimeout(() => setAlertMessage(null), 3000);
      } else {
        setAlertMessage({ type: 'error', message: data.message || 'Gagal menyelesaikan investigasi' });
      }
    } catch (error) {
      console.error('Complete investigation error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat menyelesaikan investigasi' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartInvestigation = async () => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reports/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.report);
        setAlertMessage({ type: 'success', message: 'Investigasi berhasil dimulai' });
        setTimeout(() => setAlertMessage(null), 3000);
      } else {
        setAlertMessage({ type: 'error', message: data.message || 'Gagal memulai investigasi' });
      }
    } catch (error) {
      console.error('Start investigation error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat memulai investigasi' });
    } finally {
      setIsSubmitting(false);
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
        {alertMessage && (
          <Alert className={`mb-6 ${alertMessage.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
            <AlertDescription className={alertMessage.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
              {alertMessage.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Button variant="outline" size="sm" asChild>
              <Link href="/satgas/dashboard/investigasi">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Detail Investigasi</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{report.reportNumber}</span>
                <span>{getStatusBadge(report.status)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {report.status === 'SCHEDULED' && (
              <Button
                onClick={handleStartInvestigation}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                Mulai Investigasi
              </Button>
            )}
            <Button onClick={() => setShowNotesDialog(true)} disabled={isSubmitting}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Tambah Catatan
            </Button>
            <Button
              onClick={handleCompleteInvestigation}
              disabled={isSubmitting || report.status === 'COMPLETED'}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Selesai Investigasi
            </Button>
          </div>
        </div>

        {/* Progress Section */}
        <Card className="mb-6">
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
                <Progress value={report.investigationProgress || 0} className="w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">Pengumpulan Data</div>
                  <div className="text-gray-600 dark:text-gray-400">25%</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="font-semibold text-yellow-600 dark:text-yellow-400">Analisis</div>
                  <div className="text-gray-600 dark:text-gray-400">50%</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="font-semibold text-green-600 dark:text-green-400">Penyusunan Laporan</div>
                  <div className="text-gray-600 dark:text-gray-400">75%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling Information */}
        {report.scheduledDate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informasi Penjadwalan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai Dijadwalkan</h3>
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
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Penjadwalan</h3>
                    <p className="text-gray-900 dark:text-white">{report.scheduledNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
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
                  <FileText className="w-5 h-5" />
                  Bukti dari Pelapor
                  {report.evidenceCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {report.evidenceCount} file{report.evidenceCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  File bukti disimpan di: <code>public/uploads/evidence/</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.documents && report.documents.filter((doc: any) => doc.documentType === 'EVIDENCE').length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.documents.filter((doc: any) => doc.documentType === 'EVIDENCE').map((doc: any) => (
                        <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">{doc.fileName}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {(doc.fileSize / 1024).toFixed(1)} KB • {doc.fileType}
                              </p>
                              {doc.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/documents/${doc.id}/download`);
                                  const data = await response.json();
                                  if (data.success) {
                                    window.open(data.url, '_blank');
                                  } else {
                                    alert('Gagal mendapatkan URL download');
                                  }
                                } catch (error) {
                                  alert('Terjadi kesalahan saat mengunduh');
                                }
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Unduh
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">Tidak ada bukti yang diupload pelapor</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Catatan Investigasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.decisionNotes ? (
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Investigasi</h3>
                      <p className="text-gray-600 dark:text-gray-300">{report.decisionNotes}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">Belum ada catatan investigasi</p>
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
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Nama</h3>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    {report.reporter?.name || 'N/A'}
                  </p>
                </div>
                {report.reporter?.email && (
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Email</h3>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {report.reporter.email}
                    </p>
                  </div>
                )}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Catatan Investigasi</DialogTitle>
            <DialogDescription>
              Tambahkan catatan untuk proses investigasi laporan ini.
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
                <option value="investigation">Catatan Investigasi</option>
                <option value="recommendation">Rekomendasi</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Catatan</label>
              <Textarea
                placeholder="Masukkan catatan investigasi..."
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
    </div>
  );
}