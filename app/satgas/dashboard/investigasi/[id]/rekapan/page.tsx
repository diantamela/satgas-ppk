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
  const [investigationProcess, setInvestigationProcess] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch report details and investigation process
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const reportId = Array.isArray(id) ? id[0] : id;

          // Fetch report
          const reportResponse = await fetch(`/api/reports/${reportId}`);
          const reportData = await reportResponse.json();
          if (reportData.success) {
            setReport(reportData.report);
          } else {
            console.error("Error fetching report:", reportData.message);
          }

          // Fetch investigation process
          const processResponse = await fetch(`/api/reports/${reportId}/process`);
          const processData = await processResponse.json();
          if (processData.success) {
            setInvestigationProcess(processData.process);
          } else {
            console.error("Error fetching investigation process:", processData.message);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

            {/* Investigation Process Details */}
            {investigationProcess && (
              <>
                {/* Info Dasar Sesi */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Info Dasar Sesi Investigasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {investigationProcess.startDateTime && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal & Jam Mulai</h4>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(investigationProcess.startDateTime).toLocaleString('id-ID')}
                          </p>
                        </div>
                      )}
                      {investigationProcess.endDateTime && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal & Jam Selesai</h4>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(investigationProcess.endDateTime).toLocaleString('id-ID')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi Investigasi</h4>
                      <p className="text-gray-900 dark:text-white">{investigationProcess.location}</p>
                    </div>

                    {investigationProcess.methods && investigationProcess.methods.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Metode/Bentuk Kegiatan</h4>
                        <div className="flex flex-wrap gap-2">
                          {investigationProcess.methods.map((method: string) => (
                            <Badge key={method} variant="secondary">
                              {method === 'INTERVIEW' && 'Wawancara'}
                              {method === 'WRITTEN_CLARIFICATION' && 'Klarifikasi Tertulis'}
                              {method === 'LOCATION_OBSERVATION' && 'Observasi Lokasi'}
                              {method === 'DIGITAL_EVIDENCE_COLLECTION' && 'Pengumpulan Bukti Digital'}
                              {method === 'MEDIATION' && 'Mediasi'}
                              {method === 'OTHER' && 'Lainnya'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {investigationProcess.partiesInvolved && investigationProcess.partiesInvolved.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Pihak yang Dilibatkan</h4>
                        <div className="flex flex-wrap gap-2">
                          {investigationProcess.partiesInvolved.map((party: string) => (
                            <Badge key={party} variant="outline">
                              {party === 'VICTIM_SURVIVOR' && 'Korban/Penyintas'}
                              {party === 'REPORTED_PERSON' && 'Terlapor'}
                              {party === 'WITNESS' && 'Saksi'}
                              {party === 'OTHER_PARTY' && 'Pihak Lain'}
                            </Badge>
                          ))}
                        </div>
                        {investigationProcess.otherPartiesDetails && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {investigationProcess.otherPartiesDetails}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tim & Tugas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Tim & Tugas Investigasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {investigationProcess.teamMembers && investigationProcess.teamMembers.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Anggota Tim Investigasi</h4>
                        <div className="space-y-3">
                          {investigationProcess.teamMembers.map((member: any) => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{member.user.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {member.role === 'TEAM_LEADER' && 'Ketua Tim'}
                                  {member.role === 'NOTE_TAKER' && 'Pencatat'}
                                  {member.role === 'PSYCHOLOGICAL_SUPPORT' && 'Pendamping Psikologis'}
                                  {member.role === 'LEGAL_SUPPORT' && 'Pendamping Hukum'}
                                  {member.role === 'INVESTIGATOR' && 'Investigator'}
                                  {member.role === 'OTHER' && (member.customRole || 'Lainnya')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Persetujuan & Kerahasiaan</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={investigationProcess.consentObtained ? "default" : "secondary"}>
                            {investigationProcess.consentObtained ? "✓ Disetujui" : "✗ Belum Disetujui"}
                          </Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Informed consent diperoleh</span>
                        </div>
                        {investigationProcess.consentDocumentation && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Dokumentasi: {investigationProcess.consentDocumentation}
                          </p>
                        )}
                      </div>
                    </div>

                    {investigationProcess.riskNotes && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Risiko & Keamanan</h4>
                        <p className="text-gray-900 dark:text-white text-sm">{investigationProcess.riskNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Output & Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Output & Status Investigasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {investigationProcess.planSummary && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Ringkasan Rencana</h4>
                        <p className="text-gray-900 dark:text-white">{investigationProcess.planSummary}</p>
                      </div>
                    )}

                    {investigationProcess.followUpAction && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Jadwal Tindak Lanjut</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {investigationProcess.followUpAction === 'CONTINUE' && 'Lanjut ke Tahap Selanjutnya'}
                              {investigationProcess.followUpAction === 'STOP' && 'Stop Investigasi'}
                              {investigationProcess.followUpAction === 'FOLLOW_UP' && 'Perlu Tindak Lanjut'}
                            </Badge>
                            {investigationProcess.followUpDate && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Tanggal: {new Date(investigationProcess.followUpDate).toLocaleDateString('id-ID')}
                              </span>
                            )}
                          </div>
                          {investigationProcess.followUpNotes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {investigationProcess.followUpNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Level Akses & Kerahasiaan</h4>
                      <Badge variant="secondary">
                        {investigationProcess.accessLevel === 'CORE_TEAM_ONLY' && 'Hanya Tim Inti'}
                        {investigationProcess.accessLevel === 'FULL_SATGAS' && 'Satgas Penuh'}
                        {investigationProcess.accessLevel === 'LEADERSHIP_ONLY' && 'Pimpinan Tertentu'}
                      </Badge>
                    </div>

                    {investigationProcess.attachments && investigationProcess.attachments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Dokumen & Lampiran</h4>
                        <div className="space-y-2">
                          {investigationProcess.attachments.map((attachment: any) => (
                            <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {(attachment.fileSize / 1024).toFixed(1)} KB • {attachment.fileType}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

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