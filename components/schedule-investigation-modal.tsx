"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2, Clock, MapPin } from "lucide-react";

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
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [methods, setMethods] = useState<string[]>([]);
  const [partiesInvolved, setPartiesInvolved] = useState<string[]>([]);
  const [otherPartiesDetails, setOtherPartiesDetails] = useState("");

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
      // Set default values for removed fields
      teamMembers: [],
      consentObtained: false,
      consentDocumentation: "",
      riskNotes: "",
      planSummary: "",
      followUpAction: "",
      followUpDate: "",
      followUpNotes: "",
      accessLevel: "CORE_TEAM_ONLY"
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

  // Set minimum datetime to now
  const now = new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Jadwalkan Investigasi
          </DialogTitle>
          <DialogDescription>
            Atur jadwal investigasi untuk laporan: <strong>{reportTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Informasi Dasar
              </CardTitle>
              <CardDescription>
                Tanggal, waktu, lokasi, metode, dan pihak yang terlibat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tanggal & Waktu */}
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

              {/* Lokasi */}
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

              {/* Metode */}
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

              {/* Pihak yang Terlibat */}
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