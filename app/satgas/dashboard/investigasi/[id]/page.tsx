"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  AlertTriangle,
  Clock,
  User,
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
  ArrowLeft,
  Calendar,
  Users,
  UserPlus,
  Activity
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
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [notesType, setNotesType] = useState<"investigation" | "recommendation">("investigation");
  const [progressValue, setProgressValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Scheduling form states
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [methods, setMethods] = useState<string[]>([]);
  const [partiesInvolved, setPartiesInvolved] = useState<string[]>([]);
  const [otherPartiesDetails, setOtherPartiesDetails] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [consentObtained, setConsentObtained] = useState(false);
  const [consentDocumentation, setConsentDocumentation] = useState("");
  const [riskNotes, setRiskNotes] = useState("");
  const [planSummary, setPlanSummary] = useState("");
  const [followUpAction, setFollowUpAction] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [accessLevel, setAccessLevel] = useState("CORE_TEAM_ONLY");

  // Upload states
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
            setProgressValue(data.report.investigationProgress || 0);
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

  // Fetch investigation schedule if report is scheduled
  const [investigationSchedule, setInvestigationSchedule] = useState<any>(null);
  useEffect(() => {
    const fetchSchedule = async () => {
      if (report?.status === 'SCHEDULED' && id) {
        try {
          const reportId = Array.isArray(id) ? id[0] : id;
          // Note: We'll need to create an API endpoint for this
          // For now, we'll assume the schedule data comes with the report
          // const response = await fetch(`/api/reports/${reportId}/schedule`);
          // const data = await response.json();
          // if (data.success) {
          //   setInvestigationSchedule(data.schedule);
          // }
        } catch (error) {
          console.error("Error fetching schedule:", error);
        }
      }
    };

    if (report) {
      fetchSchedule();
    }
  }, [report, id]);

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

  // Scheduling form constants
  const investigationMethods = [
    { value: "INTERVIEW", label: "Wawancara" },
    { value: "WRITTEN_CLARIFICATION", label: "Klarifikasi Tertulis" },
    { value: "LOCATION_OBSERVATION", label: "Observasi Lokasi" },
    { value: "DIGITAL_EVIDENCE_COLLECTION", label: "Pengumpulan Bukti Digital" },
    { value: "MEDIATION", label: "Mediasi" },
    { value: "OTHER", label: "Lainnya" }
  ];

  const investigationParties = [
    { value: "VICTIM_SURVIVOR", label: "Korban/Penyintas" },
    { value: "REPORTED_PERSON", label: "Terlapor" },
    { value: "WITNESS", label: "Saksi" },
    { value: "OTHER_PARTY", label: "Pihak Lain" }
  ];

  const teamRoles = [
    { value: "TEAM_LEADER", label: "Ketua Tim" },
    { value: "NOTE_TAKER", label: "Pencatat" },
    { value: "PSYCHOLOGICAL_SUPPORT", label: "Pendamping Psikologis" },
    { value: "LEGAL_SUPPORT", label: "Pendamping Hukum" },
    { value: "INVESTIGATOR", label: "Investigator" },
    { value: "OTHER", label: "Lainnya" }
  ];

  const accessLevels = [
    { value: "CORE_TEAM_ONLY", label: "Hanya Tim Inti" },
    { value: "FULL_SATGAS", label: "Satgas Penuh" },
    { value: "LEADERSHIP_ONLY", label: "Pimpinan Tertentu" }
  ];

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


  const handleUpdateProgress = async () => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investigationProgress: progressValue }),
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.report);
        setShowProgressDialog(false);
        setAlertMessage({ type: 'success', message: 'Progress investigasi berhasil diperbarui' });
        setTimeout(() => setAlertMessage(null), 3000);
      } else {
        setAlertMessage({ type: 'error', message: data.message || 'Gagal memperbarui progress investigasi' });
      }
    } catch (error) {
      console.error('Update progress error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat memperbarui progress investigasi' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scheduling form handlers
  const handleMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setMethods([...methods, method]);
    } else {
      setMethods(methods.filter(m => m !== method));
    }
  };

  const handlePartyChange = (party: string, checked: boolean) => {
    if (checked) {
      setPartiesInvolved([...partiesInvolved, party]);
    } else {
      setPartiesInvolved(partiesInvolved.filter(p => p !== party));
    }
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { userId: "", role: "", customRole: "" }]);
  };

  const updateTeamMember = (index: number, field: keyof any, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  // Upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (response.ok && data.message === 'File uploaded successfully') {
            setUploadedFiles(prev => [...prev, {
              name: file.name,
              path: data.filePath,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString()
            }]);
            setAlertMessage({ type: 'success', message: `File ${file.name} berhasil diupload` });
            setTimeout(() => setAlertMessage(null), 3000);
          } else {
            setAlertMessage({ type: 'error', message: data.error || 'Gagal mengupload file' });
          }
        } else {
          // Handle non-JSON responses (like HTML error pages)
          const text = await response.text();
          console.error('Upload failed with non-JSON response:', text);
          setAlertMessage({ type: 'error', message: 'Gagal mengupload file - respons server tidak valid' });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat mengupload file' });
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !startDateTime || !endDateTime || !location) return;

    setIsSubmitting(true);
    try {
      const scheduleData = {
        startDateTime,
        endDateTime,
        location,
        methods,
        partiesInvolved,
        otherPartiesDetails: otherPartiesDetails || undefined,
        teamMembers,
        consentObtained,
        consentDocumentation: consentDocumentation || undefined,
        riskNotes: riskNotes || undefined,
        planSummary: planSummary || undefined,
        followUpAction: followUpAction || undefined,
        followUpDate: followUpDate || undefined,
        followUpNotes: followUpNotes || undefined,
        accessLevel,
        uploadedFiles
      };

      const response = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: id,
          ...scheduleData
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.success) {
          // Create activity automatically with schedule data
          const activityData = {
            activityType: "SCHEDULED_INVESTIGATION",
            title: `Jadwal Investigasi: ${planSummary || 'Investigasi Terjadwal'}`,
            description: `Investigasi terjadwal pada ${new Date(startDateTime).toLocaleString('id-ID')} - ${new Date(endDateTime).toLocaleString('id-ID')} di ${location}. ${planSummary ? `Rencana: ${planSummary}` : ''}${methods.length > 0 ? ` Metode: ${methods.join(', ')}` : ''}${partiesInvolved.length > 0 ? ` Pihak terlibat: ${partiesInvolved.join(', ')}` : ''}${otherPartiesDetails ? ` Detail pihak lain: ${otherPartiesDetails}` : ''}${riskNotes ? ` Catatan risiko: ${riskNotes}` : ''}`,
            location,
            startDateTime,
            endDateTime,
            participants: teamMembers.map(member => member.userId || member.role).filter(Boolean),
            outcomes: planSummary || undefined,
            challenges: riskNotes || undefined,
            recommendations: followUpNotes || undefined,
            isConfidential: false,
            accessLevel
          };

          // Create the activity
          const activityResponse = await fetch(`/api/reports/${id}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityData),
          });

          // Refresh the report data
          const reportResponse = await fetch(`/api/reports/${id}`);
          const reportData = await reportResponse.json();
          if (reportData.success) {
            setReport(reportData.report);
          }
          setAlertMessage({ type: 'success', message: 'Jadwal investigasi berhasil dibuat dan dicatat sebagai kegiatan' });
          setTimeout(() => setAlertMessage(null), 3000);
          // Reset form
          setStartDateTime("");
          setEndDateTime("");
          setLocation("");
          setMethods([]);
          setPartiesInvolved([]);
          setOtherPartiesDetails("");
          setTeamMembers([]);
          setConsentObtained(false);
          setConsentDocumentation("");
          setRiskNotes("");
          setPlanSummary("");
          setFollowUpAction("");
          setFollowUpDate("");
          setFollowUpNotes("");
          setAccessLevel("CORE_TEAM_ONLY");
          setUploadedFiles([]);
          // Redirect to kegiatan page
          router.push(`/satgas/dashboard/investigasi/${id}/kegiatan`);
        } else {
          setAlertMessage({ type: 'error', message: data.message || 'Gagal membuat jadwal investigasi' });
        }
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        console.error('Schedule failed with non-JSON response:', text);
        setAlertMessage({ type: 'error', message: 'Gagal membuat jadwal investigasi - respons server tidak valid' });
      }
    } catch (error) {
      console.error('Schedule investigation error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat membuat jadwal investigasi' });
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
            <Button
              asChild
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Link href={`/satgas/dashboard/investigasi/${id}/kegiatan`}>
                <Activity className="w-4 h-4 mr-2" />
                Kegiatan Investigasi
              </Link>
            </Button>
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
          </div>
        </div>

        {/* Progress Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Progress Investigasi
              </div>
              {(report.status === 'IN_PROGRESS' || report.status === 'SCHEDULED') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProgressDialog(true)}
                  disabled={isSubmitting}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Progress
                </Button>
              )}
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

        {/* Scheduling Form */}
        {report.status !== 'COMPLETED' && report.status !== 'REJECTED' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Proses Investigasi
              </CardTitle>
              <CardDescription>
                Atur jadwal lengkap untuk investigasi laporan: <strong>{report.title}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleSubmit} className="space-y-6">
                {/* Block 1: Info Dasar Sesi */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Info Dasar Sesi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDateTime">Tanggal & Jam Mulai</Label>
                      <Input
                        id="startDateTime"
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDateTime">Tanggal & Jam Selesai</Label>
                      <Input
                        id="endDateTime"
                        type="datetime-local"
                        min={startDateTime || new Date().toISOString().slice(0, 16)}
                        value={endDateTime}
                        onChange={(e) => setEndDateTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Lokasi Investigasi
                    </Label>
                    <Input
                      id="location"
                      placeholder="Contoh: Ruang Konseling, Via Zoom, Ruang Fakultas X"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Metode/Bentuk Kegiatan</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {investigationMethods.map((method) => (
                        <div key={method.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`method-${method.value}`}
                            checked={methods.includes(method.value)}
                            onCheckedChange={(checked) => handleMethodChange(method.value, checked as boolean)}
                          />
                          <Label htmlFor={`method-${method.value}`} className="text-sm">
                            {method.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Pihak yang Dilibatkan</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {investigationParties.map((party) => (
                        <div key={party.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`party-${party.value}`}
                            checked={partiesInvolved.includes(party.value)}
                            onCheckedChange={(checked) => handlePartyChange(party.value, checked as boolean)}
                          />
                          <Label htmlFor={`party-${party.value}`} className="text-sm">
                            {party.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {partiesInvolved.includes("OTHER_PARTY") && (
                      <Textarea
                        placeholder="Jelaskan pihak lain yang terlibat..."
                        value={otherPartiesDetails}
                        onChange={(e) => setOtherPartiesDetails(e.target.value)}
                        rows={2}
                      />
                    )}
                  </div>
                </div>

                <Separator />

                {/* Block 2: Tim & Tugas */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Tim & Tugas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Anggota Tim Investigasi</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Tambah Anggota
                      </Button>
                    </div>
                    {teamMembers.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Belum ada anggota tim</p>
                    ) : (
                      <div className="space-y-3">
                        {teamMembers.map((member, index) => (
                          <div key={index} className="flex gap-3 items-end p-3 border rounded-lg">
                            <div className="flex-1 space-y-2">
                              <Label className="text-sm">Anggota Tim</Label>
                              <Input
                                placeholder="Pilih anggota tim..."
                                value={member.userId}
                                onChange={(e) => updateTeamMember(index, 'userId', e.target.value)}
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <Label className="text-sm">Peran</Label>
                              <Select
                                value={member.role}
                                onValueChange={(value) => updateTeamMember(index, 'role', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih peran" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teamRoles.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {member.role === "OTHER" && (
                              <div className="flex-1 space-y-2">
                                <Label className="text-sm">Peran Khusus</Label>
                                <Input
                                  placeholder="Jelaskan peran..."
                                  value={member.customRole}
                                  onChange={(e) => updateTeamMember(index, 'customRole', e.target.value)}
                                />
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTeamMember(index)}
                            >
                              Hapus
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Persetujuan & Kerahasiaan
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="consent-obtained"
                        checked={consentObtained}
                        onCheckedChange={(checked) => setConsentObtained(checked as boolean)}
                      />
                      <Label htmlFor="consent-obtained" className="text-sm">
                        Informed consent telah diperoleh dari pihak terkait
                      </Label>
                    </div>
                    {consentObtained && (
                      <Textarea
                        placeholder="Jelaskan cara dokumentasi persetujuan (tertulis/lisan terekam)..."
                        value={consentDocumentation}
                        onChange={(e) => setConsentDocumentation(e.target.value)}
                        rows={2}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Catatan Risiko & Keamanan</Label>
                    <Textarea
                      placeholder="Apakah ada potensi intimidasi, balasan, atau ancaman? Sertakan mitigasinya..."
                      value={riskNotes}
                      onChange={(e) => setRiskNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Block 3: Output & Status */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Output & Status
                  </h3>
                  <div className="space-y-2">
                    <Label>Ringkasan Rencana</Label>
                    <Textarea
                      placeholder="Jelaskan ringkasan rencana investigasi..."
                      value={planSummary}
                      onChange={(e) => setPlanSummary(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Jadwal Tindak Lanjut</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Tindakan</Label>
                        <Select value={followUpAction} onValueChange={setFollowUpAction}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tindakan lanjut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CONTINUE">Lanjut ke Tahap Selanjutnya</SelectItem>
                            <SelectItem value="STOP">Stop Investigasi</SelectItem>
                            <SelectItem value="FOLLOW_UP">Perlu Tindak Lanjut</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {followUpAction === "CONTINUE" && (
                        <div className="space-y-2">
                          <Label className="text-sm">Tanggal Target</Label>
                          <Input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    {followUpAction && (
                      <Textarea
                        placeholder="Catatan tindak lanjut..."
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                        rows={2}
                      />
                    )}
                  </div>

                  <Separator />
  
                  <div className="space-y-2">
                    <Label>Level Akses & Kerahasiaan</Label>
                    <Select value={accessLevel} onValueChange={setAccessLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accessLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
  
                <Separator />
  
                {/* Block 4: Upload Dokumen & Gambar */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Dokumen & Gambar
                  </h3>
                  <div className="space-y-3">
                    <Label>Upload file pendukung investigasi (maksimal 10MB per file)</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Seret & lepaskan file di sini, atau klik untuk memilih
                      </p>
                      <Input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,.mp4,.mov"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={isUploading}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" disabled={isUploading}>
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Mengupload...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Pilih File
                            </>
                          )}
                        </Button>
                      </Label>
                      <p className="text-xs text-gray-500 mt-2">
                        Format yang didukung: JPG, PNG, GIF, PDF, DOC, DOCX, TXT, MP4, MOV
                      </p>
                    </div>
  
                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label>File yang telah diupload:</Label>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB • {file.type}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeUploadedFile(index)}
                              >
                                Hapus
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting || !startDateTime || !endDateTime || !location}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Proses Investigasi
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Scheduling Information */}
        {report.scheduledDate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informasi Penjadwalan Investigasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Schedule Info */}
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

              {/* Detailed Schedule Info - This will be populated when we have the schedule data */}
              {investigationSchedule && (
                <>
                  <Separator />

                  {/* Session Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Detail Sesi Investigasi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Waktu Mulai</h4>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(investigationSchedule.startDateTime).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Waktu Selesai</h4>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(investigationSchedule.endDateTime).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi</h4>
                        <p className="text-gray-900 dark:text-white">{investigationSchedule.location}</p>
                      </div>
                    </div>

                    {investigationSchedule.methods && investigationSchedule.methods.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Metode Investigasi</h4>
                        <div className="flex flex-wrap gap-2">
                          {investigationSchedule.methods.map((method: string) => (
                            <Badge key={method} variant="secondary">
                              {method.replace(/_/g, ' ').toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {investigationSchedule.partiesInvolved && investigationSchedule.partiesInvolved.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Pihak Terlibat</h4>
                        <div className="flex flex-wrap gap-2">
                          {investigationSchedule.partiesInvolved.map((party: string) => (
                            <Badge key={party} variant="outline">
                              {party.replace(/_/g, ' ').toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                        {investigationSchedule.otherPartiesDetails && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {investigationSchedule.otherPartiesDetails}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Team Members */}
                  {investigationSchedule.teamMembers && investigationSchedule.teamMembers.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Tim Investigasi</h3>
                      <div className="space-y-3">
                        {investigationSchedule.teamMembers.map((member: any) => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{member.user.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {member.customRole || member.role.replace(/_/g, ' ').toLowerCase()}
                              </p>
                            </div>
                            <Badge variant="secondary">{member.role.replace(/_/g, ' ')}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Consent & Security */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Persetujuan & Keamanan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Persetujuan Diperoleh</h4>
                        <Badge variant={investigationSchedule.consentObtained ? "default" : "destructive"}>
                          {investigationSchedule.consentObtained ? "Ya" : "Tidak"}
                        </Badge>
                      </div>
                      {investigationSchedule.consentDocumentation && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Dokumentasi Persetujuan</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {investigationSchedule.consentDocumentation}
                          </p>
                        </div>
                      )}
                    </div>
                    {investigationSchedule.riskNotes && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Risiko & Keamanan</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {investigationSchedule.riskNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Plan Summary & Follow-up */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Rencana & Tindak Lanjut</h3>
                    {investigationSchedule.planSummary && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Ringkasan Rencana</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {investigationSchedule.planSummary}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {investigationSchedule.followUpAction && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tindak Lanjut</h4>
                          <Badge variant="outline">
                            {investigationSchedule.followUpAction.replace(/_/g, ' ').toLowerCase()}
                          </Badge>
                        </div>
                      )}
                      {investigationSchedule.followUpDate && (
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Target</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(investigationSchedule.followUpDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      )}
                    </div>
                    {investigationSchedule.followUpNotes && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Tindak Lanjut</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {investigationSchedule.followUpNotes}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Level Akses</h4>
                      <Badge variant="secondary">
                        {investigationSchedule.accessLevel.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content */}
          <div className="md:w-2/3 space-y-6">
          </div>

          {/* Sidebar */}
          <div className="md:w-1/3 space-y-6">
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


      {/* Update Progress Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress Investigasi</DialogTitle>
            <DialogDescription>
              Perbarui progress keseluruhan investigasi laporan ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Progress Keseluruhan (%)</label>
              <div className="mt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span className="font-semibold">{progressValue}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`text-center p-2 rounded ${progressValue >= 25 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                Pengumpulan Data (25%)
              </div>
              <div className={`text-center p-2 rounded ${progressValue >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                Analisis (50%)
              </div>
              <div className={`text-center p-2 rounded ${progressValue >= 75 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                Penyusunan Laporan (75%)
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProgressDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateProgress} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}