"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Users, Shield, FileText, Clock, MapPin, UserPlus } from "lucide-react";

interface TeamMember {
  userId: string;
  role: string;
  customRole?: string;
}

interface ScheduleInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduleData: any) => Promise<void>;
  reportTitle: string;
  isLoading?: boolean;
}

export default function ScheduleInvestigationModal({
  isOpen,
  onClose,
  onSchedule,
  reportTitle,
  isLoading = false
}: ScheduleInvestigationModalProps) {
  // Block 1: Info Dasar Sesi
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [methods, setMethods] = useState<string[]>([]);
  const [partiesInvolved, setPartiesInvolved] = useState<string[]>([]);
  const [otherPartiesDetails, setOtherPartiesDetails] = useState("");

  // Block 2: Tim & Tugas
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [consentObtained, setConsentObtained] = useState(false);
  const [consentDocumentation, setConsentDocumentation] = useState("");
  const [riskNotes, setRiskNotes] = useState("");

  // Block 3: Output & Status
  const [planSummary, setPlanSummary] = useState("");
  const [followUpAction, setFollowUpAction] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [accessLevel, setAccessLevel] = useState("CORE_TEAM_ONLY");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDateTime || !endDateTime || !location) return;

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
      accessLevel
    };

    await onSchedule(scheduleData);
    resetForm();
  };

  const resetForm = () => {
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

  // Set minimum datetime to now
  const now = new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Jadwalkan Investigasi
          </DialogTitle>
          <DialogDescription>
            Atur jadwal lengkap untuk investigasi laporan: <strong>{reportTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Block 1: Info Dasar Sesi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Info Dasar Sesi
              </CardTitle>
              <CardDescription>
                Tanggal, waktu, lokasi, metode, dan pihak yang terlibat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !startDateTime || !endDateTime || !location}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Jadwalkan Investigasi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}