"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2 } from "lucide-react";

interface ScheduleInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledDate: string, notes: string) => Promise<void>;
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
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate.trim()) return;

    await onSchedule(scheduledDate, notes);
    // Reset form
    setScheduledDate("");
    setNotes("");
  };

  const handleClose = () => {
    setScheduledDate("");
    setNotes("");
    onClose();
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Jadwalkan Investigasi
          </DialogTitle>
          <DialogDescription>
            Atur jadwal untuk memulai investigasi laporan: <strong>{reportTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Tanggal Mulai Investigasi</Label>
            <Input
              id="scheduledDate"
              type="date"
              min={today}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Penjadwalan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan tentang penjadwalan investigasi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || !scheduledDate.trim()}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Jadwalkan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}