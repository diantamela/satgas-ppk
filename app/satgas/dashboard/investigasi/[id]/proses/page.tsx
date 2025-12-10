"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DigitalSignature from "@/components/ui/digital-signature";
import {
  FileText,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Shield,
  Upload,
  Loader2,
  ArrowLeft,
  Calendar,
  UserPlus,
  Save,
  Eye,
  FileCheck,
  CheckCircle,
  Download
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface PartyAttendance {
  name: string;
  role: string;
  status: 'PRESENT' | 'ABSENT_NO_REASON' | 'ABSENT_WITH_REASON';
  reason?: string;
}

interface RecommendedAction {
  action: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
}

export default function InvestigationProsesPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [process, setProcess] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Original form states from proses
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [methods, setMethods] = useState<string[]>([]);
  const [partiesInvolved, setPartiesInvolved] = useState<string[]>([]);
  const [otherPartiesDetails, setOtherPartiesDetails] = useState("");
  const [riskNotes, setRiskNotes] = useState("");
  const [planSummary, setPlanSummary] = useState("");
  const [followUpAction, setFollowUpAction] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [accessLevel, setAccessLevel] = useState("CORE_TEAM_ONLY");

  // New states from hasil form
  const [schedulingTitle, setSchedulingTitle] = useState("");
  const [schedulingLocation, setSchedulingLocation] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [reportNumber, setReportNumber] = useState("");
  
  // Attendance tracking
  const [satgasMembersPresent, setSatgasMembersPresent] = useState<any[]>([]);
  const [partiesPresent, setPartiesPresent] = useState<PartyAttendance[]>([]);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [attendanceNotes, setAttendanceNotes] = useState("");
  
  // Key investigation notes
  const [partiesStatementSummary, setPartiesStatementSummary] = useState("");
  const [newPhysicalEvidence, setNewPhysicalEvidence] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<any[]>([]);
  const [statementConsistency, setStatementConsistency] = useState("");
  
  // Interim conclusions and recommendations
  const [sessionInterimConclusion, setSessionInterimConclusion] = useState("");
  const [recommendedImmediateActions, setRecommendedImmediateActions] = useState<RecommendedAction[]>([]);
  const [caseStatusAfterResult, setCaseStatusAfterResult] = useState("UNDER_INVESTIGATION");
  const [statusChangeReason, setStatusChangeReason] = useState("");
  
  // Digital authentication
  const [dataVerificationConfirmed, setDataVerificationConfirmed] = useState(false);
  const [creatorDigitalSignature, setCreatorDigitalSignature] = useState("");
  const [creatorSignerName, setCreatorSignerName] = useState("");
  const [chairpersonDigitalSignature, setChairpersonDigitalSignature] = useState("");
  const [chairpersonSignerName, setChairpersonSignerName] = useState("");
  
  // Additional fields
  const [partiesDetailedAttendance, setPartiesDetailedAttendance] = useState<any>({});
  const [recommendedActionsDetails, setRecommendedActionsDetails] = useState<any>({});
  const [internalSatgasNotes, setInternalSatgasNotes] = useState("");

  // Upload states
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch report and process details
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
            setCaseTitle(reportData.report.title);
            setReportNumber(reportData.report.reportNumber);
          }
          
          // Fetch process
          const processResponse = await fetch(`/api/reports/${reportId}/process`);
          const processData = await processResponse.json();
          if (processData.success) {
            setProcess(processData.process);
            
            // Pre-populate form fields from the scheduled process data
            if (processData.process) {
              const process = processData.process;
              setSchedulingTitle(process.planSummary || 'Sesi Investigasi');
              setStartDateTime(process.startDateTime || '');
              setEndDateTime(process.endDateTime || '');
              setSchedulingLocation(process.location || '');
              
              // Set initial values from scheduled process
              setLocation(process.location || '');
              setMethods(process.methods || []);
              setPartiesInvolved(process.partiesInvolved || []);
              setOtherPartiesDetails(process.otherPartiesDetails || '');
              setRiskNotes(process.riskNotes || '');
              setPlanSummary(process.planSummary || '');
              setAccessLevel(process.accessLevel || 'CORE_TEAM_ONLY');
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
    { value: "OTHER_PARTY", label: " Pihak Lain" }
  ];

  const accessLevels = [
    { value: "CORE_TEAM_ONLY", label: "Hanya Tim Inti" },
    { value: "FULL_SATGAS", label: "Satgas Penuh" },
    { value: "LEADERSHIP_ONLY", label: "Pimpinan Tertentu" }
  ];

  const recommendedActionsOptions = [
    { value: 'SCHEDULE_NEXT_SESSION', label: 'Jadwalkan Sesi Berikutnya' },
    { value: 'CALL_OTHER_PARTY', label: 'Panggil Pihak Lain' },
    { value: 'REQUIRE_PSYCHOLOGICAL_SUPPORT', label: 'Perlu Pendampingan Psikologis' },
    { value: 'REQUIRE_LEGAL_SUPPORT', label: 'Perlu Pendampingan Hukum' },
    { value: 'CASE_TERMINATED', label: 'Kasus Dihentikan' },
    { value: 'FORWARD_TO_REKTORAT', label: 'Diteruskan ke Rektorat' },
    { value: 'MEDIATION_SESSION', label: 'Sesi Mediasi' },
    { value: 'EVIDENCE_ANALYSIS', label: 'Analisis Bukti' },
    { value: 'WITNESS_REINTERVIEW', label: 'Wawancara Ulang Saksi' },
    { value: 'OTHER', label: 'Lainnya' }
  ];

  const caseStatusOptions = [
    { value: 'UNDER_INVESTIGATION', label: 'Sedang Berlangsung' },
    { value: 'EVIDENCE_COLLECTION', label: 'Pengumpulan Bukti' },
    { value: 'STATEMENT_ANALYSIS', label: 'Analisis Keterangan' },
    { value: 'PENDING_EXTERNAL_INPUT', label: 'Menunggu Input Eksternal' },
    { value: 'READY_FOR_RECOMMENDATION', label: 'Siap untuk Rekomendasi' },
    { value: 'CLOSED_TERMINATED', label: 'Ditutup/Dihentikan' },
    { value: 'FORWARDED_TO_REKTORAT', label: 'Diteruskan ke Rektorat' }
  ];

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

  const addRecommendedAction = () => {
    setRecommendedImmediateActions([...recommendedImmediateActions, {
      action: '',
      priority: 'MEDIUM',
      notes: ''
    }]);
  };

  const updateRecommendedAction = (index: number, field: keyof RecommendedAction, value: string) => {
    const updated = [...recommendedImmediateActions];
    updated[index] = { ...updated[index], [field]: value };
    setRecommendedImmediateActions(updated);
  };

  const removeRecommendedAction = (index: number) => {
    setRecommendedImmediateActions(recommendedImmediateActions.filter((_, i) => i !== index));
  };

  const addPartyAttendance = () => {
    setPartiesPresent([...partiesPresent, {
      name: '',
      role: '',
      status: 'PRESENT'
    }]);
  };

  const updatePartyAttendance = (index: number, field: keyof PartyAttendance, value: string) => {
    const updated = [...partiesPresent];
    updated[index] = { ...updated[index], [field]: value };
    setPartiesPresent(updated);
  };

  const removePartyAttendance = (index: number) => {
    setPartiesPresent(partiesPresent.filter((_, i) => i !== index));
  };

  const removeEvidenceFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !methods.length || !partiesInvolved.length || !partiesStatementSummary) return;

    setIsSubmitting(true);
    try {
      const formData = {
        // Original process data
        processId: process?.id,
        location: schedulingLocation || location,
        methods,
        partiesInvolved,
        otherPartiesDetails: otherPartiesDetails || undefined,
        riskNotes: riskNotes || undefined,
        planSummary: planSummary || undefined,
        followUpAction: followUpAction || undefined,
        followUpDate: followUpDate || undefined,
        followUpNotes: followUpNotes || undefined,
        accessLevel,
        uploadedFiles,
        
        // New results data
        schedulingTitle,
        startDateTime: startDateTime || undefined,
        endDateTime: endDateTime || undefined,
        caseTitle: report?.title,
        reportNumber: report?.reportNumber,
        
        // Attendance tracking
        satgasMembersPresent,
        partiesPresent,
        identityVerified,
        attendanceNotes,
        
        // Key investigation notes
        partiesStatementSummary,
        newPhysicalEvidence,
        evidenceFiles,
        statementConsistency,
        
        // Interim conclusions and recommendations
        sessionInterimConclusion,
        recommendedImmediateActions,
        caseStatusAfterResult,
        statusChangeReason,
        
        // Digital authentication
        dataVerificationConfirmed,
        creatorDigitalSignature,
        creatorSignerName,
        creatorSignatureDate: new Date().toISOString(),
        chairpersonDigitalSignature,
        chairpersonSignerName,
        chairpersonSignatureDate: chairpersonDigitalSignature ? new Date().toISOString() : null,
        
        // Additional fields
        partiesDetailedAttendance,
        recommendedActionsDetails,
        internalSatgasNotes
      };

      const response = await fetch(`/api/reports/${id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.success) {
          // Determine the final status based on caseStatusAfterResult
          let finalStatus = 'IN_PROGRESS';
          let statusNotes = 'Investigation process initiated';
          
          if (caseStatusAfterResult === 'READY_FOR_RECOMMENDATION' || 
              caseStatusAfterResult === 'FORWARDED_TO_REKTORAT' || 
              caseStatusAfterResult === 'CLOSED_TERMINATED') {
            finalStatus = 'COMPLETED';
            statusNotes = `Status updated after investigation. Case status: ${caseStatusAfterResult}`;
          }
          
          // Update report status based on the investigation result
          const reportId = Array.isArray(id) ? id[0] : id;
          const statusUpdateResponse = await fetch(`/api/reports/${reportId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: finalStatus,
              notes: statusNotes
            }),
          });
          
          if (statusUpdateResponse.ok) {
            const statusData = await statusUpdateResponse.json();
            // Optionally update local state
          }
          
          setAlertMessage({ type: 'success', message: 'Hasil investigasi berhasil dicatat' });
          setTimeout(() => {
            setAlertMessage(null);
            router.push(`/satgas/dashboard/investigasi/${id}/rekapan`);
          }, 1000);
        } else {
          setAlertMessage({ type: 'error', message: data.message || 'Gagal mencatat hasil investigasi' });
        }
      } else {
        setAlertMessage({ type: 'error', message: 'Gagal mencatat hasil investigasi - respons server tidak valid' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat mencatat hasil investigasi' });
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
              <Link href={`/satgas/dashboard/investigasi/${id}/rekapan`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Rekapan
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Form Pelaksanaan Investigasi</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{report?.reportNumber}</span>
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Sesi Investigasi Aktif</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/satgas/dashboard/investigasi/${id}/rekapan`}>
                <Eye className="w-4 h-4 mr-2" />
                Lihat Rekapan
              </Link>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informasi Jadwal Referensi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Informasi Jadwal Referensi
              </CardTitle>
              <CardDescription>
                Data ini diambil dari jadwal investigasi yang telah direncanakan sebelumnya (dapat diubah jika pelaksanaan berbeda)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schedulingTitle">Judul Kegiatan</Label>
                <Input
                  id="schedulingTitle"
                  value={schedulingTitle}
                  onChange={(e) => setSchedulingTitle(e.target.value)}
                  placeholder="Contoh: Wawancara Korban"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDateTime">Tanggal & Waktu Mulai</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDateTime">Tanggal & Waktu Selesai</Label>
                  <Input
                    id="endDateTime"
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedulingLocation">Lokasi Pelaksanaan</Label>
                <Input
                  id="schedulingLocation"
                  value={schedulingLocation}
                  onChange={(e) => setSchedulingLocation(e.target.value)}
                  placeholder="Contoh: Ruang Konseling"
                />
              </div>
              
              <div className="space-y-3">
                <Label>Metode Investigasi *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                <Label>Pihak yang Terlibat *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                
                {(partiesInvolved.includes('OTHER_PARTY') || otherPartiesDetails) && (
                  <div className="space-y-2">
                    <Label htmlFor="otherPartiesDetails">Detail Pihak Lain</Label>
                    <Textarea
                      id="otherPartiesDetails"
                      value={otherPartiesDetails}
                      onChange={(e) => setOtherPartiesDetails(e.target.value)}
                      placeholder="Jelaskan secara detail pihak lain yang terlibat..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="riskNotes">Catatan Risiko</Label>
                <Textarea
                  id="riskNotes"
                  value={riskNotes}
                  onChange={(e) => setRiskNotes(e.target.value)}
                  placeholder="Identifikasi potensi risiko dan mitigasinya..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="planSummary">Ringkasan Rencana Investigasi</Label>
                <Textarea
                  id="planSummary"
                  value={planSummary}
                  onChange={(e) => setPlanSummary(e.target.value)}
                  placeholder="Ringkasan singkat tentang tujuan dan langkah investigasi..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Data Kehadiran Pihak Terlibat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Data Kehadiran Aktual
              </CardTitle>
              <CardDescription>
                Catat kehadiran aktual Anggota Satuan Tugas dan pihak-pihak yang hadir pada pelaksanaan investigasi (berbeda dari rencana jadwal)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Satgas yang Hadir</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSatgasMembersPresent([...satgasMembersPresent, { name: '', role: '' }])}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Anggota
                  </Button>
                </div>
                {satgasMembersPresent.map((member, index) => (
                  <div key={index} className="flex gap-3 items-end p-3 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm">Nama Anggota</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => {
                          const updated = [...satgasMembersPresent];
                          updated[index].name = e.target.value;
                          setSatgasMembersPresent(updated);
                        }}
                        placeholder="Nama lengkap anggota satgas"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm">Jabatan</Label>
                      <Input
                        value={member.role}
                        onChange={(e) => {
                          const updated = [...satgasMembersPresent];
                          updated[index].role = e.target.value;
                          setSatgasMembersPresent(updated);
                        }}
                        placeholder="Contoh: Ketua Tim, Anggota"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSatgasMembersPresent(satgasMembersPresent.filter((_, i) => i !== index))}
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Status Kehadiran Pihak</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addPartyAttendance}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Pihak
                  </Button>
                </div>
                {partiesPresent.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Belum ada pihak yang dicatat</p>
                ) : (
                  <div className="space-y-3">
                    {partiesPresent.map((party, index) => (
                      <div key={index} className="flex gap-3 items-end p-3 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm">Nama Pihak</Label>
                          <Input
                            value={party.name}
                            onChange={(e) => updatePartyAttendance(index, 'name', e.target.value)}
                            placeholder="Nama pihak yang terlibat"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm">Peran</Label>
                          <Select value={party.role} onValueChange={(value) => updatePartyAttendance(index, 'role', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih peran" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="REPORTER">Pelapor</SelectItem>
                              <SelectItem value="REPORTED_PERSON">Terlapor</SelectItem>
                              <SelectItem value="WITNESS_A">Saksi A</SelectItem>
                              <SelectItem value="WITNESS_B">Saksi B</SelectItem>
                              <SelectItem value="ACCOMPANIER">Pendamping</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm">Status Kehadiran</Label>
                          <Select value={party.status} onValueChange={(value) => updatePartyAttendance(index, 'status', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PRESENT">✓ Hadir</SelectItem>
                              <SelectItem value="ABSENT_NO_REASON">✗ Tidak Hadir Tanpa Keterangan</SelectItem>
                              <SelectItem value="ABSENT_WITH_REASON">✗ Tidak Hadir dengan Alasan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {party.status === 'ABSENT_WITH_REASON' && (
                          <div className="flex-1 space-y-2">
                            <Label className="text-sm">Alasan</Label>
                            <Input
                              value={party.reason || ''}
                              onChange={(e) => updatePartyAttendance(index, 'reason', e.target.value)}
                              placeholder="Jelaskan alasan ketidakhadiran"
                            />
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePartyAttendance(index)}
                        >
                          Hapus
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="identity-verified"
                  checked={identityVerified}
                  onCheckedChange={(checked) => setIdentityVerified(checked as boolean)}
                />
                <Label htmlFor="identity-verified" className="text-sm">
                  Identitas pihak yang hadir telah diverifikasi
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Catatan Kehadiran</Label>
                <Textarea
                  value={attendanceNotes}
                  onChange={(e) => setAttendanceNotes(e.target.value)}
                  placeholder="Catatan tambahan tentang kehadiran..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Catatan Inti Investigasi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Catatan Inti Investigasi
              </CardTitle>
              <CardDescription>
                Detail hasil wawancara dan temuan during investigasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parties-statement">Ringkasan Keterangan Pihak *</Label>
                <Textarea
                  id="parties-statement"
                  value={partiesStatementSummary}
                  onChange={(e) => setPartiesStatementSummary(e.target.value)}
                  placeholder="Catat secara objektif dan verbatim (kutipan langsung) poin-poin kunci dari keterangan yang diberikan oleh pihak yang hadir. Harus mencakup jawaban atas pertanyaan-pertanyaan investigasi yang spesifik."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-evidence">Temuan Bukti Fisik/Digital Baru</Label>
                <Textarea
                  id="new-evidence"
                  value={newPhysicalEvidence}
                  onChange={(e) => setNewPhysicalEvidence(e.target.value)}
                  placeholder="Deskripsi bukti yang diserahkan/ditemukan pada saat kegiatan berlangsung..."
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <Label>Upload Bukti Baru</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Seret & lepaskan file di sini, atau klik untuk memilih
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.mp4,.mov,.xlsx,.xls,.ppt,.pptx"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    disabled={isUploading}
                    className="hidden"
                    id="evidence-upload"
                  />
                  <Label htmlFor="evidence-upload" className="cursor-pointer">
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
                </div>

                {/* Uploaded Evidence Files */}
                {evidenceFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Bukti yang telah diupload:</Label>
                    <div className="space-y-2">
                      {evidenceFiles.map((file, index) => (
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
                            onClick={() => removeEvidenceFile(index)}
                          >
                            Hapus
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="consistency">Konsistensi Keterangan</Label>
                <Textarea
                  id="consistency"
                  value={statementConsistency}
                  onChange={(e) => setStatementConsistency(e.target.value)}
                  placeholder="Analisis singkat mengenai tingkat konsistensi keterangan pihak tersebut dengan laporan awal dan keterangan pihak lain."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Kesimpulan & Rekomendasi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5" />
                Kesimpulan Sementara & Rekomendasi
              </CardTitle>
              <CardDescription>
                Kesimpulan dari sesi ini dan rekomendasi tindak lanjut
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conclusion">Kesimpulan Sementara dari Sesi Ini</Label>
                <Textarea
                  id="conclusion"
                  value={sessionInterimConclusion}
                  onChange={(e) => setSessionInterimConclusion(e.target.value)}
                  placeholder="Penilaian internal satgas mengenai hasil sesi wawancara/pengumpulan bukti ini..."
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Rekomendasi Tindak Lanjut Segera</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addRecommendedAction}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Rekomendasi
                  </Button>
                </div>
                {recommendedImmediateActions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Belum ada rekomendasi</p>
                ) : (
                  <div className="space-y-3">
                    {recommendedImmediateActions.map((action, index) => (
                      <div key={index} className="flex gap-3 items-end p-3 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm">Tindakan</Label>
                          <Select 
                            value={action.action} 
                            onValueChange={(value) => updateRecommendedAction(index, 'action', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tindakan" />
                            </SelectTrigger>
                            <SelectContent>
                              {recommendedActionsOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm">Prioritas</Label>
                          <Select 
                            value={action.priority} 
                            onValueChange={(value) => updateRecommendedAction(index, 'priority', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HIGH">Tinggi</SelectItem>
                              <SelectItem value="MEDIUM">Sedang</SelectItem>
                              <SelectItem value="LOW">Rendah</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm">Catatan</Label>
                          <Input
                            value={action.notes || ''}
                            onChange={(e) => updateRecommendedAction(index, 'notes', e.target.value)}
                            placeholder="Catatan tambahan"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRecommendedAction(index)}
                        >
                          Hapus
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status-after">Perubahan Status Kasus</Label>
                  <Select value={caseStatusAfterResult} onValueChange={setCaseStatusAfterResult}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {caseStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-reason">Alasan Perubahan Status</Label>
                  <Input
                    id="status-reason"
                    value={statusChangeReason}
                    onChange={(e) => setStatusChangeReason(e.target.value)}
                    placeholder="Jelaskan alasan perubahan status"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Otentikasi & Tanda Tangan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5" />
                Otentikasi Berita Acara
              </CardTitle>
              <CardDescription>
                Verifikasi data dan tanda tangan digital untuk keabsahan dokumen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="data-verification"
                  checked={dataVerificationConfirmed}
                  onCheckedChange={(checked) => setDataVerificationConfirmed(checked as boolean)}
                />
                <Label htmlFor="data-verification" className="text-sm">
                  Saya menyatakan bahwa data yang diinput adalah benar dan sesuai dengan fakta selama kegiatan investigasi
                </Label>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DigitalSignature
                  label="Tanda Tangan Digital Anggota Sabtu (Pembuat BA)"
                  value={creatorDigitalSignature}
                  onChange={(signatureData, signerName) => {
                    setCreatorDigitalSignature(signatureData);
                    setCreatorSignerName(signerName);
                  }}
                  signerName={creatorSignerName}
                  onSignerNameChange={setCreatorSignerName}
                  required
                  signerNameLabel="Nama Anggota Sabtu (Pembuat BA)"
                  placeholder="Tanda tangan di sini..."
                />
                <DigitalSignature
                  label="Tanda Tangan Digital Ketua Forças (Persetujuan Akhir)"
                  value={chairpersonDigitalSignature}
                  onChange={(signatureData, signerName) => {
                    setChairpersonDigitalSignature(signatureData);
                    setChairpersonSignerName(signerName);
                  }}
                  signerName={chairpersonSignerName}
                  onSignerNameChange={setChairpersonSignerName}
                  signerNameLabel="Nama Ketua Forças"
                  placeholder="Tanda tangan di sini..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internal-notes">Catatan Internal OTAN</Label>
                <Textarea
                  id="internal-notes"
                  value={internalSatgasNotes}
                  onChange={(e) => setInternalSatgasNotes(e.target.value)}
                  placeholder="Catatan internal untuk satgas (tidak akan muncul di berita acara resmi)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href={`/satgas/dashboard/investigasi/${id}/rekapan`}>
                Batal
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !dataVerificationConfirmed || !partiesStatementSummary || methods.length === 0 || partiesInvolved.length === 0 || !creatorDigitalSignature || !creatorSignerName}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Simpan Hasil Investigasi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}