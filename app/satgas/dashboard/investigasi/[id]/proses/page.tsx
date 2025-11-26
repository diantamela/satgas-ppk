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
  FileCheck
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface TeamMember {
  userId: string;
  role: string;
  customRole?: string;
}

export default function InvestigationProsesPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form states
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [methods, setMethods] = useState<string[]>([]);
  const [partiesInvolved, setPartiesInvolved] = useState<string[]>([]);
  const [otherPartiesDetails, setOtherPartiesDetails] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
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

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !location) return;

    setIsSubmitting(true);
    try {
      const scheduleData: any = {
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
  
      // Add optional date fields if provided
      if (startDateTime) {
        scheduleData.startDateTime = startDateTime;
      }
      if (endDateTime) {
        scheduleData.endDateTime = endDateTime;
      }

      const response = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: id,
          ...scheduleData
        }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.success) {
          // Create activity automatically
          const activityData: any = {
            activityType: "SCHEDULED_INVESTIGATION",
            title: `Proses Investigasi: ${planSummary || 'Investigasi Terjadwal'}`,
            description: `Proses investigasi terjadwal${startDateTime && endDateTime ? ` pada ${new Date(startDateTime).toLocaleString('id-ID')} - ${new Date(endDateTime).toLocaleString('id-ID')}` : ''} di ${location}. ${planSummary ? `Rencana: ${planSummary}` : ''}${methods.length > 0 ? ` Metode: ${methods.join(', ')}` : ''}${partiesInvolved.length > 0 ? ` Pihak terlibat: ${partiesInvolved.join(', ')}` : ''}${otherPartiesDetails ? ` Detail pihak lain: ${otherPartiesDetails}` : ''}${riskNotes ? ` Catatan risiko: ${riskNotes}` : ''}`,
            location,
            participants: teamMembers.map(member => member.userId || member.role).filter(Boolean),
            outcomes: planSummary || undefined,
            challenges: riskNotes || undefined,
            recommendations: followUpNotes || undefined,
            isConfidential: false,
            accessLevel
          };

          // Add optional date fields if provided
          if (startDateTime) {
            activityData.startDateTime = startDateTime;
          }
          if (endDateTime) {
            activityData.endDateTime = endDateTime;
          }

          await fetch(`/api/reports/${id}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityData),
          });

          setAlertMessage({ type: 'success', message: 'Proses investigasi berhasil dibuat dan dicatat sebagai kegiatan' });
          setTimeout(() => {
            setAlertMessage(null);
            router.push(`/satgas/dashboard/investigasi/${id}/rekapan`);
          }, 2000);
        } else {
          setAlertMessage({ type: 'error', message: data.message || 'Gagal membuat proses investigasi' });
        }
      } else {
        setAlertMessage({ type: 'error', message: 'Gagal membuat proses investigasi - respons server tidak valid' });
      }
    } catch (error) {
      console.error('Schedule investigation error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat membuat proses investigasi' });
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Proses Investigasi</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{report.reportNumber}</span>
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Proses Investigasi</Badge>
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
          {/* Block 1: Info Dasar Sesi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Info Dasar Sesi
              </CardTitle>
              <CardDescription>
                Tanggal, waktu, lokasi, metode, dan pihak yang terlibat dalam proses investigasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDateTime">Tanggal & Jam Mulai</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
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
            </CardContent>
          </Card>

          {/* Block 2: Tim & Tugas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Tim & Tugas
              </CardTitle>
              <CardDescription>
                Anggota tim, peran, persetujuan, dan catatan keamanan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Block 3: Output & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Output & Status
              </CardTitle>
              <CardDescription>
                Ringkasan rencana, lampiran, tindak lanjut, dan level akses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Block 4: Upload Dokumen & Lampiran */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="w-5 h-5" />
                Upload Dokumen & Lampiran Proses Investigasi
              </CardTitle>
              <CardDescription>
                Upload file pendukung untuk proses investigasi (maksimal 10MB per file)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Upload file lampiran proses investigasi</Label>
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
                    Format yang didukung: JPG, PNG, GIF, PDF, DOC, DOCX, TXT, MP4, MOV, XLSX, XLS, PPT, PPTX
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href={`/satgas/dashboard/investigasi/${id}/rekapan`}>
                Batal
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || !location}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Simpan Proses Investigasi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}