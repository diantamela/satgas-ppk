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
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { useSession } from "@/lib/auth/auth-client";

interface UserRecommendation {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'psikolog' | 'konseling' | 'pendampingan' | 'dukungan' | 'konsultasi' | 'lainnya';
  status: 'pending' | 'responded' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  response?: string;
  respondedAt?: string;
  report?: {
    id: string;
    reportNumber: string;
    title: string;
    status: string;
  };
}

export default function UserRekomendasiPage() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    type: "psikolog" as UserRecommendation['type'],
    reportId: null as string | null
  });
  const [userReports, setUserReports] = useState<any[]>([]);

  useEffect(() => {
    fetchUserRecommendations();
    fetchUserAcceptedReports();
  }, []);

  const fetchUserRecommendations = async () => {
    try {
      const response = await fetch('/api/user/recommendations');
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

  const fetchUserAcceptedReports = async () => {
    try {
      // Get user's accepted reports (not rejected)
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        // Filter reports that belong to current user and are not rejected
        const acceptedReports = data.reports?.filter((report: any) => 
          report.reporterId === session?.user?.id && 
          report.status !== 'REJECTED'
        ) || [];
        setUserReports(acceptedReports);
      }
    } catch (error) {
      console.error('Error fetching user reports:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/user/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: session.user.id,
        })
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          title: "",
          description: "",
          content: "",
          type: "psikolog",
          reportId: null
        });
        fetchUserRecommendations();
        alert('Rekomendasi berhasil dikirim ke SATGAS');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengirim rekomendasi');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal mengirim rekomendasi');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: UserRecommendation['status']) => {
    switch (status) {
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

  const getTypeBadge = (type: UserRecommendation['type']) => {
    switch (type) {
      case 'psikolog':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Pendampingan Psikolog</Badge>;
      case 'konseling':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Konseling</Badge>;
      case 'pendampingan':
        return <Badge variant="outline" className="text-green-600 border-green-600">Pendampingan</Badge>;
      case 'dukungan':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Dukungan</Badge>;
      case 'konsultasi':
        return <Badge variant="outline" className="text-indigo-600 border-indigo-600">Konsultasi</Badge>;
      case 'lainnya':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Lainnya</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: UserRecommendation['type']) => {
    switch (type) {
      case 'psikolog':
        return <Heart className="w-4 h-4 text-purple-600" />;
      case 'konseling':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'pendampingan':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'dukungan':
        return <Heart className="w-4 h-4 text-orange-600" />;
      case 'konsultasi':
        return <Phone className="w-4 h-4 text-indigo-600" />;
      case 'lainnya':
        return <BookOpen className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4" />;
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

  return (
    <RoleGuard requiredRoles={['USER']}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Rekomendasi ke SATGAS</h1>
            <p className="text-gray-600 dark:text-gray-400">Ajukan rekomendasi untuk mendapatkan pendampingan dari SATGAS PPKS</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="mt-4 md:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? 'Batal' : 'Buat Rekomendasi'}
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Buat Rekomendasi Baru</CardTitle>
              <CardDescription>
                Ajukan rekomendasi untuk mendapatkan pendampingan atau layanan dari SATGAS PPKS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pilih Laporan (Opsional)
                  </label>
                  <Select value={formData.reportId || undefined} onValueChange={(value) => setFormData({...formData, reportId: value || null})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih laporan yang sudah diterima (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {userReports.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.reportNumber} - {report.title} ({report.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Pilih salah satu laporan yang sudah diterima (opsional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jenis Rekomendasi
                  </label>
                  <Select value={formData.type} onValueChange={(value: UserRecommendation['type']) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="psikolog">Pendampingan Psikolog</SelectItem>
                      <SelectItem value="konseling">Konseling</SelectItem>
                      <SelectItem value="pendampingan">Pendampingan Umum</SelectItem>
                      <SelectItem value="dukungan">Dukungan Emosional</SelectItem>
                      <SelectItem value="konsultasi">Konsultasi</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Judul Rekomendasi
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Contoh: Permohonan Pendampingan Psikolog"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deskripsi Singkat
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Jelaskan secara singkat rekomendasi yang Anda butuhkan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Detail Permintaan
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Jelaskan secara detail bantuan atau pendampingan yang Anda butuhkan"
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={submitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Mengirim...' : 'Kirim ke SATGAS'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recommendations.length}</p>
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
                <p className="text-2xl font-bold">
                  {recommendations.filter(r => r.status === 'pending').length}
                </p>
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
                <p className="text-2xl font-bold">
                  {recommendations.filter(r => r.status === 'completed' || r.status === 'in_progress').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Diproses/Selesai</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {recommendations.filter(r => r.type === 'psikolog' || r.type === 'dukungan').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Psikologi/Dukungan</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat rekomendasi...</p>
            </div>
          ) : recommendations.map((rec) => (
            <Card key={rec.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(rec.type)}
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                    </div>
                    <CardDescription className="mb-3">
                      {rec.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getStatusBadge(rec.status)}
                      {getTypeBadge(rec.type)}
                    </div>
                    {rec.report && (
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        <strong>Terhadap Laporan:</strong> {rec.report.reportNumber} - {rec.report.title}
                      </div>
                    )}
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
              </CardContent>
            </Card>
          ))}
        </div>

        {recommendations.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Belum ada rekomendasi yang dikirim</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Klik "Buat Rekomendasi" untuk meminta pendampingan dari SATGAS PPKS
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}