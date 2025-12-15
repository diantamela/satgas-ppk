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
  OTHER_PARTY: " Pihak Lain",
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
  const d = processEntry.data || {};

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

LEVEL AKSEN:
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
  const [investigationResults, setInvestigationResults] = useState<any[]>([]);
  const [processError, setProcessError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProgress, setEditingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState<number>(0);
  const [savingProgress, setSavingProgress] = useState(false);

  const [selectedProcess, setSelectedProcess] =
    useState<InvestigationProcess | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [showResultDetailModal, setShowResultDetailModal] = useState(false);

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

        // Fetch investigation results
        try {
          const resultsResponse = await fetch(`/api/reports/${reportId}/results`);
          if (resultsResponse.ok) {
            const resultsData = await resultsResponse.json();
            if (resultsData.success && resultsData.results) {
              setInvestigationResults(resultsData.results);
            }
          } else {
            console.warn("Failed to fetch investigation results:", resultsResponse.status, resultsResponse.statusText);
            // Fallback: try to get data from localStorage or show empty state
            setInvestigationResults([]);
          }
        } catch (error) {
          console.warn("Failed to fetch investigation results:", error);
          // Fallback: show empty state instead of breaking the page
          setInvestigationResults([]);
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

  // Initialize tempProgress when report data is loaded
  useEffect(() => {
    if (report?.investigationProgress !== undefined) {
      setTempProgress(report.investigationProgress || 0);
    }
  }, [report?.investigationProgress]);

  const handleProgressUpdate = async () => {
    if (!id || tempProgress < 0 || tempProgress > 100) {
      alert("Progress harus介于 0-100%");
      return;
    }

    setSavingProgress(true);
    try {
      const reportId = Array.isArray(id) ? id[0] : id;
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investigationProgress: tempProgress
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setReport((prev: any) => ({ ...prev, investigationProgress: tempProgress }));
        setEditingProgress(false);
        alert("Progress berhasil diperbarui");
      } else {
        alert(data.message || "Gagal memperbarui progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Terjadi kesalahan saat memperbarui progress");
    } finally {
      setSavingProgress(false);
    }
  };

  const cancelProgressEdit = () => {
    setTempProgress(report?.investigationProgress || 0);
    setEditingProgress(false);
  };

  const latestProcess =
    investigationProcesses.length > 0
      ? investigationProcesses[investigationProcesses.length - 1]
      : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
            Sedang Berlangsung
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

  const handleDownloadResultPdf = async (resultId: string) => {
    if (!id) {
      alert("ID laporan tidak valid");
      return;
    }
    const reportId = Array.isArray(id) ? id[0] : id;

    try {
      const response = await fetch(`/api/reports/${reportId}/results/${resultId}/pdf`);
      
      if (!response.ok) {
        if (response.status === 401) {
          alert("Anda tidak memiliki akses untuk mengunduh file ini");
        } else if (response.status === 404) {
          alert("File PDF tidak ditemukan");
        } else {
          alert(`Gagal mengunduh PDF hasil investigasi (Status: ${response.status})`);
        }
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        alert("File yang diterima bukan PDF yang valid");
        return;
      }

      const blob = await response.blob();
      
      // Check if blob is valid
      if (blob.size === 0) {
        alert("File PDF kosong");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `berita-acara-${report?.reportNumber || reportId}-${resultId}.pdf`;
      
      // Ensure element is in DOM before clicking
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
    } catch (error) {
      console.error("Download error:", error);
      alert("Terjadi kesalahan saat mengunduh PDF hasil investigasi. Silakan coba lagi.");
    }
  };

  const handleDownloadReport = async () => {
    if (!id) {
      alert("ID laporan tidak valid");
      return;
    }
    const reportId = Array.isArray(id) ? id[0] : id;

    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      
      if (!response.ok) {
        if (response.status === 401) {
          alert("Anda tidak memiliki akses untuk mengunduh file ini");
        } else if (response.status === 404) {
          alert("File laporan tidak ditemukan");
        } else {
          alert(`Gagal mengunduh laporan (Status: ${response.status})`);
        }
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        alert("File yang diterima bukan PDF yang valid");
        return;
      }

      const blob = await response.blob();
      
      // Check if blob is valid
      if (blob.size === 0) {
        alert("File laporan kosong");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-${report?.reportNumber || reportId}.pdf`;
      
      // Ensure element is in DOM before clicking
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
    } catch (error) {
      console.error("Download error:", error);
      alert("Terjadi kesalahan saat mengunduh laporan. Silakan coba lagi.");
    }
  };

  const handleDownloadProcessPdf = async (
    processEntry: InvestigationProcess,
    entryIndex: number
  ) => {
    try {
      // Check if jsPDF is available
      let jsPDF;
      try {
        const jsPDFModule = await import("jspdf");
        jsPDF = jsPDFModule.jsPDF;
      } catch (importError) {
        console.error("Failed to import jsPDF:", importError);
        alert("Library PDF tidak tersedia. Silakan coba lagi atau hubungi administrator.");
        return;
      }

      const doc = new jsPDF();

      const reportNumber = report?.reportNumber || String(id || "");
      const content = buildProcessReportText(processEntry, entryIndex, reportNumber);

      // Write summary text
      try {
        const lines = doc.splitTextToSize(content, 180);
        doc.text(lines, 10, 10);
      } catch (textError) {
        console.error("Error adding text to PDF:", textError);
        alert("Gagal menambahkan teks ke PDF.");
        return;
      }

      const d = processEntry.data || {};

      // Add attachments if available
      if (d.uploadedFiles && d.uploadedFiles.length > 0) {
        try {
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
              if (!file.url) {
                console.warn("No URL available for file:", file.name);
                continue;
              }

              try {
                // Add filename
                doc.setFontSize(10);
                doc.text(file.name, 10, y - 4);

                // Try to load and add image
                try {
                  const dataUrl = await loadImageAsDataURL(file.url);
                  const imgFormat = file.type?.toLowerCase().includes("png")
                    ? "PNG"
                    : "JPEG";

                  doc.addImage(dataUrl, imgFormat as any, 10, y, maxWidth, 80);
                  y += 90;
                } catch (imageError) {
                  console.warn("Failed to load image:", file.name, imageError);
                  // Add error message instead of image
                  doc.text(`[Gagal memuat gambar: ${file.name}]`, 10, y);
                  y += 20;
                }

                // Add new page if needed
                if (y > 260) {
                  doc.addPage();
                  y = 20;
                }
              } catch (fileError) {
                console.warn("Error processing file:", file.name, fileError);
                // Continue with next file
                continue;
              }
            }
          }
        } catch (attachmentError) {
          console.warn("Error processing attachments:", attachmentError);
          // Continue without attachments
        }
      }

      // Save the PDF
      try {
        doc.save(`proses-investigasi-${reportNumber}-entry-${entryIndex + 1}.pdf`);
      } catch (saveError) {
        console.error("Error saving PDF:", saveError);
        alert("Gagal menyimpan PDF. Silakan coba lagi.");
        return;
      }
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      alert("Gagal membuat PDF. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.");
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
                  {editingProgress ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={tempProgress}
                        onChange={(e) => setTempProgress(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {report.investigationProgress || 0}%
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${editingProgress ? tempProgress : (report.investigationProgress || 0)}%` }}
                  />
                </div>
                {editingProgress && (
                  <div className="mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={tempProgress}
                      onChange={(e) => setTempProgress(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                {editingProgress ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelProgressEdit}
                      disabled={savingProgress}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleProgressUpdate}
                      disabled={savingProgress}
                    >
                      {savingProgress ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProgress(true)}
                  >
                    Edit Progress
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div
                  className={`text-center p-3 rounded-lg ${
                    (editingProgress ? tempProgress : (report.investigationProgress || 0)) >= 25
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`font-semibold ${
                      (editingProgress ? tempProgress : (report.investigationProgress || 0)) >= 25
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
                    (editingProgress ? tempProgress : (report.investigationProgress || 0)) >= 50
                      ? "bg-yellow-100 dark:bg-yellow-900/30"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`font-semibold ${
                      (editingProgress ? tempProgress : (report.investigationProgress || 0)) >= 50
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
                    (editingProgress ? tempProgress : (report.investigationProgress || 0)) >= 75
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`font-semibold ${
                      (editingProgress ? tempProgress : (report.investigationProgress || 0)) >= 75
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

        {/* Riwayat Hasil Investigasi */}
        {investigationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Riwayat Hasil Investigasi (Berita Acara)
              </CardTitle>
              <CardDescription>
                Semua berita acara hasil investigasi yang telah dibuat untuk laporan ini (
                {investigationResults.length} entri)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold">
                        No
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold">
                        Tanggal & Waktu
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold">
                        Status Kasus
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold">
                        Judul Kegiatan
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold">
                        Ringkasan Keterangan
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold">
                        Rekomendasi
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold">
                        TTD
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-center font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {investigationResults.map((result: any, index: number) => (
                      <tr
                        key={result.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-3 text-gray-900 dark:text-white font-medium">
                          {index + 1}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-3">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {formatDate(result.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(result.createdAt).toLocaleTimeString("id-ID")}
                          </div>
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-3">
                          <Badge
                            className={
                              result.caseStatusAfterResult === 'READY_FOR_RECOMMENDATION'
                                ? 'bg-green-500 hover:bg-green-600 text-white border-green-500'
                                : result.caseStatusAfterResult === 'UNDER_INVESTIGATION'
                                ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
                                : result.caseStatusAfterResult === 'FORWARDED_TO_REKTORAT'
                                ? 'bg-purple-500 hover:bg-purple-600 text-white border-purple-500'
                                : result.caseStatusAfterResult === 'CLOSED_TERMINATED'
                                ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                                : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
                            }
                            variant="outline"
                          >
                            <div className="flex items-center gap-1">
                              {result.caseStatusAfterResult === 'READY_FOR_RECOMMENDATION' && <span className="w-2 h-2 bg-white rounded-full"></span>}
                              {result.caseStatusAfterResult === 'UNDER_INVESTIGATION' && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
                              {result.caseStatusAfterResult === 'FORWARDED_TO_REKTORAT' && <span className="w-2 h-2 bg-white rounded-full"></span>}
                              {result.caseStatusAfterResult === 'CLOSED_TERMINATED' && <span className="w-2 h-2 bg-white rounded-full"></span>}
                              {result.caseStatusAfterResult === 'READY_FOR_RECOMMENDATION'
                                ? 'Siap untuk Rekomendasi'
                                : result.caseStatusAfterResult === 'UNDER_INVESTIGATION'
                                ? 'Sedang Dalam Investigasi'
                                : result.caseStatusAfterResult === 'FORWARDED_TO_REKTORAT'
                                ? 'Dikirim ke Rektorat'
                                : result.caseStatusAfterResult === 'CLOSED_TERMINATED'
                                ? 'Kasus Ditutup'
                                : result.caseStatusAfterResult}
                            </div>
                          </Badge>
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-3">
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white font-medium">
                              {result.schedulingTitle || 'Sesi Investigasi'}
                            </div>
                            {result.schedulingLocation && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                📍 {result.schedulingLocation}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-3">
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white">
                              {result.partiesStatementSummary
                                ? (result.partiesStatementSummary.length > 100
                                  ? `${result.partiesStatementSummary.substring(0, 100)}...`
                                  : result.partiesStatementSummary)
                                : 'Belum ada keterangan'
                              }
                            </div>
                            {result.statementConsistency && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                💬 Analisis konsistensi tersedia
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-3">
                          <div className="text-sm">
                            {result.recommendedImmediateActions && Array.isArray(result.recommendedImmediateActions) && result.recommendedImmediateActions.length > 0 ? (
                              <div className="space-y-1">
                                <div className="text-gray-900 dark:text-white font-medium">
                                  {result.recommendedImmediateActions.length} rekomendasi
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {result.recommendedImmediateActions.slice(0, 2).map((action: any, idx: number) => (
                                    <div key={idx} className="truncate">
                                      • {action.action || 'Tindakan'}
                                    </div>
                                  ))}
                                  {result.recommendedImmediateActions.length > 2 && (
                                    <div className="text-gray-400">
                                      +{result.recommendedImmediateActions.length - 2} lainnya
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 dark:text-gray-400">
                                Belum ada rekomendasi
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-semibold ${
                                result.creatorDigitalSignature
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {result.creatorDigitalSignature ? '✓' : '✗'}
                              </div>
                              <div className="text-xs">
                                <div className="text-gray-900 dark:text-white">
                                  {result.creatorDigitalSignature ? 'Pembuat' : 'Pending'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-semibold ${
                                result.chairpersonDigitalSignature
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {result.chairpersonDigitalSignature ? '✓' : '✗'}
                              </div>
                              <div className="text-xs">
                                <div className="text-gray-900 dark:text-white">
                                  {result.chairpersonDigitalSignature ? 'Ketua' : 'Pending'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-3 py-3 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              asChild
                              title="Lihat detail berita acara"
                            >
                              <Link href={`/satgas/dashboard/investigasi/${id}/hasil/${result.id}`}>
                                <Eye className="w-3 h-3 mr-1" />
                                Detail
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => handleDownloadResultPdf(result.id)}
                              title="Unduh PDF berita acara"
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
        {(report.scheduledDate || latestProcess?.data?.followUpAction) && (
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
                    {latestProcess.data?.startDateTime && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Waktu Mulai Proses Terbaru
                        </h4>
                        <p className="text-gray-900 dark:text-white">
                          {formatDateTime(latestProcess.data.startDateTime)}
                        </p>
                      </div>
                    )}
                    {latestProcess.data?.endDateTime && (
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
                      {selectedProcess.data?.location || "-"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Waktu Mulai
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {formatDateTime(selectedProcess.data?.startDateTime)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Waktu Selesai
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {formatDateTime(selectedProcess.data?.endDateTime)}
                    </p>
                  </div>
                </div>

                {/* Metode */}
                {(selectedProcess.data?.methods && selectedProcess.data?.methods?.length > 0) ? (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Metode
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProcess.data?.methods?.map((m: string) => (
                        <Badge key={m} variant="secondary">
                          {methodLabels[m] ?? m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Metode
                    </h4>
                    <p className="text-gray-500">Belum dipilih</p>
                  </div>
                )}

                {/* Pihak Terlibat */}
                {(selectedProcess.data?.partiesInvolved && selectedProcess.data?.partiesInvolved?.length > 0) ? (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pihak Terlibat
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProcess.data?.partiesInvolved?.map((p: string) => (
                        <Badge key={p} variant="outline">
                          {partyLabels[p] ?? p}
                        </Badge>
                      ))}
                    </div>
                    {selectedProcess.data?.otherPartiesDetails && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        {selectedProcess.data?.otherPartiesDetails}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pihak Terlibat
                    </h4>
                    <p className="text-gray-500">Belum ditentukan</p>
                  </div>
                )}

                {/* Tim */}
                {(selectedProcess.data?.teamMembers && selectedProcess.data?.teamMembers?.length > 0) ? (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tim Investigasi
                    </h4>
                    <div className="space-y-1">
                      {selectedProcess.data?.teamMembers?.map(
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
                ) : (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tim Investigasi
                    </h4>
                    <p className="text-gray-500">Belum ditentukan</p>
                  </div>
                )}

                {/* Catatan Risiko */}
                {selectedProcess.data?.riskNotes && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catatan Risiko & Keamanan
                    </h4>
                    <p className="text-xs text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                      {selectedProcess.data?.riskNotes}
                    </p>
                  </div>
                )}

                {/* Ringkasan Rencana */}
                {selectedProcess.data?.planSummary && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ringkasan Rencana
                    </h4>
                    <p className="text-xs text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                      {selectedProcess.data?.planSummary}
                    </p>
                  </div>
                )}

                {/* Dokumen / Lampiran */}
                {selectedProcess.data?.uploadedFiles &&
                  selectedProcess.data?.uploadedFiles?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dokumen Lampiran
                      </h4>
                      <ul className="space-y-2">
                        {selectedProcess.data?.uploadedFiles?.map(
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

        {/* MODAL DETAIL HASIL INVESTIGASI */}
        {selectedResult && showResultDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Detail Berita Acara Investigasi
                  </h2>
                  {selectedResult.createdAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Dibuat pada: {formatDateTime(selectedResult.createdAt)}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowResultDetailModal(false);
                    setSelectedResult(null);
                  }}
                >
                  ✕
                </Button>
              </div>

              <Separator className="mb-6" />

              <div className="space-y-6">
                {/* Informasi Dasar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informasi Dasar</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Judul Kegiatan:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedResult.schedulingTitle || 'Sesi Investigasi'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Lokasi:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedResult.schedulingLocation || '-'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Waktu:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedResult.schedulingDateTime ? formatDateTime(selectedResult.schedulingDateTime) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status & Tanda Tangan</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Status Kasus:</span>
                        <Badge className={`ml-2 ${
                          selectedResult.caseStatusAfterResult === 'READY_FOR_RECOMMENDATION'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : selectedResult.caseStatusAfterResult === 'UNDER_INVESTIGATION'
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : selectedResult.caseStatusAfterResult === 'FORWARDED_TO_REKTORAT'
                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                            : selectedResult.caseStatusAfterResult === 'CLOSED_TERMINATED'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}>
                          {selectedResult.caseStatusAfterResult === 'READY_FOR_RECOMMENDATION'
                            ? 'Siap untuk Rekomendasi'
                            : selectedResult.caseStatusAfterResult === 'UNDER_INVESTIGATION'
                            ? 'Sedang Dalam Investigasi'
                            : selectedResult.caseStatusAfterResult === 'FORWARDED_TO_REKTORAT'
                            ? 'Dikirim ke Rektorat'
                            : selectedResult.caseStatusAfterResult === 'CLOSED_TERMINATED'
                            ? 'Kasus Ditutup'
                            : selectedResult.caseStatusAfterResult || '-'}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Tanda Tangan Pembuat:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedResult.creatorSignerName || 'Belum ditandatangani'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Tanda Tangan Ketua:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedResult.chairpersonSignerName || 'Belum ditandatangani'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Kehadiran */}
                {(selectedResult.satgasMembersPresent || selectedResult.partiesPresent) && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Kehadiran</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedResult.satgasMembersPresent && Array.isArray(selectedResult.satgasMembersPresent) && selectedResult.satgasMembersPresent.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Anggota Sabtu yang Hadir</h4>
                          <div className="space-y-1">
                            {selectedResult.satgasMembersPresent.map((member: any, idx: number) => (
                              <div key={idx} className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                <div className="font-medium text-gray-900 dark:text-white">{member.name || 'Anggota'}</div>
                                {member.role && (
                                  <div className="text-gray-600 dark:text-gray-400 text-xs">{member.role}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedResult.partiesPresent && Array.isArray(selectedResult.partiesPresent) && selectedResult.partiesPresent.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Status Kehadiran Pihak</h4>
                          <div className="space-y-1">
                            {selectedResult.partiesPresent.map((party: any, idx: number) => (
                              <div key={idx} className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                <div className="font-medium text-gray-900 dark:text-white">{party.name || 'Pihak'}</div>
                                <div className="text-gray-600 dark:text-gray-400 text-xs">
                                  {party.role} - {party.status === 'PRESENT' ? 'Hadir' :
                                   party.status === 'ABSENT_WITH_REASON' ? 'Tidak Hadir (Ada Alasan)' : 'Tidak Hadir'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {selectedResult.attendanceNotes && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Catatan Kehadiran</h4>
                        <p className="text-sm text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                          {selectedResult.attendanceNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Catatan Inti Investigasi */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Catatan Inti Investigasi</h3>
                  
                  {selectedResult.partiesStatementSummary && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Ringkasan Keterangan Pihak</h4>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                        {selectedResult.partiesStatementSummary}
                      </p>
                    </div>
                  )}

                  {selectedResult.newPhysicalEvidence && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Temuan Bukti Fisik/Digital Baru</h4>
                      <p className="text-sm text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800 whitespace-pre-wrap">
                        {selectedResult.newPhysicalEvidence}
                      </p>
                    </div>
                  )}

                  {selectedResult.statementConsistency && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Konsistensi Keterangan</h4>
                      <p className="text-sm text-gray-900 dark:text-white bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-800 whitespace-pre-wrap">
                        {selectedResult.statementConsistency}
                      </p>
                    </div>
                  )}
                </div>

                {/* Kesimpulan & Rekomendasi */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Kesimpulan & Rekomendasi</h3>
                  
                  {selectedResult.sessionInterimConclusion && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Kesimpulan Sementara dari Sesi Ini</h4>
                      <p className="text-sm text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 whitespace-pre-wrap">
                        {selectedResult.sessionInterimConclusion}
                      </p>
                    </div>
                  )}

                  {selectedResult.recommendedImmediateActions && Array.isArray(selectedResult.recommendedImmediateActions) && selectedResult.recommendedImmediateActions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Rekomendasi Tindak Lanjut Segera</h4>
                      <div className="space-y-2">
                        {selectedResult.recommendedImmediateActions.map((action: any, idx: number) => (
                          <div key={idx} className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {action.action || 'Tindakan'}
                              </span>
                              <Badge variant={
                                action.priority === 'HIGH' ? 'destructive' :
                                action.priority === 'MEDIUM' ? 'default' : 'secondary'
                              }>
                                {action.priority === 'HIGH' ? 'Tinggi' :
                                 action.priority === 'MEDIUM' ? 'Sedang' : 'Rendah'}
                              </Badge>
                            </div>
                            {action.notes && (
                              <div className="text-gray-600 dark:text-gray-400 text-xs">
                                Catatan: {action.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResult.statusChangeReason && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Alasan Perubahan Status</h4>
                      <p className="text-sm text-gray-900 dark:text-white bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-200 dark:border-orange-800 whitespace-pre-wrap">
                        {selectedResult.statusChangeReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bukti yang Diupload */}
                {selectedResult.evidenceFiles && Array.isArray(selectedResult.evidenceFiles) && selectedResult.evidenceFiles.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bukti yang Diupload</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedResult.evidenceFiles.map((file: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div className="flex-1">
                            <div className="text-gray-900 dark:text-white font-medium">{file.name}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                              {(file.size / 1024).toFixed(1)} KB • {file.type}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Catatan Internal OTAN */}
                {selectedResult.internalSatgasNotes && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Catatan Internal OTAN</h3>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600 whitespace-pre-wrap">
                      {selectedResult.internalSatgasNotes}
                    </p>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadResultPdf(selectedResult.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Unduh PDF
                </Button>
                <Button
                  onClick={() => {
                    setShowResultDetailModal(false);
                    setSelectedResult(null);
                  }}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
