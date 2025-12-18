"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DigitalSignature from "@/components/ui/digital-signature";
import {
  FileText,
  ArrowLeft,
  Download,
  Calendar,
  Users,
  Image,
  Play,
  Pause,
  Volume2,
  File,
  AlertTriangle,
  Clock,
  MapPin,
  Shield,
  Upload,
  Loader2,
  Save,
  Eye,
  FileCheck,
  CheckCircle,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDateTimeForInput, parseDateTimeFromInput } from "@/lib/utils/utils";

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

export default function InvestigationResultDetailPage() {
  const { id, resultId } = useParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [evidenceDocuments, setEvidenceDocuments] = useState<any[]>([]);
  const [scheduling, setScheduling] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form states from proses page
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

  // Memoized constants to prevent unnecessary re-renders
  const investigationMethods = useMemo(() => [
    { value: "INTERVIEW", label: "Wawancara" },
    { value: "WRITTEN_CLARIFICATION", label: "Klarifikasi Tertulis" },
    { value: "LOCATION_OBSERVATION", label: "Observasi Lokasi" },
    { value: "DIGITAL_EVIDENCE_COLLECTION", label: "Pengumpulan Bukti Digital" },
    { value: "MEDIATION", label: "Mediasi" },
    { value: "OTHER", label: "Lainnya" }
  ], []);

  const investigationParties = useMemo(() => [
    { value: "VICTIM_SURVIVOR", label: "Korban/Penyintas" },
    { value: "REPORTED_PERSON", label: "Terlapor" },
    { value: "WITNESS", label: "Saksi" },
    { value: "OTHER_PARTY", label: " Pihak Lain" }
  ], []);

  const accessLevels = useMemo(() => [
    { value: "CORE_TEAM_ONLY", label: "Hanya Tim Inti" },
    { value: "FULL_SATGAS", label: "Satgas Penuh" },
    { value: "LEADERSHIP_ONLY", label: "Pimpinan Tertentu" }
  ], []);

  const recommendedActionsOptions = useMemo(() => [
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
  ], []);

  const caseStatusOptions = useMemo(() => [
    { value: 'UNDER_INVESTIGATION', label: 'Sedang Berlangsung' },
    { value: 'EVIDENCE_COLLECTION', label: 'Pengumpulan Bukti' },
    { value: 'STATEMENT_ANALYSIS', label: 'Analisis Keterangan' },
    { value: 'PENDING_EXTERNAL_INPUT', label: 'Menunggu Input Eksternal' },
    { value: 'READY_FOR_RECOMMENDATION', label: 'Siap untuk Rekomendasi' },
    { value: 'CLOSED_TERMINATED', label: 'Ditutup/Dihentikan' },
    { value: 'FORWARDED_TO_REKTORAT', label: 'Diteruskan ke Rektorat' }
  ], []);

  // Memoized fetch data function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    try {
      if (!id || !resultId) return;

      const reportId = Array.isArray(id) ? id[0] : id;
      const resultIdStr = Array.isArray(resultId) ? resultId[0] : resultId;

      // Fetch report data
      const reportResponse = await fetch(`/api/reports/${reportId}`);
      const reportData = await reportResponse.json();
      if (reportData.success) {
        setReport(reportData.report);
        setCaseTitle(reportData.report.title);
        setReportNumber(reportData.report.reportNumber);
      }

      // Fetch investigation result
      const resultResponse = await fetch(`/api/reports/${reportId}/results`);
      if (resultResponse.ok) {
        const resultsData = await resultResponse.json();
        if (resultsData.success && resultsData.results) {
          const foundResult = resultsData.results.find((r: any) => r.id === resultIdStr);
          console.log('Found result:', foundResult);
          console.log('Evidence files in result:', foundResult?.evidenceFiles);
          console.log('Investigation documents:', foundResult?.report?.documents);
          
          if (foundResult) {
            setResult(foundResult);
            
            // Populate form fields with existing data
            setSchedulingTitle(foundResult.schedulingTitle || 'Sesi Investigasi');
            setStartDateTime(formatDateTimeForInput(foundResult.startDateTime) || '');
            setEndDateTime(formatDateTimeForInput(foundResult.endDateTime) || '');
            setSchedulingLocation(foundResult.schedulingLocation || foundResult.location || '');
            
            setLocation(foundResult.location || '');
            setMethods(foundResult.methods || []);
            setPartiesInvolved(foundResult.partiesInvolved || []);
            setOtherPartiesDetails(foundResult.otherPartiesDetails || '');
            setRiskNotes(foundResult.riskNotes || '');
            setPlanSummary(foundResult.planSummary || '');
            setAccessLevel(foundResult.accessLevel || 'CORE_TEAM_ONLY');
            
            setSatgasMembersPresent(foundResult.satgasMembersPresent || []);
            setPartiesPresent(foundResult.partiesPresent || []);
            setIdentityVerified(foundResult.identityVerified || false);
            setAttendanceNotes(foundResult.attendanceNotes || '');
            
            setPartiesStatementSummary(foundResult.partiesStatementSummary || '');
            setNewPhysicalEvidence(foundResult.newPhysicalEvidence || '');
            setEvidenceFiles(foundResult.evidenceFiles || []);
            setStatementConsistency(foundResult.statementConsistency || '');
            
            setSessionInterimConclusion(foundResult.sessionInterimConclusion || '');
            setRecommendedImmediateActions(foundResult.recommendedImmediateActions || []);
            setCaseStatusAfterResult(foundResult.caseStatusAfterResult || 'UNDER_INVESTIGATION');
            setStatusChangeReason(foundResult.statusChangeReason || '');
            
            setDataVerificationConfirmed(foundResult.dataVerificationConfirmed || false);
            setCreatorDigitalSignature(foundResult.creatorDigitalSignature || '');
            setCreatorSignerName(foundResult.creatorSignerName || '');
            setChairpersonDigitalSignature(foundResult.chairpersonDigitalSignature || '');
            setChairpersonSignerName(foundResult.chairpersonSignerName || '');
            
            setInternalSatgasNotes(foundResult.internalSatgasNotes || '');
            
            // Only show evidence files from the results/hasil phase
            const allEvidenceFiles = [];
            
            // Add legacy format files from evidenceFiles JSON field (from hasil phase only)
            if (foundResult.evidenceFiles && Array.isArray(foundResult.evidenceFiles)) {
              // Convert legacy format to match new format structure
              const legacyFiles = foundResult.evidenceFiles.map((file: any, index: number) => ({
                id: `legacy-${index}`, // Temporary ID for legacy files
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                storagePath: file.path,
                uploadedAt: file.uploadedAt,
                isLegacy: true, // Flag to identify legacy files
                // Store original file data for download
                originalFile: file
              }));
              allEvidenceFiles.push(...legacyFiles);
            }
            
            setEvidenceDocuments(allEvidenceFiles);
          } else {
            setError("Hasil investigasi tidak ditemukan");
          }
        } else {
          setError("Gagal memuat data hasil investigasi");
        }
      } else {
        setError("Gagal memuat data hasil investigasi");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  }, [id, resultId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID");
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID");
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

  const [isDragOver, setIsDragOver] = useState(false);

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
            const uploadedFile = {
              name: file.name,
              path: data.filePath,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString()
            };
            
            setUploadedFiles(prev => [...prev, uploadedFile]);
            setEvidenceFiles(prev => [...prev, uploadedFile]);
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
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeEvidenceFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !resultId || !methods.length || !partiesInvolved.length || !partiesStatementSummary) return;

    setIsSubmitting(true);
    try {
      const formData = {
        // Original process data
        processId: result?.processId,
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
        
        // New results data
        schedulingTitle,
        startDateTime: parseDateTimeFromInput(startDateTime),
        endDateTime: parseDateTimeFromInput(endDateTime),
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
        evidenceFiles: evidenceFiles, // Ensure evidenceFiles is properly sent
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

      console.log('Updating investigation result with data:', formData);

      const reportId = Array.isArray(id) ? id[0] : id;
      const resultIdStr = Array.isArray(resultId) ? resultId[0] : resultId;

      const response = await fetch(`/api/reports/${reportId}/results/${resultIdStr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.success) {
          setAlertMessage({ type: 'success', message: 'Hasil investigasi berhasil diperbarui' });
          setTimeout(() => {
            setAlertMessage(null);
            setIsEditMode(false);
            // Refresh data
            fetchData();
          }, 1000);
        } else {
          setAlertMessage({ type: 'error', message: data.message || 'Gagal memperbarui hasil investigasi' });
        }
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        setAlertMessage({ type: 'error', message: 'Gagal memperbarui hasil investigasi - respons server tidak valid' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat memperbarui hasil investigasi' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadResultPdf = async () => {
    if (!id || !resultId) return;
    const reportId = Array.isArray(id) ? id[0] : id;
    const resultIdStr = Array.isArray(resultId) ? resultId[0] : resultId;

    try {
      const response = await fetch(`/api/reports/${reportId}/results/${resultIdStr}/pdf`);
      if (!response.ok) {
        alert("Gagal mengunduh PDF hasil investigasi");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `berita-acara-${report?.reportNumber || reportId}-${resultIdStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Terjadi kesalahan saat mengunduh PDF hasil investigasi");
    }
  };

  // Enhanced document download handler with better error handling
  const handleDownloadEvidenceFile = async (document: any) => {
    try {
      // Handle legacy files differently
      if (document.isLegacy || (document.id && document.id.startsWith('legacy-'))) {
        // For legacy files, get the original file data
        const legacyFile = document.originalFile || document;
        
        if (!legacyFile) {
          alert("File legacy tidak ditemukan dalam data hasil investigasi");
          return;
        }
        
        // For legacy files, try different approaches
        if (legacyFile.path && legacyFile.path.startsWith('http')) {
          // External URL - open directly
          window.open(legacyFile.path, '_blank');
        } else if (legacyFile.path) {
          // Try multiple download approaches for legacy files
          try {
            const baseUrl = window.location.origin;
            const pathParts = legacyFile.path.split('/');
            const fileName = pathParts[pathParts.length - 1];
            
            // Approach 1: Try direct file access in uploads directory
            const directUrl = `${baseUrl}/uploads/${legacyFile.path.replace(/^\/+/, '')}`;
            let response = await fetch(directUrl);
            
            if (!response.ok) {
              // Approach 2: Try with just the filename
              const filenameUrl = `${baseUrl}/uploads/evidence/${fileName}`;
              response = await fetch(filenameUrl);
              
              if (!response.ok) {
                // Approach 3: Try legacy upload API endpoint
                const uploadApiUrl = `/api/upload/${encodeURIComponent(fileName)}`;
                response = await fetch(uploadApiUrl);
                
                if (!response.ok) {
                  console.warn('All download attempts failed for legacy file:', legacyFile.path);
                  alert(`File "${legacyFile.name || fileName}" tidak ditemukan di server. File mungkin telah dihapus atau dipindahkan.`);
                  return;
                }
              }
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = legacyFile.name || fileName || 'evidence-file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          } catch (fetchError) {
            console.error('Legacy file fetch failed:', fetchError);
            alert(`Gagal mengunduh file legacy: ${legacyFile.name || 'Unknown file'}. Silakan hubungi administrator.`);
          }
        } else {
          alert("Path file legacy tidak valid");
        }
        return;
      }
      
      // Handle new format documents (from InvestigationDocument table)
      if (document.id && document.fileName && !document.id.startsWith('legacy-')) {
        const downloadUrl = `/api/documents/${document.id}/download`;
        const fileName = document.fileName;
        
        try {
          const response = await fetch(downloadUrl);
          
          if (!response.ok) {
            if (response.status === 404) {
              alert(`File "${fileName}" tidak ditemukan di database. File mungkin telah dihapus.`);
            } else {
              alert(`Gagal mengunduh file "${fileName}". Status: ${response.status}. Silakan hubungi administrator.`);
            }
            return;
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (fetchError) {
          console.error('Document download failed:', fetchError);
          alert(`Gagal mengunduh file "${fileName}". Silakan coba lagi atau hubungi administrator.`);
        }
      } else {
        alert("Format file tidak valid untuk diunduh");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Terjadi kesalahan saat mengunduh file. Silakan coba lagi.");
    }
  };

  const isImageFile = (fileName: string, fileType: string) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(fileType.toLowerCase()) || 
           /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
  };

  const isAudioFile = (fileName: string, fileType: string) => {
    const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/webm'];
    return audioTypes.includes(fileType.toLowerCase()) || 
           /\.(mp3|wav|ogg|m4a|webm|flac|aac)$/i.test(fileName);
  };

  const getFileUrl = (document: any) => {
    try {
      // Check if this is a legacy evidence file or a new investigation document
      if (document.id && document.fileName) {
        // New format: investigation document with ID
        if (document.storagePath && document.storagePath.startsWith('http')) {
          return document.storagePath;
        } else {
          return `/api/documents/${document.id}/download`;
        }
      } else if (document.path) {
        // Legacy format: evidence file with path
        if (document.path.startsWith('http')) {
          return document.path;
        } else {
          // For legacy files, try to construct a direct URL
          const baseUrl = window.location.origin;
          const cleanPath = document.path.replace(/^\/+/, '');
          return `${baseUrl}/uploads/${cleanPath}`;
        }
      }
      
      // Fallback - return a data URL or placeholder for broken images
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEyQzIxIDE1LjMxIDE4LjMxIDE4IDE1IDE4SDE1LjVDMTMuMTkgMTggMTEgMTUuMzEgMTEgMTJDMTEgOC42OSAxMy4xOSA2IDE1IDZIMTVDMTYuODEgNiAxOSA4LjY5IDE5IDEySDE5VjEzSDE5LjVDMjAuMzkgMTMgMjIgMTEuMzkgMjIgOUwyMC41IDdMMjEgOUMyMSAxMS4zOSAyMC4zOSAxMyAxOS41IDEzSDE5VjEyWiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K';
    } catch (error) {
      console.error('Error getting file URL:', error);
      return '#';
    }
  };

  const toggleAudioPlayback = (fileId: string) => {
    if (playingAudio === fileId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(fileId);
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

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || "Hasil Investigasi Tidak Ditemukan"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hasil investigasi dengan ID yang Anda cari tidak ditemukan.
          </p>
          <Button asChild>
            <Link href={`/satgas/dashboard/investigasi/${id}/rekapan`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Rekapan
            </Link>
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Form Pelaksanaan Investigasi' : 'Detail Berita Acara Investigasi'}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{report?.reportNumber}</span>
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                  {isEditMode ? 'Sesi Investigasi Aktif' : 'Hasil Investigasi'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  disabled={isSubmitting}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat Rekapan
                </Button>
                <Button
                  onClick={handleDownloadResultPdf}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Unduh PDF
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(true)}
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Edit Hasil
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadResultPdf}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Unduh PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Information Schedule Reference */}
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
                  Detail hasil wawancara dan temuan selama investigasi
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
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                      isDragOver ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    {isDragOver ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Lepaskan file di sini
                        </p>
                        <p className="text-xs text-blue-500 dark:text-blue-300">
                          File akan diupload secara otomatis
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                    )}
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
                    label="Tanda Tangan Digital Anggota Satuan Tugas (Pembuat BA)"
                    value={creatorDigitalSignature}
                    onChange={(signatureData, signerName) => {
                      setCreatorDigitalSignature(signatureData);
                      setCreatorSignerName(signerName);
                    }}
                    signerName={creatorSignerName}
                    onSignerNameChange={setCreatorSignerName}
                    required
                    signerNameLabel="Nama Anggota Satuan Tugas (Pembuat BA)"
                    placeholder="Tanda tangan di sini..."
                  />
                  <DigitalSignature
                    label="Tanda Tangan Digital Ketua Satuan Tugas (Persetujuan Akhir)"
                    value={chairpersonDigitalSignature}
                    onChange={(signatureData, signerName) => {
                      setChairpersonDigitalSignature(signatureData);
                      setChairpersonSignerName(signerName);
                    }}
                    signerName={chairpersonSignerName}
                    onSignerNameChange={setChairpersonSignerName}
                    signerNameLabel="Nama Ketua Satuan Tugas"
                    placeholder="Tanda tangan di sini..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internal-notes">Catatan Internal Satuan Tugas</Label>
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
              <Button type="button" variant="outline" onClick={() => setIsEditMode(false)} disabled={isSubmitting}>
                Batal
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
        ) : (
          <div className="space-y-6">
            {/* Status Badge */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Status Kasus
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status terbaru setelah hasil investigasi ini
                    </p>
                  </div>
                  <Badge
                    className={
                      result.caseStatusAfterResult === 'READY_FOR_RECOMMENDATION'
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : result.caseStatusAfterResult === 'UNDER_INVESTIGATION'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : result.caseStatusAfterResult === 'FORWARDED_TO_REKTORAT'
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : result.caseStatusAfterResult === 'CLOSED_TERMINATED'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }
                  >
                    {result.caseStatusAfterResult === 'READY_FOR_RECOMMENDATION'
                      ? 'Siap untuk Rekomendasi'
                      : result.caseStatusAfterResult === 'UNDER_INVESTIGATION'
                      ? 'Sedang Dalam Investigasi'
                      : result.caseStatusAfterResult === 'FORWARDED_TO_REKTORAT'
                      ? 'Dikirim ke Rektorat'
                      : result.caseStatusAfterResult === 'CLOSED_TERMINATED'
                      ? 'Kasus Ditutup'
                      : result.caseStatusAfterResult}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Informasi Jadwal Referensi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informasi Jadwal Referensi
                </CardTitle>
                <CardDescription>
                  Data ini diambil dari jadwal investigasi yang telah direncanakan sebelumnya (dapat diubah jika pelaksanaan berbeda)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Judul Kegiatan
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {result.schedulingTitle || 'Sesi Investigasi'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white">
                        {result.schedulingLocation || result.location || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nomor Laporan
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {result.reportNumber || report?.reportNumber || '-'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Judul Kasus
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {result.caseTitle || report?.caseTitle || '-'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tanggal Pembuatan BA
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {formatDateTime(result.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metode Investigasi */}
                {result.methods && Array.isArray(result.methods) && result.methods.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      Metode Investigasi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.methods.map((method: string, idx: number) => {
                        const methodLabels: { [key: string]: string } = {
                          'INTERVIEW': 'Wawancara',
                          'WRITTEN_CLARIFICATION': 'Klarifikasi Tertulis',
                          'LOCATION_OBSERVATION': 'Observasi Lokasi',
                          'DIGITAL_EVIDENCE_COLLECTION': 'Pengumpulan Bukti Digital',
                          'MEDIATION': 'Mediasi',
                          'OTHER': 'Lainnya'
                        };
                        return (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {methodLabels[method] || method}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pihak yang Terlibat */}
                {result.partiesInvolved && Array.isArray(result.partiesInvolved) && result.partiesInvolved.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      Pihak yang Terlibat
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.partiesInvolved.map((party: string, idx: number) => {
                        const partyLabels: { [key: string]: string } = {
                          'VICTIM_SURVIVOR': 'Korban/Penyintas',
                          'REPORTED_PERSON': 'Terlapor',
                          'WITNESS': 'Saksi',
                          'OTHER_PARTY': ' Pihak Lain'
                        };
                        return (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {partyLabels[party] || party}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Additional Form Fields */}
                {result.otherPartiesDetails && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Detail Pihak Lain
                    </h4>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {result.otherPartiesDetails}
                    </p>
                  </div>
                )}

                {result.riskNotes && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catatan Risiko
                    </h4>
                    <p className="text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 whitespace-pre-wrap">
                      {result.riskNotes}
                    </p>
                  </div>
                )}

                {result.planSummary && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ringkasan Rencana Investigasi
                    </h4>
                    <p className="text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 whitespace-pre-wrap">
                      {result.planSummary}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Kehadiran */}
            {(result.satgasMembersPresent || result.partiesPresent) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Data Kehadiran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {result.satgasMembersPresent && Array.isArray(result.satgasMembersPresent) && result.satgasMembersPresent.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Anggota Satuan Tugas yang Hadir ({result.satgasMembersPresent.length} orang)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.satgasMembersPresent.map((member: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {member.name || 'Anggota'}
                            </div>
                            {member.role && (
                              <div className="text-gray-600 dark:text-gray-400 text-sm">
                                {member.role}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.partiesPresent && Array.isArray(result.partiesPresent) && result.partiesPresent.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Status Kehadiran Pihak ({result.partiesPresent.length} pihak)
                      </h4>
                      <div className="space-y-2">
                        {result.partiesPresent.map((party: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {party.name || 'Pihak'}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 text-sm">
                                {party.role}
                              </div>
                            </div>
                            <Badge
                              variant={
                                party.status === 'PRESENT' ? 'default' :
                                party.status === 'ABSENT_WITH_REASON' ? 'secondary' : 'destructive'
                              }
                            >
                              {party.status === 'PRESENT' ? 'Hadir' :
                               party.status === 'ABSENT_WITH_REASON' ? 'Tidak Hadir (Ada Alasan)' : 'Tidak Hadir'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.attendanceNotes && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Catatan Kehadiran
                      </h4>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        {result.attendanceNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Verifikasi Identitas:
                    </span>
                    <Badge variant={result.identityVerified ? 'default' : 'secondary'}>
                      {result.identityVerified ? 'Sudah Diverifikasi' : 'Belum Diverifikasi'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Catatan Inti Investigasi */}
            <Card>
              <CardHeader>
                <CardTitle>Catatan Inti Investigasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {result.partiesStatementSummary && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ringkasan Keterangan Pihak
                    </h4>
                    <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {result.partiesStatementSummary}
                    </div>
                  </div>
                )}

                {result.newPhysicalEvidence && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Temuan Bukti Fisik/Digital Baru
                    </h4>
                    <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {result.newPhysicalEvidence}
                    </div>
                  </div>
                )}

                {result.statementConsistency && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Konsistensi Keterangan
                    </h4>
                    <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {result.statementConsistency}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kesimpulan & Rekomendasi */}
            <Card>
              <CardHeader>
                <CardTitle>Kesimpulan & Rekomendasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {result.sessionInterimConclusion && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kesimpulan Sementara dari Sesi Ini
                    </h4>
                    <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {result.sessionInterimConclusion}
                    </div>
                  </div>
                )}

                {result.recommendedImmediateActions && Array.isArray(result.recommendedImmediateActions) && result.recommendedImmediateActions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Rekomendasi Tindak Lanjut Segera ({result.recommendedImmediateActions.length} rekomendasi)
                    </h4>
                    <div className="space-y-3">
                      {result.recommendedImmediateActions.map((action: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {action.action || 'Tindakan'}
                            </h5>
                            <Badge variant={
                              action.priority === 'HIGH' ? 'destructive' :
                              action.priority === 'MEDIUM' ? 'default' : 'secondary'
                            }>
                              {action.priority === 'HIGH' ? 'Prioritas Tinggi' :
                               action.priority === 'MEDIUM' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                            </Badge>
                          </div>
                          {action.notes && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              <strong>Catatan:</strong> {action.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.statusChangeReason && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Alasan Perubahan Status
                    </h4>
                    <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {result.statusChangeReason}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bukti yang Diupload - NEW IMPLEMENTATION */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Bukti yang Diupload
                </CardTitle>
                <CardDescription>
                  {evidenceDocuments.length > 0
                    ? `${evidenceDocuments.length} file bukti yang dilampirkan`
                    : 'Bukti yang diupload pada fase hasil investigasi'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evidenceDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evidenceDocuments.map((document: any) => (
                      <div key={document.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="space-y-3">
                          {/* File info */}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {document.fileName}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                              {(document.fileSize / 1024).toFixed(1)} KB • {document.fileType}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className="text-gray-500 dark:text-gray-400">
                                {document.isLegacy ? 'File Legacy' : `Diupload oleh: ${document.uploadedBy?.name || 'Unknown'}`}
                              </div>
                              {document.isLegacy && (
                                <Badge variant="outline" className="text-xs">
                                  Legacy
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* File preview/content */}
                          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                            {isImageFile(document.fileName, document.fileType) ? (
                              // Image preview
                              <div className="relative">
                                <img
                                  src={getFileUrl(document)}
                                  alt={document.fileName}
                                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(getFileUrl(document), '_blank')}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<div class="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 text-gray-500">
                                        <div class="text-center">
                                          <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                                          </svg>
                                          <p class="text-sm">Gagal memuat gambar</p>
                                          <p class="text-xs mt-1">${document.fileName || 'File tidak ditemukan'}</p>
                                        </div>
                                      </div>`;
                                    }
                                  }}
                                />
                                <div className="absolute top-2 right-2">
                                  {!document.isLegacy ? (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleDownloadEvidenceFile(document)}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      Legacy
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ) : isAudioFile(document.fileName, document.fileType) ? (
                              // Audio player
                              <div className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleAudioPlayback(document.id)}
                                  >
                                    {playingAudio === document.id ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Volume2 className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Voice Note
                                  </span>
                                </div>
                                {playingAudio === document.id && (
                                  <audio
                                    controls
                                    className="w-full"
                                    autoPlay
                                    onEnded={() => setPlayingAudio(null)}
                                  >
                                    <source src={getFileUrl(document)} type={document.fileType} />
                                    Browser Anda tidak mendukung audio player.
                                  </audio>
                                )}
                                <div className="flex justify-between items-center mt-3">
                                  <span className="text-xs text-gray-500">Klik play untuk mendengar</span>
                                  {!document.isLegacy ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDownloadEvidenceFile(document)}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      Legacy
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ) : (
                              // Other file types
                              <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <File className="w-8 h-8 text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    File dokumen
                                  </span>
                                </div>
                                {!document.isLegacy ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadEvidenceFile(document)}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Unduh
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Legacy
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Image className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Belum ada bukti yang diupload pada fase hasil investigasi
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Bukti dapat diupload melalui form hasil investigasi
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tanda Tangan Digital */}
            <Card>
              <CardHeader>
                <CardTitle>Tanda Tangan Digital</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      Pembuat Berita Acara
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-3 h-3 rounded-full ${
                          result.creatorDigitalSignature ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {result.creatorDigitalSignature ? 'Tertandatangani' : 'Belum ditandatangani'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        Nama: {result.creatorSignerName || '-'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Tanggal: {formatDateTime(result.creatorSignatureDate)}
                      </p>
                      {/* Display actual signature image */}
                      {result.creatorDigitalSignature && (
                        <div className="mt-3">
                          <img 
                            src={result.creatorDigitalSignature} 
                            alt="Tanda Tangan Pembuat"
                            className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
                            style={{ maxHeight: '150px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      Ketua Satuan Tugas
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-3 h-3 rounded-full ${
                          result.chairpersonDigitalSignature ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {result.chairpersonDigitalSignature ? 'Tertandatangani' : 'Belum ditandatangani'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        Nama: {result.chairpersonSignerName || '-'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Tanggal: {formatDateTime(result.chairpersonSignatureDate)}
                      </p>
                      {/* Display actual signature image */}
                      {result.chairpersonDigitalSignature && (
                        <div className="mt-3">
                          <img 
                            src={result.chairpersonDigitalSignature} 
                            alt="Tanda Tangan Ketua"
                            className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
                            style={{ maxHeight: '150px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Catatan Internal */}
            {result.internalSatgasNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>Catatan Internal Satuan Tugas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600 whitespace-pre-wrap">
                    {result.internalSatgasNotes}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" asChild>
                <Link href={`/satgas/dashboard/investigasi/${id}/rekapan`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Rekapan
                </Link>
              </Button>
              <Button onClick={handleDownloadResultPdf}>
                <Download className="w-4 h-4 mr-2" />
                Unduh PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}