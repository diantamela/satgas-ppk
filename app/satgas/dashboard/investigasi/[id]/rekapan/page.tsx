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
  AlertTriangle,
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type InvestigationProcess = {
  id?: string;
  savedAt: string;
  data: any; // sesuaikan dengan tipe API-mu kalau sudah fix
};

const methodLabels: Record<string, string> = {
  INTERVIEW: "Wawancara",
  WRITTEN_CLARIFICATION: "Klarifikasi Tertulis",
  LOCATION_OBSERVATION: "Observasi Lokasi",
  DIGITAL_EVIDENCE_COLLECTION: "Pengumpulan Bukti Digital",
  MEDIATION: "Mediasi",
  OTHER: "Lainnya",
};

const partyLabels: Record<string, string> = {
  VICTIM_SURVIVOR: "Korban/Penyintas",
  REPORTED_PERSON: "Terlapor",
  WITNESS: "Saksi",
  OTHER_PARTY: "Pihak Lain",
};

const roleLabels: Record<string, string> = {
  TEAM_LEADER: "Ketua Tim",
  NOTE_TAKER: "Pencatat",
  PSYCHOLOGICAL_SUPPORT: "Pendamping Psikologis",
  LEGAL_SUPPORT: "Pendamping Hukum",
  INVESTIGATOR: "Investigator",
  OTHER: "Lainnya",
};

const followUpLabels: Record<string, string> = {
  CONTINUE: "Lanjut ke Tahap Selanjutnya",
  STOP: "Stop Investigasi",
  FOLLOW_UP: "Perlu Tindak Lanjut",
};

const accessLevelLabels: Record<string, string> = {
  CORE_TEAM_ONLY: "Hanya Tim Inti",
  FULL_SATGAS: "Satgas Penuh",
  LEADERSHIP_ONLY: "Pimpinan Tertentu",
};

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID");
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID");
}

// Helper untuk text laporan (dipakai di PDF)
function buildProcessReportText(
  processEntry: InvestigationProcess,
  entryIndex: number,
  reportNumber: string
) {
  const d = processEntry.data;

  const methodsText = d.methods
    ? d.methods
        .map((m: string) => `- ${methodLabels[m] ?? m}`)
        .join("\n")
    : "- Tidak ada metode yang dipilih";

  const teamText = d.teamMembers
    ? d.teamMembers
        .map(
          (member: any, idx: number) =>
            `${idx + 1}. ${member.userId || "Anggota"} - ${
              member.role === "OTHER"
                ? member.customRole || roleLabels.OTHER
                : roleLabels[member.role] ?? member.role
            }`
        )
        .join("\n")
    : "- Tidak ada anggota tim";

  const docsText = d.uploadedFiles
    ? d.uploadedFiles
        .map(
          (file: any, idx: number) =>
            `${idx + 1}. ${file.name} (${(file.size / 1024).toFixed(
              1
            )} KB - ${file.type})`
        )
        .join("\n")
    : "Tidak ada dokumen";

  const followUpText = d.followUpAction
    ? `- ${
        followUpLabels[d.followUpAction] ?? d.followUpAction
      }${
        d.followUpDate ? `\n- Tanggal Target: ${formatDate(d.followUpDate)}` : ""
      }${d.followUpNotes ? `\n- Catatan: ${d.followUpNotes}` : ""}`
    : "Tidak ada tindak lanjut";

  return `
LAPORAN PROSES INVESTIGASI
==========================

Laporan ID: ${reportNumber}
Proses #: ${entryIndex + 1}
Tanggal Dibuat: ${formatDateTime(processEntry.savedAt)}

INFORMASI DASAR:
- Lokasi: ${d.location || "Tidak ditentukan"}
- Tanggal Mulai: ${
    d.startDateTime ? formatDateTime(d.startDateTime) : "Tidak ditentukan"
  }
- Tanggal Selesai: ${
    d.endDateTime ? formatDateTime(d.endDateTime) : "Tidak ditentukan"
  }

METODE YANG DIGUNAKAN:
${methodsText}

TIM INVESTIGASI:
${teamText}

PERSYARATAN & KERAHASIAAN:
- Informed Consent: ${d.consentObtained ? "Ya" : "Tidak"}
${
  d.consentDocumentation
    ? `- Dokumentasi: ${d.consentDocumentation}`
    : ""
}

CATATAN RISIKO & KEAMANAN:
${d.riskNotes || "Tidak ada catatan"}

RINGKASAN RENCANA:
${d.planSummary || "Tidak ada ringkasan"}

TINDAK LANJUT:
${followUpText}

LEVEL AKSES:
${
  accessLevelLabels[d.accessLevel] ??
  d.accessLevel ??
  "Tidak ditentukan"
}

DOKUMEN LAMPIRAN:
${docsText}

(catatan: gambar lampiran ditampilkan di halaman berikutnya jika tersedia)

---
Dibuat pada: ${formatDateTime(processEntry.savedAt)}
`;
}

