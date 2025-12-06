"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  MapPin,
  User,
  Shield,
  ArrowRight,
  Activity,
  Send
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import ComprehensiveScheduleInvestigationModal from "@/components/comprehensive-schedule-investigation-modal";
import { DateRange } from "react-day-picker";

interface ScheduledInvestigation {
  id: string;
  reportId: string;
  reportTitle: string;
  reportNumber: string;
  status: string;
  scheduledDateTime: string;
  endDateTime: string;
  location: string;
  methods: string[];
  partiesInvolved: string[];
  teamMembers: any[];
  consentObtained: boolean;
  riskNotes: string;
  planSummary: string;
  followUpAction: string;
  followUpDate: string;
  accessLevel: string;
  createdBy: string;
  createdAt: string;
  // Additional fields for comprehensive modal
  category?: string;
  severity?: string;
}

interface Report {
  id: string;
  reportNumber: string;
  title: string;
  description: string;
  status: string;
}

export default function PenjadwalanPage() {
  const [investigations, setInvestigations] = useState<ScheduledInvestigation[]>([]);
  const [filteredInvestigations, setFilteredInvestigations] = useState<ScheduledInvestigation[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // Form state for creating new schedule
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    endDate: "",
    endTime: "",
    location: "",
    methods: [] as string[],
    partiesInvolved: "",
    teamMembers: "",
    riskNotes: "",
    planSummary: "",
    accessLevel: "CORE_TEAM_ONLY"
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });

  // Fetch data
  useEffect(() => {
    fetchData();
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId) return;

    setSubmitting(true);
    try {
      const scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
      const endDateTime = `${formData.endDate}T${formData.endTime}:00`;

      const response = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReportId,
          startDateTime: scheduledDateTime,
          endDateTime,
          location: formData.location,
          methods: formData.methods,
          partiesInvolved: formData.partiesInvolved.split(',').map(p => p.trim()).filter(p => p),
          teamMembers: formData.teamMembers.split(',').map(t => t.trim()).filter(t => t).map((member, index) => ({
            userId: `temp-${index}`, // Temporary ID since we're not using real user IDs
            role: 'INVESTIGATOR',
            customRole: member
          })),
          riskNotes: formData.riskNotes,
          planSummary: formData.planSummary,
          accessLevel: formData.accessLevel,
        })
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          scheduledDate: "",
          scheduledTime: "",
          endDate: "",
          endTime: "",
          location: "",
          methods: [],
          partiesInvolved: "",
          teamMembers: "",
          riskNotes: "",
          planSummary: "",
          accessLevel: "CORE_TEAM_ONLY"
        });
        setSelectedReportId("");
        fetchData();
        alert('Jadwal investigasi berhasil dibuat');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal membuat jadwal investigasi');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal membuat jadwal investigasi');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (selectedDateRange?.from) {
        params.append('dateFrom', selectedDateRange.from.toISOString().split('T')[0]);
      }
      if (selectedDateRange?.to) {
        params.append('dateTo', selectedDateRange.to.toISOString().split('T')[0]);
      }
      params.append('page', '1');
      params.append('limit', '50');

      // Fetch scheduled investigations from the dedicated API
      const response = await fetch(`/api/satgas/penjadwalan?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setInvestigations(data.data.investigations || []);
        setFilteredInvestigations(data.data.investigations || []);
        setStats(data.data.stats || {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0
        });
      } else {
        const errorMessage = data.message || 'Unknown error occurred';
        console.error('Error fetching penjadwalan data:', errorMessage);
        
        // Handle different types of errors more gracefully
        if (errorMessage?.includes('Unauthorized') || response.status === 401) {
          // Authentication error - this is expected if user is not logged in
          console.log('Authentication required to access penjadwalan data');
          alert('Anda harus login untuk mengakses halaman ini.');
        } else if (errorMessage?.includes('connection') || errorMessage?.includes('database')) {
          // Database connection error
          console.error('Database connection issue - please check database configuration');
          alert('Koneksi database bermasalah. Silakan hubungi administrator sistem.');
        } else if (data.error && process.env.NODE_ENV === 'development') {
          // Show detailed error in development
          console.error('Detailed error:', data.error);
          alert(`Terjadi kesalahan: ${errorMessage}\n\nDetail: ${data.error.message || data.error}`);
        } else {
          // General error
          console.error('General error fetching penjadwalan data:', errorMessage);
          alert(`Gagal memuat data penjadwalan: ${errorMessage}`);
        }
        
        setInvestigations([]);
        setFilteredInvestigations([]);
        setStats({
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0
        });
      }

    } catch (error) {
      console.error('Network or parsing error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        alert(`Terjadi kesalahan saat mengambil data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setInvestigations([]);
      setFilteredInvestigations([]);
      setStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = investigations;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(investigation => 
        investigation.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investigation.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investigation.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(investigation => 
        investigation.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply date filter
    if (selectedDateRange?.from && selectedDateRange?.to) {
      const fromDate = selectedDateRange.from;
      const toDate = selectedDateRange.to;
      toDate.setHours(23, 59, 59, 999);
      
      result = result.filter(investigation => {
        const investigationDate = new Date(investigation.scheduledDateTime);
        return investigationDate >= fromDate && investigationDate <= toDate;
      });
    }

    setFilteredInvestigations(result);
  }, [searchTerm, statusFilter, selectedDateRange, investigations]);

  const handleScheduleInvestigation = async (scheduleData: any) => {
    try {
      const response = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          ...scheduleData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh data
        await fetchData();
        setShowScheduleModal(false);
        setSelectedReport(null);
      } else {
        console.error('Error scheduling investigation:', result.message);
      }
    } catch (error) {
      console.error('Error scheduling investigation:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Badge variant="secondary">Terjadwal</Badge>;
      case 'in_progress':
        return <Badge variant="default">Sedang Berlangsung</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Selesai</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getWorkflowStage = (status: string) => {
    const stages = [
      { name: 'Data Collection', status: ['SCHEDULED'] },
      { name: 'Investigation', status: ['IN_PROGRESS'] },
      { name: 'Analysis', status: ['IN_PROGRESS'] },
      { name: 'Documentation', status: ['IN_PROGRESS'] },
      { name: 'Completion', status: ['COMPLETED'] }
    ];
    
    return stages.find(stage => stage.status.includes(status.toUpperCase()))?.name || 'Planning';
  };

  if (isLoading) {
    return (
      <RoleGuard>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 h-20"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 h-20"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 h-20"></div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Penjadwalan Investigasi</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola jadwal investigasi dari pengumpulan data hingga penyelesaian</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? 'Batal' : 'Buat Jadwal'}
          </Button>
        </div>

        {/* Create Schedule Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Buat Jadwal Investigasi Baru</CardTitle>
              <CardDescription>
                Jadwalkan investigasi untuk laporan yang telah diterima
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pilih Laporan
                  </label>
                  <Select value={selectedReportId} onValueChange={setSelectedReportId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih laporan untuk dijadwalkan" />
                    </SelectTrigger>
                    <SelectContent>
                      {reports.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.reportNumber} - {report.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tanggal Mulai
                    </label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Waktu Mulai
                    </label>
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tanggal Selesai
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Waktu Selesai
                    </label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lokasi Investigasi
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Contoh: Ruang Rapat Gedung A Lt. 3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Metode Investigasi
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Wawancara', 'Pengumpulan Dokumen', 'Observasi', 'Analisis Data', 'Mediasi'].map((method) => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.methods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, methods: [...formData.methods, method]});
                            } else {
                              setFormData({...formData, methods: formData.methods.filter(m => m !== method)});
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pihak yang Terlibat
                  </label>
                  <Textarea
                    value={formData.partiesInvolved}
                    onChange={(e) => setFormData({...formData, partiesInvolved: e.target.value})}
                    placeholder="Pisahkan dengan koma. Contoh: Pelapor, Terlapor, Saksi 1, Saksi 2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tim Investigasi
                  </label>
                  <Textarea
                    value={formData.teamMembers}
                    onChange={(e) => setFormData({...formData, teamMembers: e.target.value})}
                    placeholder="Pisahkan dengan koma. Contoh: Dr. Ahmad, Ibu Siti, Pak Budi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catatan Risiko
                  </label>
                  <Textarea
                    value={formData.riskNotes}
                    onChange={(e) => setFormData({...formData, riskNotes: e.target.value})}
                    placeholder="Jelaskan potensi risiko dan mitigasinya"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ringkasan Rencana
                  </label>
                  <Textarea
                    value={formData.planSummary}
                    onChange={(e) => setFormData({...formData, planSummary: e.target.value})}
                    placeholder="Jelaskan rencana investigasi secara singkat"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Level Akses
                  </label>
                  <Select value={formData.accessLevel} onValueChange={(value) => setFormData({...formData, accessLevel: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORE_TEAM_ONLY">Tim Inti Saja</SelectItem>
                      <SelectItem value="FULL_SATGAS">Satgas Penuh</SelectItem>
                      <SelectItem value="LEADERSHIP_ONLY">Pimpinan Tertentu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={submitting || !selectedReportId}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Menyimpan...' : 'Buat Jadwal Investigasi'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-medium">Total Jadwal</CardDescription>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-medium">Menunggu</CardDescription>
              <Clock className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-medium">Sedang Berlangsung</CardDescription>
              <Activity className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-medium">Selesai</CardDescription>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-medium">Dibatalkan</CardDescription>
              <XCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari berdasarkan judul laporan, nomor, atau lokasi..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="scheduled">Terjadwal</option>
                  <option value="in_progress">Berlangsung</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
                
                {/* Date Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDateRange?.from ? (
                        selectedDateRange.to ? (
                          <>
                            {format(selectedDateRange.from, "dd MMM yyyy", { locale: id })} -{" "}
                            {format(selectedDateRange.to, "dd MMM yyyy", { locale: id })}
                          </>
                        ) : (
                          format(selectedDateRange.from, "dd MMM yyyy", { locale: id })
                        )
                      ) : (
                        <span>Pilih rentang tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={selectedDateRange?.from}
                      selected={selectedDateRange}
                      onSelect={setSelectedDateRange}
                      numberOfMonths={2}
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setSelectedDateRange(undefined);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investigation List */}
        <div className="space-y-4">
          {filteredInvestigations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Tidak ada jadwal investigasi</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {investigations.length === 0 
                    ? "Belum ada jadwal investigasi yang dibuat." 
                    : "Tidak ada jadwal yang sesuai dengan filter pencarian Anda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInvestigations.map((investigation) => (
              <Card 
                key={investigation.id} 
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${
                        investigation.status === 'SCHEDULED' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : investigation.status === 'IN_PROGRESS'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                          : investigation.status === 'COMPLETED'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {getStatusIcon(investigation.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {investigation.reportTitle}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {investigation.reportNumber}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{investigation.location}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(investigation.scheduledDateTime), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(investigation.status)}
                          </div>
                        </div>

                        {/* Workflow Progress */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tahap Saat Ini:</span>
                            <Badge variant="outline" className="text-xs">
                              {getWorkflowStage(investigation.status)}
                            </Badge>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="flex items-center gap-2">
                            {['Data Collection', 'Investigation', 'Analysis', 'Documentation', 'Completion'].map((stage, index) => {
                              const stages = ['SCHEDULED', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'COMPLETED'];
                              const isActive = stages[index] === investigation.status || 
                                (stages.indexOf(investigation.status) > index);
                              const isCurrent = stages[index] === investigation.status;
                              
                              return (
                                <div key={stage} className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full ${
                                    isCurrent 
                                      ? 'bg-blue-500' 
                                      : isActive 
                                      ? 'bg-green-500' 
                                      : 'bg-gray-300 dark:bg-gray-600'
                                  }`} />
                                  {index < 4 && (
                                    <div className={`w-8 h-0.5 ${
                                      isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Tim:</span>
                            <p className="font-medium">
                              {investigation.teamMembers?.length > 0 
                                ? `${investigation.teamMembers.length} anggota`
                                : 'Belum ditentukan'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Metode:</span>
                            <p className="font-medium">
                              {investigation.methods?.length > 0 
                                ? `${investigation.methods.length} metode`
                                : 'Belum dipilih'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Akses:</span>
                            <p className="font-medium">
                              {investigation.accessLevel === 'CORE_TEAM_ONLY' ? 'Tim Inti' :
                               investigation.accessLevel === 'FULL_SATGAS' ? 'Satgas Penuh' :
                               investigation.accessLevel === 'LEADERSHIP_ONLY' ? 'Pimpinan Tertentu' : 'Lainnya'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 lg:flex-col">
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <Link href={`/satgas/dashboard/investigasi/${investigation.reportId}`} className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          Detail
                        </Link>
                      </Button>
                      
                      {investigation.status === 'SCHEDULED' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedReport({
                              id: investigation.reportId,
                              title: investigation.reportTitle,
                              reportNumber: investigation.reportNumber,
                              category: investigation.category,
                              severity: investigation.severity,
                              status: investigation.status
                            });
                            setShowScheduleModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Schedule Investigation Modal */}
        {showScheduleModal && (
          <ComprehensiveScheduleInvestigationModal
            isOpen={showScheduleModal}
            onClose={() => {
              setShowScheduleModal(false);
              setSelectedReport(null);
            }}
            onSchedule={handleScheduleInvestigation}
            reportId={selectedReport?.id || ""}
            reportTitle={selectedReport?.title || ""}
            reportNumber={selectedReport?.reportNumber}
            reportCategory={selectedReport?.category}
            reportSeverity={selectedReport?.severity}
            reportStatus={selectedReport?.status}
          />
        )}
      </div>
    </RoleGuard>
  );
}
