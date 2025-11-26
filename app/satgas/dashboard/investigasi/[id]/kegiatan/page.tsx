"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Plus,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  User,
  Upload
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface InvestigationActivity {
  id: string;
  activityType: string;
  title: string;
  description: string;
  location?: string;
  startDateTime: Date;
  endDateTime?: Date;
  duration?: number;
  participants: string[];
  conductedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  outcomes?: string;
  challenges?: string;
  recommendations?: string;
  isConfidential: boolean;
  accessLevel: string;
  schedule?: {
    id: string;
    startDateTime: Date;
    endDateTime: Date;
    location: string;
    methods: string[];
    partiesInvolved: string[];
    otherPartiesDetails?: string;
    teamMembers: Array<{
      id: string;
      user: {
        name: string;
        email: string;
      };
      role: string;
      customRole?: string;
    }>;
    consentObtained: boolean;
    consentDocumentation?: string;
    riskNotes?: string;
    planSummary?: string;
    followUpAction?: string;
    followUpDate?: Date;
    followUpNotes?: string;
    accessLevel: string;
    attachments: any[];
  };
  attachments: any[];
}

export default function InvestigationActivitiesPage() {
  const { id } = useParams();
  const [activities, setActivities] = useState<InvestigationActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form states
  const [activityType, setActivityType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [participants, setParticipants] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [challenges, setChallenges] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [isConfidential, setIsConfidential] = useState(false);
  const [accessLevel, setAccessLevel] = useState("CORE_TEAM_ONLY");

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (id) {
          const response = await fetch(`/api/reports/${id}/activities`);
          const data = await response.json();
          if (data.success) {
            setActivities(data.activities);
          } else {
            console.error("Error fetching activities:", data.message);
          }
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [id]);

  const activityTypeOptions = [
    { value: "INTERVIEW_CONDUCTED", label: "Wawancara Dilakukan" },
    { value: "EVIDENCE_COLLECTED", label: "Bukti Dikumpulkan" },
    { value: "SITE_VISIT", label: "Kunjungan Lokasi" },
    { value: "DOCUMENT_REVIEW", label: "Tinjauan Dokumen" },
    { value: "WITNESS_STATEMENT", label: "Pernyataan Saksi" },
    { value: "MEDIATION_SESSION", label: "Sesi Mediasi" },
    { value: "FOLLOW_UP_ACTION", label: "Tindak Lanjut" },
    { value: "OTHER_ACTIVITY", label: "Kegiatan Lain" }
  ];

  const accessLevelOptions = [
    { value: "CORE_TEAM_ONLY", label: "Hanya Tim Inti" },
    { value: "FULL_SATGAS", label: "Satgas Penuh" },
    { value: "LEADERSHIP_ONLY", label: "Pimpinan Tertentu" }
  ];

  const getActivityTypeLabel = (type: string) => {
    const option = activityTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SCHEDULED_INVESTIGATION: "bg-cyan-100 text-cyan-800",
      INTERVIEW_CONDUCTED: "bg-blue-100 text-blue-800",
      EVIDENCE_COLLECTED: "bg-green-100 text-green-800",
      SITE_VISIT: "bg-purple-100 text-purple-800",
      DOCUMENT_REVIEW: "bg-yellow-100 text-yellow-800",
      WITNESS_STATEMENT: "bg-orange-100 text-orange-800",
      MEDIATION_SESSION: "bg-pink-100 text-pink-800",
      FOLLOW_UP_ACTION: "bg-indigo-100 text-indigo-800",
      OTHER_ACTIVITY: "bg-gray-100 text-gray-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !activityType || !title || !description || !startDateTime) return;

    setIsSubmitting(true);
    try {
      const activityData = {
        activityType,
        title,
        description,
        location: location || undefined,
        startDateTime,
        endDateTime: endDateTime || undefined,
        participants: participants ? participants.split(',').map(p => p.trim()) : [],
        outcomes: outcomes || undefined,
        challenges: challenges || undefined,
        recommendations: recommendations || undefined,
        isConfidential,
        accessLevel
      };

      const response = await fetch(`/api/reports/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });

      const data = await response.json();
      if (data.success) {
        setActivities(prev => [data.activity, ...prev]);
        setShowCreateDialog(false);
        setAlertMessage({ type: 'success', message: 'Kegiatan investigasi berhasil dicatat' });
        setTimeout(() => setAlertMessage(null), 3000);

        // Reset form
        setActivityType("");
        setTitle("");
        setDescription("");
        setLocation("");
        setStartDateTime("");
        setEndDateTime("");
        setParticipants("");
        setOutcomes("");
        setChallenges("");
        setRecommendations("");
        setIsConfidential(false);
        setAccessLevel("CORE_TEAM_ONLY");
      } else {
        setAlertMessage({ type: 'error', message: data.message || 'Gagal mencatat kegiatan investigasi' });
      }
    } catch (error) {
      console.error('Create activity error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat mencatat kegiatan investigasi' });
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-64"></div>
          </div>
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
              <Link href={`/satgas/dashboard/investigasi/${id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Detail Investigasi
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Kegiatan Investigasi</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Catat dan pantau semua kegiatan investigasi yang telah dilakukan
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Catat Kegiatan Baru
          </Button>
        </div>

        {/* Activities List */}
        <div className="space-y-6">
          {activities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Belum ada kegiatan investigasi
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Mulai catat kegiatan investigasi yang telah Anda lakukan.
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Catat Kegiatan Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            activities.map((activity) => (
              <Card key={activity.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getActivityTypeColor(activity.activityType)}>
                          {getActivityTypeLabel(activity.activityType)}
                        </Badge>
                        {activity.isConfidential && (
                          <Badge variant="destructive">Rahasia</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{activity.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {activity.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Mulai:</span>
                      <span className="font-medium">
                        {new Date(activity.startDateTime).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {activity.endDateTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Selesai:</span>
                        <span className="font-medium">
                          {new Date(activity.endDateTime).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    {activity.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Lokasi:</span>
                        <span className="font-medium">{activity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Dilakukan oleh:</span>
                      <span className="font-medium">{activity.conductedBy.name}</span>
                    </div>
                  </div>

                  {activity.participants.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Peserta
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activity.participants.map((participant, index) => (
                            <Badge key={index} variant="outline">
                              {participant}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Schedule Details for SCHEDULED_INVESTIGATION */}
                  {activity.activityType === "SCHEDULED_INVESTIGATION" && activity.schedule && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Detail Jadwal Investigasi</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Waktu Mulai</h4>
                            <p className="text-gray-900 dark:text-white">
                              {new Date(activity.schedule.startDateTime).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Waktu Selesai</h4>
                            <p className="text-gray-900 dark:text-white">
                              {new Date(activity.schedule.endDateTime).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi</h4>
                            <p className="text-gray-900 dark:text-white">{activity.schedule.location}</p>
                          </div>
                        </div>

                        {activity.schedule.methods && activity.schedule.methods.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Metode Investigasi</h4>
                            <div className="flex flex-wrap gap-2">
                              {activity.schedule.methods.map((method: string) => (
                                <Badge key={method} variant="secondary">
                                  {method.replace(/_/g, ' ').toLowerCase()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {activity.schedule.partiesInvolved && activity.schedule.partiesInvolved.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Pihak Terlibat</h4>
                            <div className="flex flex-wrap gap-2">
                              {activity.schedule.partiesInvolved.map((party: string) => (
                                <Badge key={party} variant="outline">
                                  {party.replace(/_/g, ' ').toLowerCase()}
                                </Badge>
                              ))}
                            </div>
                            {activity.schedule.otherPartiesDetails && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {activity.schedule.otherPartiesDetails}
                              </p>
                            )}
                          </div>
                        )}

                        {activity.schedule.teamMembers && activity.schedule.teamMembers.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tim Investigasi</h4>
                            <div className="space-y-2">
                              {activity.schedule.teamMembers.map((member: any) => (
                                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Persetujuan Diperoleh</h4>
                            <Badge variant={activity.schedule.consentObtained ? "default" : "destructive"}>
                              {activity.schedule.consentObtained ? "Ya" : "Tidak"}
                            </Badge>
                          </div>
                          {activity.schedule.consentDocumentation && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Dokumentasi Persetujuan</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {activity.schedule.consentDocumentation}
                              </p>
                            </div>
                          )}
                        </div>

                        {activity.schedule.riskNotes && (
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Risiko & Keamanan</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.schedule.riskNotes}
                            </p>
                          </div>
                        )}

                        {activity.schedule.planSummary && (
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Ringkasan Rencana</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.schedule.planSummary}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activity.schedule.followUpAction && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tindak Lanjut</h4>
                              <Badge variant="outline">
                                {activity.schedule.followUpAction.replace(/_/g, ' ').toLowerCase()}
                              </Badge>
                            </div>
                          )}
                          {activity.schedule.followUpDate && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Target</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(activity.schedule.followUpDate).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          )}
                        </div>

                        {activity.schedule.followUpNotes && (
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Tindak Lanjut</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.schedule.followUpNotes}
                            </p>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Level Akses</h4>
                          <Badge variant="secondary">
                            {activity.schedule.accessLevel.replace(/_/g, ' ').toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}

                  {(activity.outcomes || activity.challenges || activity.recommendations) && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        {activity.outcomes && (
                          <div>
                            <h4 className="font-medium text-green-700 dark:text-green-400 mb-1 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Hasil yang Dicapai
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{activity.outcomes}</p>
                          </div>
                        )}
                        {activity.challenges && (
                          <div>
                            <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-1 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Tantangan
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{activity.challenges}</p>
                          </div>
                        )}
                        {activity.recommendations && (
                          <div>
                            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Rekomendasi
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{activity.recommendations}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activity.attachments.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Lampiran ({activity.attachments.length})
                        </h4>
                        <div className="space-y-2">
                          {activity.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{attachment.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {(attachment.fileSize / 1024).toFixed(1)} KB • {attachment.fileType}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Activity Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Catat Kegiatan Investigasi</DialogTitle>
              <DialogDescription>
                Catat detail kegiatan investigasi yang telah dilakukan untuk melengkapi dokumentasi.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateActivity} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activityType">Jenis Kegiatan *</Label>
                  <Select value={activityType} onValueChange={setActivityType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kegiatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Level Akses</Label>
                  <Select value={accessLevel} onValueChange={setAccessLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accessLevelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Judul Kegiatan *</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Wawancara dengan Korban"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Kegiatan *</Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan detail kegiatan yang dilakukan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDateTime">Tanggal & Jam Mulai *</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
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
                    min={startDateTime}
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi Kegiatan</Label>
                <Input
                  id="location"
                  placeholder="Contoh: Ruang Konseling Lt. 2, Via Zoom"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="participants">Peserta (pisahkan dengan koma)</Label>
                <Input
                  id="participants"
                  placeholder="Contoh: Ahmad Rahman, Siti Nurhaliza, Dr. Budi Santoso"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Hasil & Evaluasi</h3>

                <div className="space-y-2">
                  <Label htmlFor="outcomes">Hasil yang Dicapai</Label>
                  <Textarea
                    id="outcomes"
                    placeholder="Apa yang berhasil dicapai dari kegiatan ini..."
                    value={outcomes}
                    onChange={(e) => setOutcomes(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challenges">Tantangan yang Dihadapi</Label>
                  <Textarea
                    id="challenges"
                    placeholder="Apa saja tantangan atau kendala yang dihadapi..."
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendations">Rekomendasi Tindak Lanjut</Label>
                  <Textarea
                    id="recommendations"
                    placeholder="Rekomendasi untuk langkah selanjutnya..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                  Simpan Kegiatan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}