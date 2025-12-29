"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Heart,
  Users,
  Phone,
  BookOpen,
  Eye,
  MessageSquare,
  Search,
  Filter,
  Download,
  BarChart3,
  TrendingUp,
  User,
} from "lucide-react";
import { RoleGuard } from "../../../../components/auth/role-guard";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'psikolog' | 'konseling' | 'pendampingan' | 'dukungan' | 'konsultasi' | 'lainnya';
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
  createdAt: string;
  updatedAt: string;
  response?: string;
  respondedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  respondedBy?: string;
  report?: {
    id: string;
    reportNumber: string;
    title: string;
    status: string;
  };
}

export default function RectorRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/satgas/recommendations');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Recommendation['status']) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'pending',
      'SUBMITTED': 'responded',
      'APPROVED': 'in_progress', 
      'IMPLEMENTED': 'completed',
      'REJECTED': 'rejected'
    };
    
    const displayStatus = statusMap[status.toUpperCase()] || status.toLowerCase();
    
    switch (displayStatus) {
      case 'pending':
        return <Badge variant="secondary">Menunggu Respons</Badge>;
      case 'responded':
        return <Badge variant="default">Ada Respons</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500 text-white">Sedang Diproses</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white">Selesai</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || rec.type === filterType;
    const matchesStatus = filterStatus === "all" || rec.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      'Tanggal',
      'User',
      'Email',
      'Judul',
      'Jenis',
      'Status',
      'Deskripsi',
      'Detail',
      'Respons',
      'Responded By',
      'Report Number'
    ];
    
    const csvData = filteredRecommendations.map(rec => [
      formatDate(rec.createdAt),
      rec.user.name,
      rec.user.email,
      rec.title,
      rec.type,
      rec.status,
      rec.description,
      rec.content,
      rec.response || '',
      rec.respondedBy || '',
      rec.report?.reportNumber || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rekomendasi-laporan-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statistics = {
    total: recommendations.length,
    pending: recommendations.filter(r => r.status === 'PENDING').length,
    responded: recommendations.filter(r => r.status !== 'PENDING').length,
    completed: recommendations.filter(r => r.status === 'IMPLEMENTED' || r.status === 'APPROVED').length,
    rejected: recommendations.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Rekomendasi Keseluruhan</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor semua rekomendasi dari user ke SATGAS PPKS</p>
          </div>
          <Button onClick={exportToCSV} className="mt-4 md:mt-0">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Rekomendasi</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-4">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.pending}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Menunggu Respons</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.completed}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Diproses/Selesai</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.responded}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sudah Direspon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter dan Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Cari judul, deskripsi, atau user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="psikolog">Pendampingan Psikolog</SelectItem>
                  <SelectItem value="konseling">Konseling</SelectItem>
                  <SelectItem value="pendampingan">Pendampingan</SelectItem>
                  <SelectItem value="dukungan">Dukungan</SelectItem>
                  <SelectItem value="konsultasi">Konsultasi</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu Respons</SelectItem>
                  <SelectItem value="SUBMITTED">Ada Respons</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="IMPLEMENTED">Selesai</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterStatus("all");
                }}
              >
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat rekomendasi...</p>
            </div>
          ) : filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                      </div>
                      <CardDescription className="mb-3">
                        {rec.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getStatusBadge(rec.status)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4" />
                          <span><strong>User:</strong> {rec.user.name} ({rec.user.email})</span>
                        </div>
                        {rec.respondedBy && (
                          <p><strong>Direspon oleh:</strong> {rec.respondedBy}</p>
                        )}
                        {rec.report && (
                          <p className="text-blue-600 dark:text-blue-400">
                            <strong>Terhadap Laporan:</strong> {rec.report.reportNumber} - {rec.report.title} ({rec.report.status})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(rec.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Detail Permintaan:</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                        {rec.content}
                      </pre>
                    </div>
                  </div>
                  
                  {rec.response && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Respons SATGAS:</h4>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <pre className="whitespace-pre-wrap text-sm text-blue-800 dark:text-blue-200">
                          {rec.response}
                        </pre>
                        {rec.respondedAt && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            Respons pada: {formatDate(rec.respondedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setSelectedRecommendation(rec)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detail Lengkap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Tidak ada rekomendasi yang ditemukan</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {searchTerm || filterType !== "all" || filterStatus !== "all" 
                    ? "Coba ubah filter atau kata kunci pencarian" 
                    : "Belum ada rekomendasi yang dikirim"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {filteredRecommendations.length > 0 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {filteredRecommendations.length} dari {recommendations.length} rekomendasi
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}