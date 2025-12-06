"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Loader2, 
  Clock, 
  MapPin, 
  Users, 
  Settings, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Shield,
  Video,
  Camera,
  FileCheck,
  UserCheck,
  Target,
  ArrowRight,
  Plus,
  X
} from "lucide-react";

interface ComprehensiveScheduleInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduleData: any) => Promise<void>;
  reportId: string;
  reportTitle: string;
  reportNumber?: string;
  reportCategory?: string;
  reportSeverity?: string;
  reportStatus?: string;
  isLoading?: boolean;
}

export default function ComprehensiveScheduleInvestigationModal({
  isOpen,
  onClose,
  onSchedule,
  reportId,
  reportTitle,
  reportNumber,
  reportCategory,
  reportSeverity,
  reportStatus,
  isLoading = false
}: ComprehensiveScheduleInvestigationModalProps) {
  // Form state management
  const [activityTitle, setActivityTitle] = useState("");
  const [activityType, setActivityType] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("");
  
  // Investigation details
  const [methods, setMethods] = useState<string[]>([]);
  const [partiesInvolved, setPartiesInvolved] = useState<string[]>([]);
  const [otherPartiesDetails, setOtherPartiesDetails] = useState("");
  const [purpose, setPurpose] = useState("");
  
  // Equipment and logistics
  const [equipmentNeeded, setEquipmentNeeded] = useState<string[]>([]);
  const [otherEquipmentDetails, setOtherEquipmentDetails] = useState("");
  
  // Team management
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [availableTeamMembers, setAvailableTeamMembers] = useState<any[]>([]);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [newMember, setNewMember] = useState({ userId: "", role: "", isChairPerson: false, responsibilityNotes: "" });
  
  // Companion requirements
  const [companionRequirements, setCompanionRequirements] = useState<string[]>([]);
  const [companionDetails, setCompanionDetails] = useState("");
  
  // Internal notes and planning
  const [internalSatgasNotes, setInternalSatgasNotes] = useState("");
  const [riskNotes, setRiskNotes] = useState("");
  const [consentObtained, setConsentObtained] = useState(false);
  const [consentDocumentation, setConsentDocumentation] = useState("");
  
  // Follow-up planning
  const [nextStepsAfterCompletion, setNextStepsAfterCompletion] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  
  // Access control
  const [accessLevel, setAccessLevel] = useState("CORE_TEAM_ONLY");

  // Auto-populated case information
  const caseAutoInfo = {
    reportId,
    reportTitle,
    reportNumber,
    reportCategory,
    reportSeverity,
    reportStatus,
    generatedAt: new Date().toISOString()
  };

  // Activity types based on user proposal
  const activityTypes = [
    { value: "VICTIM_INTERVIEW", label: "Wawancara Pelapor/Korban", icon: UserCheck },
    { value: "WITNESS_INTERVIEW", label: "Wawancara Saksi", icon: Users },
    { value: "REPORTED_PERSON_INTERVIEW", label: "Wawancara Terlapor", icon: AlertTriangle },
    { value: "EVIDENCE_COLLECTION", label: "Pengumpulan Bukti", icon: FileCheck },
    { value: "LOCATION_OBSERVATION", label: "Observasi Lokasi", icon: MapPin },
    { value: "MEDIATION_SESSION", label: "Sesi Mediasi", icon: Shield },
    { value: "CONFRONTATION", label: "Konfrontasi", icon: ArrowRight },
    { value: "FOLLOW_UP_INTERVIEW", label: "Wawancara Tindak Lanjut", icon: FileText },
    { value: "CASE_REVIEW", label: "Review Kasus", icon: Settings },
    { value: "OTHER", label: "Lainnya", icon: Plus }
  ];

  // Investigation methods
  const investigationMethods = [
    { value: "INTERVIEW", label: "Wawancara" },
    { value: "WRITTEN_CLARIFICATION", label: "Klarifikasi Tertulis" },
    { value: "LOCATION_OBSERVATION", label: "Observasi Lokasi" },
    { value: "DIGITAL_EVIDENCE_COLLECTION", label: "Pengumpulan Bukti Digital" },
    { value: "MEDIATION", label: "Mediasi" },
    { value: "OTHER", label: "Lainnya" }
  ];

  // Investigation parties
  const investigationParties = [
    { value: "VICTIM_SURVIVOR", label: "Korban/Penyintas" },
    { value: "REPORTED_PERSON", label: "Terlapor" },
    { value: "WITNESS", label: "Saksi" },
    { value: "OTHER_PARTY", label: "Pihak Lain" }
  ];

  // Equipment checklist items
  const equipmentItems = [
    { value: "CAMERA_RECORDER", label: "Kamera/Perekam", icon: Camera },
    { value: "AUDIO_RECORDER", label: "Perekam Suara", icon: FileCheck },
    { value: "PRINTED_FORMS", label: "Formulir Cetak", icon: FileText },
    { value: "PROJECTOR_SCREEN", label: "Proyektor/Layar", icon: Video },
    { value: "COMPUTER_LAPTOP", label: "Komputer/Laptop", icon: Settings },
    { value: "PRINTER", label: "Printer", icon: FileCheck },
    { value: "NOTARY_PRESENCE", label: "Kehadiran Notaris", icon: Shield },
    { value: "LEGAL_COUNSEL", label: "Penasihat Hukum", icon: Users },
    { value: "PSYCHOLOGICAL_SUPPORT", label: "Dukungan Psikologis", icon: UserCheck },
    { value: "TRANSLATOR", label: "Translator", icon: FileText },
    { value: "SECURITY_PERSONNEL", label: "Petugas Keamanan", icon: Shield },
    { value: "VIDEO_CONFERENCE_SETUP", label: "Setup Video Conference", icon: Video }
  ];

  // Companion requirements
  const companionRequirementOptions = [
    { value: "PSYCHOLOGIST", label: "Psikolog" },
    { value: "COUNSELOR", label: "Konselor" },
    { value: "LEGAL_ADVISOR", label: "Penasihat Hukum" },
    { value: "RELIGIOUS_COUNSELOR", label: "Konselor Rohani" },
    { value: "FAMILY_MEMBER", label: "Anggota Keluarga" },
    { value: "FRIEND_SUPPORT", label: "Dukungan Teman" },
    { value: "ADVOCATE", label: "Advokat" },
    { value: "NONE", label: "Tidak Diperlukan" }
  ];

  // Team roles
  const teamRoles = [
    { value: "TEAM_LEADER", label: "Ketua Tim" },
    { value: "INVESTIGATOR", label: "Investigator" },
    { value: "NOTE_TAKER", label: "Notulis" },
    { value: "PSYCHOLOGICAL_SUPPORT", label: "Dukungan Psikologis" },
    { value: "LEGAL_SUPPORT", label: "Dukungan Hukum" },
    { value: "OTHER", label: "Lainnya" }
  ];

  // Location types
  const locationTypes = [
    { value: "ON_CAMPUS", label: "Kampus" },
    { value: "OFF_CAMPUS", label: "Luar Kampus" },
    { value: "VIRTUAL", label: "Daring (Zoom/Meet)" },
    { value: "HYBRID", label: "Hibrit" },
    { value: "OTHER", label: "Lainnya" }
  ];

  // Load available team members (mock data for now)
  useEffect(() => {
    if (isOpen) {
      // TODO: Fetch actual team members from API
      setAvailableTeamMembers([
        { id: "1", name: "Dr. Sarah Wijaya", role: "TEAM_LEADER" },
        { id: "2", name: "Budi Santoso, S.Psi", role: "PSYCHOLOGIST" },
        { id: "3", name: "Ibu Maria Sari", role: "INVESTIGATOR" },
        { id: "4", name: "Ahmad Fadli, S.H", role: "LEGAL_ADVISOR" }
      ]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduleData = {
      // Basic information
      reportId,
      activityTitle,
      activityType,
      startDateTime,
      endDateTime,
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
      location,
      locationType,
      
      // Investigation details
      methods,
      partiesInvolved,
      otherPartiesDetails,
      purpose,
      
      // Equipment and logistics
      equipmentChecklist: equipmentNeeded,
      otherEquipmentDetails,
      
      // Team management
      teamMembers,
      
      // Companion requirements
      companionRequirements,
      companionDetails,
      
      // Internal notes and planning
      internalSatgasNotes,
      riskNotes,
      consentObtained,
      consentDocumentation,
      
      // Follow-up planning
      nextStepsAfterCompletion,
      followUpDate: followUpDate || undefined,
      followUpNotes,
      
      // Access control
      accessLevel,
      
      // Auto-populated info
      caseAutoInfo,
      caseSummary: `Investigasi ${activityTitle} untuk kasus ${reportTitle}`
    };

    await onSchedule(scheduleData);
    resetForm();
  };

  const resetForm = () => {
    setActivityTitle("");
    setActivityType("");
    setStartDateTime("");
    setEndDateTime("");
    setEstimatedDuration("");
    setLocation("");
    setLocationType("");
    setMethods([]);
    setPartiesInvolved([]);
    setOtherPartiesDetails("");
    setPurpose("");
    setEquipmentNeeded([]);
    setOtherEquipmentDetails("");
    setTeamMembers([]);
    setCompanionRequirements([]);
    setCompanionDetails("");
    setInternalSatgasNotes("");
    setRiskNotes("");
    setConsentObtained(false);
    setConsentDocumentation("");
    setNextStepsAfterCompletion("");
    setFollowUpDate("");
    setFollowUpNotes("");
    setAccessLevel("CORE_TEAM_ONLY");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    if (checked) {
      setEquipmentNeeded([...equipmentNeeded, equipment]);
    } else {
      setEquipmentNeeded(equipmentNeeded.filter(e => e !== equipment));
    }
  };

  const handleCompanionChange = (companion: string, checked: boolean) => {
    if (checked) {
      setCompanionRequirements([...companionRequirements, companion]);
    } else {
      setCompanionRequirements(companionRequirements.filter(c => c !== companion));
    }
  };

  const addTeamMember = () => {
    if (newMember.userId && newMember.role) {
      const member = availableTeamMembers.find(m => m.id === newMember.userId);
      if (member) {
        setTeamMembers([...teamMembers, { ...newMember, name: member.name }]);
        setNewMember({ userId: "", role: "", isChairPerson: false, responsibilityNotes: "" });
        setShowTeamSelection(false);
      }
    }
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const setChairman = (index: number) => {
    const updatedMembers = teamMembers.map((member, i) => ({
      ...member,
      isChairPerson: i === index
    }));
    setTeamMembers(updatedMembers);
  };

  // Set minimum datetime to now
  const now = new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Form Penjadwalan Investigasi Komprehensif
          </DialogTitle>
          <DialogDescription>
            Jadwalkan kegiatan investigasi untuk kasus: <strong>{reportTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Auto-populated Case Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                📌 Informasi Dasar Kasus (Otomatis)
              </CardTitle>
              <CardDescription>
                Informasi laporan yang terisi otomatis dari sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">ID/Nomor Laporan</Label>
                  <Input value={reportNumber || "Auto-generated"} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Judul Kasus</Label>
                  <Input value={reportTitle} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Jenis Kekerasan Seksual</Label>
                  <Input value={reportCategory || "Belum ditentukan"} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status Kasus Saat Ini</Label>
                  <Badge variant="outline">{reportStatus || "Menunggu Penjadwalan"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Activity Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-green-600" />
                📝 Detail Penjadwalan Kegiatan
              </CardTitle>
              <CardDescription>
                Tentukan apa, kapan, dan di mana kegiatan investigasi dilakukan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Activity Title */}
              <div className="space-y-2">
                <Label htmlFor="activityTitle">Judul Kegiatan</Label>
                <Input
                  id="activityTitle"
                  placeholder="Contoh: Wawancara Pelapor (Keterangan Awal)"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  required
                />
              </div>

              {/* Activity Type */}
              <div className="space-y-2">
                <Label htmlFor="activityType">Jenis Kegiatan Investigasi</Label>
                <Select value={activityType} onValueChange={setActivityType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kegiatan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDateTime">Tanggal & Jam Mulai</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
                    min={now}
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
                    min={startDateTime || now}
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Estimasi Durasi (menit)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    placeholder="120"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locationType">Tipe Lokasi</Label>
                  <Select value={locationType} onValueChange={setLocationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe lokasi..." />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi Pertemuan</Label>
                  <Input
                    id="location"
                    placeholder="Contoh: Ruang Satgas PPKS, Ruang Rapat Pimpinan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Tujuan Kegiatan</Label>
                <Textarea
                  id="purpose"
                  placeholder="Jelaskan secara ringkas maksud dari pertemuan/investigasi tersebut..."
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>

              {/* Methods */}
              <div className="space-y-3">
                <Label>Metode/Bentuk Kegiatan</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

              {/* Parties Involved */}
              <div className="space-y-3">
                <Label>Pihak yang Dipanggil/Terlibat</Label>
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

          {/* Section 3: Logistics & Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5 text-orange-600" />
                🗄️ Kebutuhan Logistik & Perlengkapan
              </CardTitle>
              <CardDescription>
                Pastikan semua peralatan dan logistik yang diperlukan tersedia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Equipment Checklist */}
              <div className="space-y-3">
                <Label>Kebutuhan Alat/Perlengkapan</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {equipmentItems.map((item) => (
                    <div key={item.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`equipment-${item.value}`}
                        checked={equipmentNeeded.includes(item.value)}
                        onCheckedChange={(checked) => handleEquipmentChange(item.value, checked as boolean)}
                      />
                      <Label htmlFor={`equipment-${item.value}`} className="text-sm flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Equipment */}
              {equipmentNeeded.includes("OTHER") && (
                <div className="space-y-2">
                  <Label htmlFor="otherEquipmentDetails">Detail Perlengkapan Lainnya</Label>
                  <Textarea
                    id="otherEquipmentDetails"
                    placeholder="Sebutkan perlengkapan atau kebutuhan khusus lainnya..."
                    rows={2}
                    value={otherEquipmentDetails}
                    onChange={(e) => setOtherEquipmentDetails(e.target.value)}
                  />
                </div>
              )}

              {/* Companion Requirements */}
              <div className="space-y-3">
                <Label>Kebutuhan Pendampingan</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {companionRequirementOptions.map((companion) => (
                    <div key={companion.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`companion-${companion.value}`}
                        checked={companionRequirements.includes(companion.value)}
                        onCheckedChange={(checked) => handleCompanionChange(companion.value, checked as boolean)}
                      />
                      <Label htmlFor={`companion-${companion.value}`} className="text-sm">
                        {companion.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {companionRequirements.length > 0 && companionRequirements[0] !== "NONE" && (
                  <div className="space-y-2">
                    <Label htmlFor="companionDetails">Detail Pendampingan</Label>
                    <Textarea
                      id="companionDetails"
                      placeholder="Jelaskan detail tentang pendamping yang diperlukan..."
                      rows={2}
                      value={companionDetails}
                      onChange={(e) => setCompanionDetails(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Team Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-purple-600" />
                👥 Pihak Terkait & Tim Investigasi
              </CardTitle>
              <CardDescription>
                Siapa saja yang terlibat dalam kegiatan investigasi tersebut
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Current Team Members */}
              {teamMembers.length > 0 && (
                <div className="space-y-3">
                  <Label>Anggota Tim Saat Ini</Label>
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          <Badge variant="outline">{teamRoles.find(r => r.value === member.role)?.label}</Badge>
                          {member.isChairPerson && (
                            <Badge className="bg-blue-100 text-blue-800">👑 Ketua</Badge>
                          )}
                        </div>
                        {member.responsibilityNotes && (
                          <p className="text-sm text-gray-600 mt-1">{member.responsibilityNotes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!member.isChairPerson && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setChairman(index)}
                          >
                            Jadikan Ketua
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTeamMember(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Team Member */}
              <div className="border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTeamSelection(!showTeamSelection)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Anggota Tim
                </Button>

                {showTeamSelection && (
                  <div className="mt-4 p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newMemberUserId">Anggota Satgas</Label>
                        <Select value={newMember.userId} onValueChange={(value) => setNewMember({...newMember, userId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih anggota..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTeamMembers
                              .filter(member => !teamMembers.some(tm => tm.userId === member.id))
                              .map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newMemberRole">Peran dalam Tim</Label>
                        <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih peran..." />
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
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="responsibilityNotes">Tanggung Jawab Khusus</Label>
                      <Input
                        id="responsibilityNotes"
                        placeholder="Catatan tanggung jawab khusus untuk anggota ini..."
                        value={newMember.responsibilityNotes}
                        onChange={(e) => setNewMember({...newMember, responsibilityNotes: e.target.value})}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isChairPerson"
                        checked={newMember.isChairPerson}
                        onCheckedChange={(checked) => setNewMember({...newMember, isChairPerson: checked as boolean})}
                      />
                      <Label htmlFor="isChairPerson" className="text-sm">
                        Jadikan sebagai Ketua/Anggota Penanggung Jawab
                      </Label>
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" onClick={addTeamMember} disabled={!newMember.userId || !newMember.role}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Tambah
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowTeamSelection(false)}>
                        Batal
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Internal Notes & Planning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-red-600" />
                🛡️ Catatan Internal OTAN & Perencanaan
              </CardTitle>
              <CardDescription>
                Untuk detail sensitif atau persiapan yang tidak boleh bocor ke pihak yang dipanggil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Internal OTAN Notes */}
              <div className="space-y-2">
                <Label htmlFor="internalSatgasNotes" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Catatan Internal OTAN
                  <Badge variant="secondary" className="text-xs">Hanya видим для OTAN</Badge>
                </Label>
                <Textarea
                  id="internalSatgasNotes"
                  placeholder="Catatan sensitif untuk persiapan OTAN, strategi, atau informasi yang tidak boleh diketahui pihak yang dipanggil..."
                  rows={4}
                  value={internalSatgasNotes}
                  onChange={(e) => setInternalSatgasNotes(e.target.value)}
                  className="border-red-200 focus:border-red-400"
                />
              </div>

              {/* Risk Notes */}
              <div className="space-y-2">
                <Label htmlFor="riskNotes">Catatan Risiko & Keamanan</Label>
                <Textarea
                  id="riskNotes"
                  placeholder="Identifikasi risiko potensial dan langkah keamanan yang diperlukan..."
                  rows={3}
                  value={riskNotes}
                  onChange={(e) => setRiskNotes(e.target.value)}
                />
              </div>

              {/* Consent Documentation */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consentObtained"
                    checked={consentObtained}
                    onCheckedChange={(checked) => setConsentObtained(checked as boolean)}
                  />
                  <Label htmlFor="consentObtained">Persetujuan diperoleh</Label>
                </div>
                {consentObtained && (
                  <div className="space-y-2">
                    <Label htmlFor="consentDocumentation">Cara Dokumentasi Persetujuan</Label>
                    <Select value={consentDocumentation} onValueChange={setConsentDocumentation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode dokumentasi..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="written_consent">Persetujuan Tertulis</SelectItem>
                        <SelectItem value="verbal_consent_recorded">Persetujuan Lisan Terdokumentasi</SelectItem>
                        <SelectItem value="digital_signature">Tanda Tangan Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Follow-up Planning */}
              <div className="space-y-2">
                <Label htmlFor="nextStepsAfterCompletion">Tindakan Selanjutnya Setelah Ini</Label>
                <Textarea
                  id="nextStepsAfterCompletion"
                  placeholder="Mendefinisikan langkah logis berikutnya jika kegiatan ini selesai (misalnya: 'Jika hasil wawancara positif, jadwalkan konfrontasi')..."
                  rows={3}
                  value={nextStepsAfterCompletion}
                  onChange={(e) => setNextStepsAfterCompletion(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="followUpDate">Jadwal Tindak Lanjut</Label>
                  <Input
                    id="followUpDate"
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Level Akses</Label>
                  <Select value={accessLevel} onValueChange={setAccessLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORE_TEAM_ONLY">Tim Inti Saja</SelectItem>
                      <SelectItem value="FULL_SATGAS">Seluruh OTAN</SelectItem>
                      <SelectItem value="LEADERSHIP_ONLY">Pimpinan Tertentu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Follow-up Notes */}
              <div className="space-y-2">
                <Label htmlFor="followUpNotes">Catatan Tindak Lanjut</Label>
                <Textarea
                  id="followUpNotes"
                  placeholder="Catatan tambahan untuk tindak lanjut..."
                  rows={2}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !activityTitle || !activityType || !startDateTime || !location || !purpose}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              📅 Jadwalkan Investigasi Komprehensif
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}