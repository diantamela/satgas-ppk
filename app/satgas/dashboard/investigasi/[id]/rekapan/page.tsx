"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [investigationProcesses, setInvestigationProcesses] = useState<any[]>([]);
  const [processError, setProcessError] = useState<string | null>(null);
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
            // Jangan melempar error ke console yang memicu noise di devtools;
            // simpan pesan error dan lanjutkan tampilkan UI fallback.
            setProcessError(reportData.message || "Gagal mengambil data laporan");
          }

          // Fetch investigation process
          const processResponse = await fetch(`/api/reports/${reportId}/process`);
          const processData = await processResponse.json();
          if (processData && processData.success) {
            // Handle both single process and array format from API
            if (Array.isArray(processData.process)) {
              setInvestigationProcesses(processData.process);
            } else {
              setInvestigationProcesses([processData.process]);
            }
            setProcessError(null);
          } else {
            // Jika API gagal, coba baca fallback dari localStorage supaya rekapan tetap menampilkan hasil form
            try {
              if (typeof window !== 'undefined') {
                const key = `investigation_process_${reportId}`;
                const raw = window.localStorage.getItem(key);
                if (raw) {
                  const parsed = JSON.parse(raw);
                  // Handle both old single entry format and new array format
                  if (Array.isArray(parsed)) {
                    setInvestigationProcesses(parsed);
                    setProcessError(`Menampilkan ${parsed.length} data proses investigasi dari penyimpanan lokal (fallback)`);
                  } else {
                    // Backward compatibility for old single entry format
                    setInvestigationProcesses([parsed]);
                    setProcessError('Menampilkan data dari penyimpanan lokal (fallback)');
                  }
                } else {
                  const msg = processData?.message || "Gagal mengambil data proses investigasi";
                  setProcessError(msg);
                  console.warn("Investigation process fetch failed:", msg);
                }
              }
            } catch (e) {
              const msg = processData?.message || "Gagal mengambil data proses investigasi";
              setProcessError(msg);
              console.warn("Investigation process fetch failed and fallback failed:", e);
            }
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

        {processError && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="font-semibold text-yellow-700 dark:text-yellow-300">Informasi Proses Investigasi</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-200">{processError}</div>
                </div>
              </div>
            </div>
          </div>
        )}
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
            {investigationProcesses.length > 0 && (
              <>
                {/* Show latest process entry */}
                {(() => {
                  const latestProcess = investigationProcesses[investigationProcesses.length - 1];
                  return (
                    <>
                      {/* Info Dasar Sesi */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Info Dasar Sesi Investigasi (Terbaru)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {latestProcess.data.startDateTime && (
                              <div>
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal & Jam Mulai</h4>
                                <p className="text-gray-900 dark:text-white">
                                  {new Date(latestProcess.data.startDateTime).toLocaleString('id-ID')}
                                </p>
                              </div>
                            )}
                            {latestProcess.data.endDateTime && (
                              <div>
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal & Jam Selesai</h4>
                                <p className="text-gray-900 dark:text-white">
                                  {new Date(latestProcess.data.endDateTime).toLocaleString('id-ID')}
                                </p>
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi Investigasi</h4>
                            <p className="text-gray-900 dark:text-white">{latestProcess.data.location}</p>
                          </div>

                          {latestProcess.data.methods && latestProcess.data.methods.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Metode/Bentuk Kegiatan</h4>
                              <div className="flex flex-wrap gap-2">
                                {latestProcess.data.methods.map((method: string) => (
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

                          {latestProcess.data.partiesInvolved && latestProcess.data.partiesInvolved.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Pihak yang Dilibatkan</h4>
                              <div className="flex flex-wrap gap-2">
                                {latestProcess.data.partiesInvolved.map((party: string) => (
                                  <Badge key={party} variant="outline">
                                    {party === 'VICTIM_SURVIVOR' && 'Korban/Penyintas'}
                                    {party === 'REPORTED_PERSON' && 'Terlapor'}
                                    {party === 'WITNESS' && 'Saksi'}
                                    {party === 'OTHER_PARTY' && 'Pihak Lain'}
                                  </Badge>
                                ))}
                              </div>
                              {latestProcess.data.otherPartiesDetails && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  {latestProcess.data.otherPartiesDetails}
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
                          {latestProcess.data.teamMembers && latestProcess.data.teamMembers.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Anggota Tim Investigasi</h4>
                              <div className="space-y-3">
                                {latestProcess.data.teamMembers.map((member: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{member.userId || 'Anggota Tim'}</p>
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
                                <Badge variant={latestProcess.data.consentObtained ? "default" : "secondary"}>
                                  {latestProcess.data.consentObtained ? "✓ Disetujui" : "✗ Belum Disetujui"}
                                </Badge>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Informed consent diperoleh</span>
                              </div>
                              {latestProcess.data.consentDocumentation && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Dokumentasi: {latestProcess.data.consentDocumentation}
                                </p>
                              )}
                            </div>
                          </div>

                          {latestProcess.data.riskNotes && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Risiko & Keamanan</h4>
                              <p className="text-gray-900 dark:text-white text-sm">{latestProcess.data.riskNotes}</p>
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
                          {latestProcess.data.planSummary && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Ringkasan Rencana</h4>
                              <p className="text-gray-900 dark:text-white">{latestProcess.data.planSummary}</p>
                            </div>
                          )}

                          {latestProcess.data.followUpAction && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Jadwal Tindak Lanjut</h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {latestProcess.data.followUpAction === 'CONTINUE' && 'Lanjut ke Tahap Selanjutnya'}
                                    {latestProcess.data.followUpAction === 'STOP' && 'Stop Investigasi'}
                                    {latestProcess.data.followUpAction === 'FOLLOW_UP' && 'Perlu Tindak Lanjut'}
                                  </Badge>
                                  {latestProcess.data.followUpDate && (
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      Tanggal: {new Date(latestProcess.data.followUpDate).toLocaleDateString('id-ID')}
                                    </span>
                                  )}
                                </div>
                                {latestProcess.data.followUpNotes && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {latestProcess.data.followUpNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Level Akses & Kerahasiaan</h4>
                            <Badge variant="secondary">
                              {latestProcess.data.accessLevel === 'CORE_TEAM_ONLY' && 'Hanya Tim Inti'}
                              {latestProcess.data.accessLevel === 'FULL_SATGAS' && 'Satgas Penuh'}
                              {latestProcess.data.accessLevel === 'LEADERSHIP_ONLY' && 'Pimpinan Tertentu'}
                            </Badge>
                          </div>

                          {latestProcess.data.uploadedFiles && latestProcess.data.uploadedFiles.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Dokumen & Lampiran</h4>
                              <div className="space-y-2">
                                {latestProcess.data.uploadedFiles.map((file: any, index: number) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB • {file.type}
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
                  );
                })()}

                {/* History of Process Entries */}
                {investigationProcesses.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Riwayat Proses Investigasi
                      </CardTitle>
                      <CardDescription>
                        Semua proses investigasi yang telah dilakukan untuk laporan ini ({investigationProcesses.length} entries)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800">
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                No
                              </th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tanggal Dibuat
                              </th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Lokasi
                              </th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Metode
                              </th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tim
                              </th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Dokumen
                              </th>
                              <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {investigationProcesses.map((processEntry, entryIndex) => (
                              <tr key={processEntry.id || entryIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {entryIndex + 1}
                                </td>
                                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {new Date(processEntry.savedAt).toLocaleDateString('id-ID')}
                                  <br />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(processEntry.savedAt).toLocaleTimeString('id-ID')}
                                  </span>
                                </td>
                                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {processEntry.data.location || '-'}
                                </td>
                                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm">
                                  <div className="flex flex-wrap gap-1">
                                    {processEntry.data.methods && processEntry.data.methods.slice(0, 2).map((method: string) => (
                                      <Badge key={method} variant="secondary" className="text-xs">
                                        {method === 'INTERVIEW' && 'Wawancara'}
                                        {method === 'WRITTEN_CLARIFICATION' && 'Klarifikasi Tertulis'}
                                        {method === 'LOCATION_OBSERVATION' && 'Observasi Lokasi'}
                                        {method === 'DIGITAL_EVIDENCE_COLLECTION' && 'Pengumpulan Bukti Digital'}
                                        {method === 'MEDIATION' && 'Mediasi'}
                                        {method === 'OTHER' && 'Lainnya'}
                                      </Badge>
                                    ))}
                                    {processEntry.data.methods && processEntry.data.methods.length > 2 && (
                                      <Badge variant="outline" className="text-xs">+{processEntry.data.methods.length - 2}</Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {processEntry.data.teamMembers ? `${processEntry.data.teamMembers.length} orang` : '0 orang'}
                                </td>
                                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {processEntry.data.uploadedFiles ? `${processEntry.data.uploadedFiles.length} file` : '0 file'}
                                </td>
                                <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center">
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // Create a detailed view modal or expand row
                                        const details = `
Proses #${entryIndex + 1}
Tanggal: ${new Date(processEntry.savedAt).toLocaleString('id-ID')}
Lokasi: ${processEntry.data.location || 'Tidak ditentukan'}

Metode: ${processEntry.data.methods ? processEntry.data.methods.map((m: string) =>
  m === 'INTERVIEW' ? 'Wawancara' :
  m === 'WRITTEN_CLARIFICATION' ? 'Klarifikasi Tertulis' :
  m === 'LOCATION_OBSERVATION' ? 'Observasi Lokasi' :
  m === 'DIGITAL_EVIDENCE_COLLECTION' ? 'Pengumpulan Bukti Digital' :
  m === 'MEDIATION' ? 'Mediasi' : 'Lainnya'
).join(', ') : 'Tidak ada'}

Tim Investigasi: ${processEntry.data.teamMembers ? processEntry.data.teamMembers.length + ' anggota' : 'Tidak ada'}

Dokumen: ${processEntry.data.uploadedFiles ? processEntry.data.uploadedFiles.length + ' file' : 'Tidak ada'}

Ringkasan: ${processEntry.data.planSummary || 'Tidak ada'}
                                        `;
                                        alert(details);
                                      }}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      Lihat
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // Generate and download a simple text report
                                        const reportContent = `
LAPORAN PROSES INVESTIGASI
==========================

Laporan ID: ${report.reportNumber}
Proses #: ${entryIndex + 1}
Tanggal Dibuat: ${new Date(processEntry.savedAt).toLocaleString('id-ID')}

INFORMASI DASAR:
- Lokasi: ${processEntry.data.location || 'Tidak ditentukan'}
- Tanggal Mulai: ${processEntry.data.startDateTime ? new Date(processEntry.data.startDateTime).toLocaleString('id-ID') : 'Tidak ditentukan'}
- Tanggal Selesai: ${processEntry.data.endDateTime ? new Date(processEntry.data.endDateTime).toLocaleString('id-ID') : 'Tidak ditentukan'}

METODE YANG DIGUNAKAN:
${processEntry.data.methods ? processEntry.data.methods.map((m: string) =>
  `- ${m === 'INTERVIEW' ? 'Wawancara' :
     m === 'WRITTEN_CLARIFICATION' ? 'Klarifikasi Tertulis' :
     m === 'LOCATION_OBSERVATION' ? 'Observasi Lokasi' :
     m === 'DIGITAL_EVIDENCE_COLLECTION' ? 'Pengumpulan Bukti Digital' :
     m === 'MEDIATION' ? 'Mediasi' : 'Lainnya'}`
).join('\n') : '- Tidak ada metode yang dipilih'}

PIHAK YANG DILIBATKAN:
${processEntry.data.partiesInvolved ? processEntry.data.partiesInvolved.map((p: string) =>
  `- ${p === 'VICTIM_SURVIVOR' ? 'Korban/Penyintas' :
     p === 'REPORTED_PERSON' ? 'Terlapor' :
     p === 'WITNESS' ? 'Saksi' :
     p === 'OTHER_PARTY' ? 'Pihak Lain' : p}`
).join('\n') : '- Tidak ada pihak yang dilibatkan'}

${processEntry.data.otherPartiesDetails ? `Detail Pihak Lain: ${processEntry.data.otherPartiesDetails}` : ''}

TIM INVESTIGASI:
${processEntry.data.teamMembers ? processEntry.data.teamMembers.map((member: any, idx: number) =>
  `${idx + 1}. ${member.userId || 'Anggota'} - ${member.role === 'TEAM_LEADER' ? 'Ketua Tim' :
    member.role === 'NOTE_TAKER' ? 'Pencatat' :
    member.role === 'PSYCHOLOGICAL_SUPPORT' ? 'Pendamping Psikologis' :
    member.role === 'LEGAL_SUPPORT' ? 'Pendamping Hukum' :
    member.role === 'INVESTIGATOR' ? 'Investigator' :
    member.role === 'OTHER' ? (member.customRole || 'Lainnya') : member.role}`
).join('\n') : '- Tidak ada anggota tim'}

PERSYARATAN & KERAHASIAAN:
- Informed Consent: ${processEntry.data.consentObtained ? 'Ya' : 'Tidak'}
${processEntry.data.consentDocumentation ? `- Dokumentasi: ${processEntry.data.consentDocumentation}` : ''}

CATATAN RISIKO & KEAMANAN:
${processEntry.data.riskNotes || 'Tidak ada catatan'}

RINGKASAN RENCANA:
${processEntry.data.planSummary || 'Tidak ada ringkasan'}

TINDAK LANJUT:
${processEntry.data.followUpAction ?
  `- ${processEntry.data.followUpAction === 'CONTINUE' ? 'Lanjut ke Tahap Selanjutnya' :
     processEntry.data.followUpAction === 'STOP' ? 'Stop Investigasi' :
     processEntry.data.followUpAction === 'FOLLOW_UP' ? 'Perlu Tindak Lanjut' : processEntry.data.followUpAction}` +
  (processEntry.data.followUpDate ? `\n- Tanggal Target: ${new Date(processEntry.data.followUpDate).toLocaleDateString('id-ID')}` : '') +
  (processEntry.data.followUpNotes ? `\n- Catatan: ${processEntry.data.followUpNotes}` : '') : 'Tidak ada tindak lanjut'}

LEVEL AKSES:
${processEntry.data.accessLevel === 'CORE_TEAM_ONLY' ? 'Hanya Tim Inti' :
  processEntry.data.accessLevel === 'FULL_SATGAS' ? 'Satgas Penuh' :
  processEntry.data.accessLevel === 'LEADERSHIP_ONLY' ? 'Pimpinan Tertentu' : 'Tidak ditentukan'}

DOKUMEN LAMPIRAN:
${processEntry.data.uploadedFiles ? processEntry.data.uploadedFiles.map((file: any, idx: number) =>
  `${idx + 1}. ${file.name} (${(file.size / 1024).toFixed(1)} KB - ${file.type})`
).join('\n') : 'Tidak ada dokumen'}

---
Dibuat pada: ${new Date(processEntry.savedAt).toLocaleString('id-ID')}
                                        `;

                                        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `proses-investigasi-${report.reportNumber}-entry-${entryIndex + 1}.txt`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                      }}
                                    >
                                      <Download className="w-3 h-3 mr-1" />
                                      Unduh
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Scheduling Information */}
            {(report.scheduledDate || investigationProcesses.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Informasi Penjadwalan Proses Investigasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Scheduling Info */}
                  {report.scheduledDate && (
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
                  )}

                  {/* Investigation Process Details */}
                  {investigationProcesses.length > 0 && (
                    <>
                      <Separator />

                      {/* Session Timing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {investigationProcesses[investigationProcesses.length - 1].data.startDateTime && (
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Waktu Mulai Proses</h4>
                            <p className="text-gray-900 dark:text-white">
                              {new Date(investigationProcesses[investigationProcesses.length - 1].data.startDateTime).toLocaleString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                        {investigationProcesses[investigationProcesses.length - 1].data.endDateTime && (
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Waktu Selesai Proses</h4>
                            <p className="text-gray-900 dark:text-white">
                              {new Date(investigationProcesses[investigationProcesses.length - 1].data.endDateTime).toLocaleString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Location and Methods */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi Pelaksanaan</h4>
                          <p className="text-gray-900 dark:text-white">{investigationProcesses[investigationProcesses.length - 1].data.location || 'Belum ditentukan'}</p>
                        </div>
                        {investigationProcesses[investigationProcesses.length - 1].data.methods && investigationProcesses[investigationProcesses.length - 1].data.methods.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Metode Kegiatan</h4>
                            <div className="flex flex-wrap gap-1">
                              {investigationProcesses[investigationProcesses.length - 1].data.methods.map((method: string) => (
                                <Badge key={method} variant="outline" className="text-xs">
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
                      </div>

                      {/* Parties Involved */}
                      {investigationProcesses[investigationProcesses.length - 1].data.partiesInvolved && investigationProcesses[investigationProcesses.length - 1].data.partiesInvolved.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Pihak Terlibat</h4>
                          <div className="flex flex-wrap gap-2">
                            {investigationProcesses[investigationProcesses.length - 1].data.partiesInvolved.map((party: string) => (
                              <Badge key={party} variant="secondary" className="text-xs">
                                {party === 'VICTIM_SURVIVOR' && 'Korban/Penyintas'}
                                {party === 'REPORTED_PERSON' && 'Terlapor'}
                                {party === 'WITNESS' && 'Saksi'}
                                {party === 'OTHER_PARTY' && 'Pihak Lain'}
                              </Badge>
                            ))}
                          </div>
                          {investigationProcesses[investigationProcesses.length - 1].data.otherPartiesDetails && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              Detail: {investigationProcesses[investigationProcesses.length - 1].data.otherPartiesDetails}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Team Members Summary */}
                      {investigationProcesses[investigationProcesses.length - 1].data.teamMembers && investigationProcesses[investigationProcesses.length - 1].data.teamMembers.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tim Investigasi ({investigationProcesses[investigationProcesses.length - 1].data.teamMembers.length} orang)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {investigationProcesses[investigationProcesses.length - 1].data.teamMembers.slice(0, 4).map((member: any, index: number) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium text-gray-900 dark:text-white">{member.userId || 'Anggota'}</span>
                                <span className="text-gray-600 dark:text-gray-400 ml-2">
                                  ({member.role === 'TEAM_LEADER' && 'Ketua Tim'}
                                  {member.role === 'NOTE_TAKER' && 'Pencatat'}
                                  {member.role === 'PSYCHOLOGICAL_SUPPORT' && 'Pendamping Psikologis'}
                                  {member.role === 'LEGAL_SUPPORT' && 'Pendamping Hukum'}
                                  {member.role === 'INVESTIGATOR' && 'Investigator'}
                                  {member.role === 'OTHER' && (member.customRole || 'Lainnya')})
                                </span>
                              </div>
                            ))}
                            {investigationProcesses[investigationProcesses.length - 1].data.teamMembers.length > 4 && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                +{investigationProcesses[investigationProcesses.length - 1].data.teamMembers.length - 4} anggota lainnya
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Consent and Security */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Status Persetujuan</h4>
                          <Badge variant={investigationProcesses[investigationProcesses.length - 1].data.consentObtained ? "default" : "destructive"}>
                            {investigationProcesses[investigationProcesses.length - 1].data.consentObtained ? "✓ Informed Consent Diperoleh" : "✗ Belum Diperoleh"}
                          </Badge>
                          {investigationProcesses[investigationProcesses.length - 1].data.consentDocumentation && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {investigationProcesses[investigationProcesses.length - 1].data.consentDocumentation}
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Level Akses</h4>
                          <Badge variant="outline">
                            {investigationProcesses[investigationProcesses.length - 1].data.accessLevel === 'CORE_TEAM_ONLY' && 'Hanya Tim Inti'}
                            {investigationProcesses[investigationProcesses.length - 1].data.accessLevel === 'FULL_SATGAS' && 'Satgas Penuh'}
                            {investigationProcesses[investigationProcesses.length - 1].data.accessLevel === 'LEADERSHIP_ONLY' && 'Pimpinan Tertentu'}
                          </Badge>
                        </div>
                      </div>

                      {/* Risk Notes */}
                      {investigationProcesses[investigationProcesses.length - 1].data.riskNotes && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Risiko & Keamanan</h4>
                          <p className="text-sm text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            {investigationProcesses[investigationProcesses.length - 1].data.riskNotes}
                          </p>
                        </div>
                      )}

                      {/* Plan Summary */}
                      {investigationProcesses[investigationProcesses.length - 1].data.planSummary && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Ringkasan Rencana Investigasi</h4>
                          <p className="text-sm text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            {investigationProcesses[investigationProcesses.length - 1].data.planSummary}
                          </p>
                        </div>
                      )}

                      {/* Follow-up Action */}
                      {investigationProcesses[investigationProcesses.length - 1].data.followUpAction && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Status & Tindak Lanjut</h4>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">
                              {investigationProcesses[investigationProcesses.length - 1].data.followUpAction === 'CONTINUE' && 'Lanjut ke Tahap Selanjutnya'}
                              {investigationProcesses[investigationProcesses.length - 1].data.followUpAction === 'STOP' && 'Stop Investigasi'}
                              {investigationProcesses[investigationProcesses.length - 1].data.followUpAction === 'FOLLOW_UP' && 'Perlu Tindak Lanjut'}
                            </Badge>
                            {investigationProcesses[investigationProcesses.length - 1].data.followUpDate && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Target: {new Date(investigationProcesses[investigationProcesses.length - 1].data.followUpDate).toLocaleDateString('id-ID')}
                              </span>
                            )}
                          </div>
                          {investigationProcesses[investigationProcesses.length - 1].data.followUpNotes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {investigationProcesses[investigationProcesses.length - 1].data.followUpNotes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Attachments Summary */}
                      {investigationProcesses[investigationProcesses.length - 1].data.uploadedFiles && investigationProcesses[investigationProcesses.length - 1].data.uploadedFiles.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Dokumen Lampiran ({investigationProcesses[investigationProcesses.length - 1].data.uploadedFiles.length} file)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {investigationProcesses[investigationProcesses.length - 1].data.uploadedFiles.slice(0, 4).map((file: any, index: number) => (
                              <div key={index} className="text-sm flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <FileText className="w-3 h-3 text-gray-500" />
                                <span className="truncate">{file.name}</span>
                                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                              </div>
                            ))}
                            {investigationProcesses[investigationProcesses.length - 1].data.uploadedFiles.length > 4 && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 p-2">
                                +{investigationProcesses[investigationProcesses.length - 1].data.uploadedFiles.length - 4} file lainnya
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Fallback message if no detailed data */}
                  {investigationProcesses.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Detail lengkap proses investigasi dapat dilihat di halaman Proses Investigasi
                    </div>
                  )}
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