"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  ArrowLeft,
  Download,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function InvestigationResultDetailPage() {
  const { id, resultId } = useParams();
  const [result, setResult] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id || !resultId) return;

        const reportId = Array.isArray(id) ? id[0] : id;
        const resultIdStr = Array.isArray(resultId) ? resultId[0] : resultId;

        // Fetch report data
        const reportResponse = await fetch(`/api/reports/${reportId}`);
        const reportData = await reportResponse.json();
        if (reportData.success) {
          setReport(reportData.report);
        }

        // Fetch investigation result
        const resultResponse = await fetch(`/api/reports/${reportId}/results`);
        if (resultResponse.ok) {
          const resultsData = await resultResponse.json();
          if (resultsData.success && resultsData.results) {
            const foundResult = resultsData.results.find((r: any) => r.id === resultIdStr);
            if (foundResult) {
              setResult(foundResult);
            } else {
              setError("Hasil investigasi tidak ditemukan");
            }
          } else {
            setError("Gagal memuat data hasil investigasi");
          }
        } else {
          setError("Gagal memuat data hasil investigasi");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, resultId]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID");
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID");
  };

  const handleDownloadResultPdf = async () => {
    if (!id || !resultId) return;
    const reportId = Array.isArray(id) ? id[0] : id;
    const resultIdStr = Array.isArray(resultId) ? resultId[0] : resultId;

    try {
      const response = await fetch(`/api/reports/${reportId}/results/${resultIdStr}/pdf`);
      if (!response.ok) {
        alert("Gagal mengunduh PDF hasil investigasi");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `berita-acara-${report?.reportNumber || reportId}-${resultIdStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Terjadi kesalahan saat mengunduh PDF hasil investigasi");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-24" />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-32" />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || "Hasil Investigasi Tidak Ditemukan"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hasil investigasi dengan ID yang Anda cari tidak ditemukan.
          </p>
          <Button asChild>
            <Link href={`/satgas/dashboard/investigasi/${id}/rekapan`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Rekapan
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/satgas/dashboard/investigasi/${id}/rekapan`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Detail Berita Acara Investigasi
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {result.schedulingTitle || 'Sesi Investigasi'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Dibuat: {formatDateTime(result.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadResultPdf}>
              <Download className="w-4 h-4 mr-2" />
              Unduh PDF
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Status Kasus
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status terbaru setelah hasil investigasi ini
                </p>
              </div>
              <Badge
                className={
                  result.caseStatusAfterResult === 'READY_FOR_RECOMMENDATION'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : result.caseStatusAfterResult === 'UNDER_INVESTIGATION'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : result.caseStatusAfterResult === 'FORWARDED_TO_REKTORAT'
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : result.caseStatusAfterResult === 'CLOSED_TERMINATED'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }
              >
                {result.caseStatusAfterResult === 'READY_FOR_RECOMMENDATION'
                  ? 'Siap untuk Rekomendasi'
                  : result.caseStatusAfterResult === 'UNDER_INVESTIGATION'
                  ? 'Sedang Dalam Investigasi'
                  : result.caseStatusAfterResult === 'FORWARDED_TO_REKTORAT'
                  ? 'Dikirim ke Rektorat'
                  : result.caseStatusAfterResult === 'CLOSED_TERMINATED'
                  ? 'Kasus Ditutup'
                  : result.caseStatusAfterResult}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Dasar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informasi Dasar Kegiatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Judul Kegiatan
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {result.schedulingTitle || 'Sesi Investigasi'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lokasi
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {result.schedulingLocation || '-'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Waktu Pelaksanaan
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {result.schedulingDateTime ? formatDateTime(result.schedulingDateTime) : '-'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nomor Laporan
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {result.reportNumber || report?.reportNumber || '-'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Judul Kasus
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {result.caseTitle || report?.caseTitle || '-'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal Pembuatan BA
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {formatDateTime(result.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Kehadiran */}
        {(result.satgasMembersPresent || result.partiesPresent) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Data Kehadiran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.satgasMembersPresent && Array.isArray(result.satgasMembersPresent) && result.satgasMembersPresent.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Anggota Sabtu yang Hadir ({result.satgasMembersPresent.length} orang)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.satgasMembersPresent.map((member: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {member.name || 'Anggota'}
                        </div>
                        {member.role && (
                          <div className="text-gray-600 dark:text-gray-400 text-sm">
                            {member.role}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {result.partiesPresent && Array.isArray(result.partiesPresent) && result.partiesPresent.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Status Kehadiran Pihak ({result.partiesPresent.length} pihak)
                  </h4>
                  <div className="space-y-2">
                    {result.partiesPresent.map((party: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {party.name || 'Pihak'}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-sm">
                            {party.role}
                          </div>
                        </div>
                        <Badge
                          variant={
                            party.status === 'PRESENT' ? 'default' :
                            party.status === 'ABSENT_WITH_REASON' ? 'secondary' : 'destructive'
                          }
                        >
                          {party.status === 'PRESENT' ? 'Hadir' :
                           party.status === 'ABSENT_WITH_REASON' ? 'Tidak Hadir (Ada Alasan)' : 'Tidak Hadir'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {result.attendanceNotes && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catatan Kehadiran
                  </h4>
                  <p className="text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    {result.attendanceNotes}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Verifikasi Identitas:
                </span>
                <Badge variant={result.identityVerified ? 'default' : 'secondary'}>
                  {result.identityVerified ? 'Sudah Diverifikasi' : 'Belum Diverifikasi'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Catatan Inti Investigasi */}
        <Card>
          <CardHeader>
            <CardTitle>Catatan Inti Investigasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.partiesStatementSummary && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ringkasan Keterangan Pihak
                </h4>
                <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                  {result.partiesStatementSummary}
                </div>
              </div>
            )}

            {result.newPhysicalEvidence && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temuan Bukti Fisik/Digital Baru
                </h4>
                <div className="text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 whitespace-pre-wrap">
                  {result.newPhysicalEvidence}
                </div>
              </div>
            )}

            {result.statementConsistency && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Konsistensi Keterangan
                </h4>
                <div className="text-gray-900 dark:text-white bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 whitespace-pre-wrap">
                  {result.statementConsistency}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kesimpulan & Rekomendasi */}
        <Card>
          <CardHeader>
            <CardTitle>Kesimpulan & Rekomendasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.sessionInterimConclusion && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kesimpulan Sementara dari Sesi Ini
                </h4>
                <div className="text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 whitespace-pre-wrap">
                  {result.sessionInterimConclusion}
                </div>
              </div>
            )}

            {result.recommendedImmediateActions && Array.isArray(result.recommendedImmediateActions) && result.recommendedImmediateActions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Rekomendasi Tindak Lanjut Segera ({result.recommendedImmediateActions.length} rekomendasi)
                </h4>
                <div className="space-y-3">
                  {result.recommendedImmediateActions.map((action: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {action.action || 'Tindakan'}
                        </h5>
                        <Badge variant={
                          action.priority === 'HIGH' ? 'destructive' :
                          action.priority === 'MEDIUM' ? 'default' : 'secondary'
                        }>
                          {action.priority === 'HIGH' ? 'Prioritas Tinggi' :
                           action.priority === 'MEDIUM' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                        </Badge>
                      </div>
                      {action.notes && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          <strong>Catatan:</strong> {action.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.statusChangeReason && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alasan Perubahan Status
                </h4>
                <div className="text-gray-900 dark:text-white bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 whitespace-pre-wrap">
                  {result.statusChangeReason}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bukti yang Diupload */}
        {result.evidenceFiles && Array.isArray(result.evidenceFiles) && result.evidenceFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bukti yang Diupload</CardTitle>
              <CardDescription>
                {result.evidenceFiles.length} file bukti yang dilampirkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.evidenceFiles.map((file: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <FileText className="w-8 h-8 text-gray-500" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {file.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {(file.size / 1024).toFixed(1)} KB • {file.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tanda Tangan Digital */}
        <Card>
          <CardHeader>
            <CardTitle>Tanda Tangan Digital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Pembuat Berita Acara
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      result.creatorDigitalSignature ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {result.creatorDigitalSignature ? 'Tertandatangani' : 'Belum ditandatangani'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Nama: {result.creatorSignerName || '-'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Tanggal: {formatDateTime(result.creatorSignatureDate)}
                  </p>
                  {/* Display actual signature image */}
                  {result.creatorDigitalSignature && (
                    <div className="mt-3">
                      <img 
                        src={result.creatorDigitalSignature} 
                        alt="Tanda Tangan Pembuat"
                        className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Ketua Satuan Tugas
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      result.chairpersonDigitalSignature ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {result.chairpersonDigitalSignature ? 'Tertandatangani' : 'Belum ditandatangani'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Nama: {result.chairpersonSignerName || '-'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Tanggal: {formatDateTime(result.chairpersonSignatureDate)}
                  </p>
                  {/* Display actual signature image */}
                  {result.chairpersonDigitalSignature && (
                    <div className="mt-3">
                      <img 
                        src={result.chairpersonDigitalSignature} 
                        alt="Tanda Tangan Ketua"
                        className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Catatan Internal */}
        {result.internalSatgasNotes && (
          <Card>
            <CardHeader>
              <CardTitle>Catatan Internal OTAN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600 whitespace-pre-wrap">
                {result.internalSatgasNotes}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6">
          <Button variant="outline" asChild>
            <Link href={`/satgas/dashboard/investigasi/${id}/rekapan`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Rekapan
            </Link>
          </Button>
          <Button onClick={handleDownloadResultPdf}>
            <Download className="w-4 h-4 mr-2" />
            Unduh PDF
          </Button>
        </div>
      </div>
    </div>
  );
}