// Helper: ambil gambar dari URL jadi dataURL (untuk jsPDF)
async function loadImageAsDataURL(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function InvestigationRekapanPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [investigationProcesses, setInvestigationProcesses] = useState<
    InvestigationProcess[]
  >([]);
  const [processError, setProcessError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProcess, setSelectedProcess] =
    useState<InvestigationProcess | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const reportId = Array.isArray(id) ? id[0] : id;

        // Fetch report
        const reportResponse = await fetch(`/api/reports/${reportId}`);
        const reportData = await reportResponse.json();
        if (reportData.success) {
          setReport(reportData.report);
        } else {
          setProcessError(reportData.message || "Gagal mengambil data laporan");
        }

        // Fetch investigation process
        const processResponse = await fetch(`/api/reports/${reportId}/process`);
        const processData = await processResponse.json();

        if (processData && processData.success) {
          if (Array.isArray(processData.process)) {
            setInvestigationProcesses(processData.process);
          } else {
            setInvestigationProcesses([processData.process]);
          }
          setProcessError(null);
        } else {
          // Fallback ke localStorage jika API gagal
          try {
            if (typeof window !== "undefined") {
              const key = `investigation_process_${reportId}`;
              const raw = window.localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  setInvestigationProcesses(parsed);
                  setProcessError(
                    `Menampilkan ${parsed.length} data proses investigasi dari penyimpanan lokal (fallback)`
                  );
                } else {
                  setInvestigationProcesses([parsed]);
                  setProcessError("Menampilkan data dari penyimpanan lokal (fallback)");
                }
              } else {
                const msg =
                  processData?.message || "Gagal mengambil data proses investigasi";
                setProcessError(msg);
                console.warn("Investigation process fetch failed:", msg);
              }
            }
          } catch (e) {
            const msg =
              processData?.message || "Gagal mengambil data proses investigasi";
            setProcessError(msg);
            console.warn(
              "Investigation process fetch failed and fallback failed:",
              e
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setProcessError("Terjadi kesalahan saat mengambil data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const latestProcess =
    investigationProcesses.length > 0
      ? investigationProcesses[investigationProcesses.length - 1]
      : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
            Dalam Investigasi
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Terjadwal
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Selesai
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownloadReport = async () => {
    if (!id) return;
    const reportId = Array.isArray(id) ? id[0] : id;

    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      if (!response.ok) {
        alert("Gagal mengunduh laporan");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-${report?.reportNumber || reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Terjadi kesalahan saat mengunduh laporan");
    }
  };

  const handleDownloadProcessPdf = async (
    processEntry: InvestigationProcess,
    entryIndex: number
  ) => {
    try {
      // npm install jspdf
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const reportNumber = report?.reportNumber || String(id || "");
      const content = buildProcessReportText(processEntry, entryIndex, reportNumber);

      // Tulis teks ringkasan
      const lines = doc.splitTextToSize(content, 180);
      doc.text(lines, 10, 10);

      const d = processEntry.data;

      // Sisipkan gambar lampiran (kalau ada & bisa diakses)
      if (d.uploadedFiles && d.uploadedFiles.length > 0) {
        const imageFiles = d.uploadedFiles.filter((file: any) => {
          const type = (file.type || "").toLowerCase();
          const name = (file.name || "").toLowerCase();
          return (
            type.startsWith("image/") ||
            name.endsWith(".png") ||
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg")
          );
        });

        if (imageFiles.length > 0) {
          doc.addPage();
          let y = 20;
          const maxWidth = 180;

          for (const file of imageFiles) {
            if (!file.url) continue; // butuh URL untuk fetch

            try {
              const dataUrl = await loadImageAsDataURL(file.url);
              // Judul kecil di atas gambar
              doc.setFontSize(10);
              doc.text(file.name, 10, y - 4);

              // Perkirakan tinggi gambar (kita pakai tinggi tetap 80, cukup aman)
              const imgFormat = file.type?.toLowerCase().includes("png")
                ? "PNG"
                : "JPEG";

              doc.addImage(dataUrl, imgFormat as any, 10, y, maxWidth, 80);
              y += 90;

              // Kalau mau nambah gambar lagi tapi sudah mepet bawah halaman, pindah halaman
              if (y > 260) {
                doc.addPage();
                y = 20;
              }
            } catch (e) {
              console.warn("Gagal memuat gambar lampiran ke PDF:", e);
            }
          }
        }
      }

      doc.save(`proses-investigasi-${reportNumber}-entry-${entryIndex + 1}.pdf`);
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      alert("Gagal membuat PDF. Pastikan library jsPDF sudah terpasang dan lampiran dapat diakses.");
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

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Laporan Tidak Ditemukan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Laporan dengan ID yang Anda cari tidak ditemukan.
          </p>
          <Button asChild>
            <Link href="/satgas/dashboard/investigasi">
              Kembali ke Daftar Investigasi
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
              <Link href="/satgas/dashboard/investigasi">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Rekapan Proses Investigasi
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {report.reportNumber}
                </span>
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
              <Link href={`/satgas/dashboard/investigasi/${report.id || id}/proses`}>
                <FileText className="w-4 h-4 mr-2" />
                Proses Investigasi
              </Link>
            </Button>
          </div>
        </div>

        {/* Info Error / Fallback */}
        {processError && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-semibold text-yellow-700 dark:text-yellow-300">
                  Informasi Proses Investigasi
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-200">
                  {processError}
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {report.investigationProgress || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${report.investigationProgress || 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div
                  className={`text-center p-3 rounded-lg ${
                    report.investigationProgress >= 25
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`font-semibold ${
                      report.investigationProgress >= 25
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    Pengumpulan Data
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">25%</div>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${
                    report.investigationProgress >= 50
                      ? "bg-yellow-100 dark:bg-yellow-900/30"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`font-semibold ${
                      report.investigationProgress >= 50
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    Analisis
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">50%</div>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${
                    report.investigationProgress >= 75
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`font-semibold ${
                      report.investigationProgress >= 75
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    Penyusunan Laporan
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">75%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Proses Terbaru */}
        {latestProcess && (
          <>
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
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tanggal & Jam Mulai
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {formatDateTime(latestProcess.data.startDateTime)}
                      </p>
                    </div>
                  )}
                  {latestProcess.data.endDateTime && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tanggal & Jam Selesai
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {formatDateTime(latestProcess.data.endDateTime)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lokasi Investigasi
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {latestProcess.data.location || "-"}
                  </p>
                </div>

                {latestProcess.data.methods &&
                  latestProcess.data.methods.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Metode/Bentuk Kegiatan
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {latestProcess.data.methods.map((method: string) => (
                          <Badge key={method} variant="secondary">
                            {methodLabels[method] ?? method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {latestProcess.data.partiesInvolved &&
                  latestProcess.data.partiesInvolved.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pihak yang Dilibatkan
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {latestProcess.data.partiesInvolved.map(
                          (party: string) => (
                            <Badge key={party} variant="outline">
                              {partyLabels[party] ?? party}
                            </Badge>
                          )
                        )}
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

            {/* Tim & Kerahasiaan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Tim & Tugas Investigasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestProcess.data.teamMembers &&
                  latestProcess.data.teamMembers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Anggota Tim Investigasi
                      </h4>
                      <div className="space-y-3">
                        {latestProcess.data.teamMembers.map(
                          (member: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {member.userId || "Anggota Tim"}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {member.role === "OTHER"
                                    ? member.customRole || roleLabels.OTHER
                                    : roleLabels[member.role] ?? member.role}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Persetujuan & Kerahasiaan
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          latestProcess.data.consentObtained
                            ? "default"
                            : "secondary"
                        }
                      >
                        {latestProcess.data.consentObtained
                          ? "✓ Disetujui"
                          : "✗ Belum Disetujui"}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Informed consent diperoleh
                      </span>
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
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catatan Risiko & Keamanan
                    </h4>
                    <p className="text-gray-900 dark:text-white text-sm">
                      {latestProcess.data.riskNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Output & Status Terbaru */}
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
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ringkasan Rencana
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {latestProcess.data.planSummary}
                    </p>
                  </div>
                )}

                {latestProcess.data.followUpAction && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status & Tindak Lanjut
                    </h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {followUpLabels[latestProcess.data.followUpAction] ??
                          latestProcess.data.followUpAction}
                      </Badge>
                      {latestProcess.data.followUpDate && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Target: {formatDate(latestProcess.data.followUpDate)}
                        </span>
                      )}
                    </div>
                    {latestProcess.data.followUpNotes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {latestProcess.data.followUpNotes}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Level Akses & Kerahasiaan
                  </h4>
                  <Badge variant="secondary">
                    {accessLevelLabels[latestProcess.data.accessLevel] ??
                      latestProcess.data.accessLevel ??
                      "Tidak ditentukan"}
                  </Badge>
                </div>

                {latestProcess.data.uploadedFiles &&
                  latestProcess.data.uploadedFiles.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Dokumen & Lampiran
                      </h4>
                      <div className="space-y-2">
                        {latestProcess.data.uploadedFiles.map(
                          (file: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <FileText className="w-4 h-4 text-gray-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB • {file.type}
                                </p>
                              </div>
                              {file.url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                >
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Lihat
                                  </a>
                                </Button>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Riwayat Proses (ringkas) */}
        {investigationProcesses.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Riwayat Proses Investigasi
              </CardTitle>
              <CardDescription>
                Semua proses investigasi yang telah dilakukan untuk laporan ini (
                {investigationProcesses.length} entri)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">
                        No
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">
                        Tanggal Dibuat
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">
                        Lokasi
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">
                        Metode
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">
                        Tim
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">
                        Dokumen
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-center">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {investigationProcesses.map((processEntry, entryIndex) => (
                      <tr
                        key={processEntry.id || entryIndex}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white">
                          {entryIndex + 1}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white">
                          {formatDate(processEntry.savedAt)}
                          <br />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(processEntry.savedAt).toLocaleTimeString(
                              "id-ID"
                            )}
                          </span>
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white">
                          {processEntry.data.location || "-"}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {processEntry.data.methods &&
                              processEntry.data.methods
                                .slice(0, 2)
                                .map((method: string) => (
                                  <Badge
                                    key={method}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {methodLabels[method] ?? method}
                                  </Badge>
                                ))}
                            {processEntry.data.methods &&
                              processEntry.data.methods.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{processEntry.data.methods.length - 2}
                                </Badge>
                              )}
                          </div>
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white">
                          {processEntry.data.teamMembers
                            ? `${processEntry.data.teamMembers.length} orang`
                            : "0 orang"}
                        </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 dark:text-white">
                            {processEntry.data.uploadedFiles
                              ? `${processEntry.data.uploadedFiles.length} file`
                              : "0 file"}
                          </span>
                          {processEntry.data.uploadedFiles && processEntry.data.uploadedFiles.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Open all documents in new tabs
                                processEntry.data.uploadedFiles.forEach((file: any, idx: number) => {
                                  if (file.path) {
                                    setTimeout(() => {
                                      window.open(file.path, '_blank');
                                    }, idx * 300);
                                  }
                                });
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-center">
                          <div className="flex gap-2 justify-center">
                            {/* Lihat (modal detail) */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProcess(processEntry);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Lihat
                            </Button>

                            {/* Unduh PDF */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadProcessPdf(processEntry, entryIndex)
                              }
                            >
                              <Download className="w-3 h-3 mr-1" />
                              PDF
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

        {/* Informasi Penjadwalan */}
        {(report.scheduledDate || latestProcess?.data.followUpAction) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informasi Penjadwalan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.scheduledDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tanggal Dijadwalkan
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(report.scheduledDate).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {report.scheduledNotes && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Catatan Penjadwalan
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {report.scheduledNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {latestProcess && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {latestProcess.data.startDateTime && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Waktu Mulai Proses Terbaru
                        </h4>
                        <p className="text-gray-900 dark:text-white">
                          {formatDateTime(latestProcess.data.startDateTime)}
                        </p>
                      </div>
                    )}
                    {latestProcess.data.endDateTime && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Waktu Selesai Proses Terbaru
                        </h4>
                        <p className="text-gray-900 dark:text-white">
                          {formatDateTime(latestProcess.data.endDateTime)}
                        </p>
                      </div>
                    )}
                  </div>

                  {latestProcess.data.followUpAction && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tindak Lanjut Terbaru
                      </h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="secondary">
                          {followUpLabels[latestProcess.data.followUpAction] ??
                            latestProcess.data.followUpAction}
                        </Badge>
                        {latestProcess.data.followUpDate && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Target: {formatDate(latestProcess.data.followUpDate)}
                          </span>
                        )}
                      </div>
                      {latestProcess.data.followUpNotes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {latestProcess.data.followUpNotes}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* MODAL DETAIL PROSES */}
        {selectedProcess && showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detail Proses Investigasi
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Disimpan pada: {formatDateTime(selectedProcess.savedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedProcess(null);
                  }}
                >
                  Tutup
                </Button>
              </div>

              <Separator className="mb-4" />

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lokasi
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {selectedProcess.data.location || "-"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Waktu Mulai
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {formatDateTime(selectedProcess.data.startDateTime)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Waktu Selesai
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {formatDateTime(selectedProcess.data.endDateTime)}
                    </p>
                  </div>
                </div>

                {/* Metode */}
                {selectedProcess.data.methods &&
                  selectedProcess.data.methods.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Metode
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProcess.data.methods.map((m: string) => (
                          <Badge key={m} variant="secondary">
                            {methodLabels[m] ?? m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Pihak Terlibat */}
                {selectedProcess.data.partiesInvolved &&
                  selectedProcess.data.partiesInvolved.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pihak Terlibat
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProcess.data.partiesInvolved.map((p: string) => (
                          <Badge key={p} variant="outline">
                            {partyLabels[p] ?? p}
                          </Badge>
                        ))}
                      </div>
                      {selectedProcess.data.otherPartiesDetails && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {selectedProcess.data.otherPartiesDetails}
                        </p>
                      )}
                    </div>
                  )}

                {/* Tim */}
                {selectedProcess.data.teamMembers &&
                  selectedProcess.data.teamMembers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tim Investigasi
                      </h4>
                      <div className="space-y-1">
                        {selectedProcess.data.teamMembers.map(
                          (member: any, idx: number) => (
                            <div key={idx}>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {member.userId || "Anggota"}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 ml-2">
                                (
                                {member.role === "OTHER"
                                  ? member.customRole || roleLabels.OTHER
                                  : roleLabels[member.role] ?? member.role}
                                )
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Catatan Risiko */}
                {selectedProcess.data.riskNotes && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catatan Risiko & Keamanan
                    </h4>
                    <p className="text-xs text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                      {selectedProcess.data.riskNotes}
                    </p>
                  </div>
                )}

                {/* Ringkasan Rencana */}
                {selectedProcess.data.planSummary && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ringkasan Rencana
                    </h4>
                    <p className="text-xs text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                      {selectedProcess.data.planSummary}
                    </p>
                  </div>
                )}

                {/* Dokumen / Lampiran */}
                {selectedProcess.data.uploadedFiles &&
                  selectedProcess.data.uploadedFiles.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dokumen Lampiran
                      </h4>
                      <ul className="space-y-2">
                        {selectedProcess.data.uploadedFiles.map(
                          (file: any, idx: number) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded"
                            >
                              <FileText className="w-3 h-3 mt-0.5 text-gray-500" />
                              <div>
                                <p className="text-gray-900 dark:text-white">
                                  {file.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB • {file.type}
                                </p>
                                {file.url && (
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-blue-600 hover:underline"
                                  >
                                    Lihat / Unduh Lampiran
                                  </a>
                                )}
                              </div>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
