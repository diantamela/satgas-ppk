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
} from "lucide-react";
import { RoleGuard } from "../../../../components/auth/role-guard";

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

export default function SATGASUserRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<UserRecommendation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [responseData, setResponseData] = useState({
    status: "",
    response: ""
  });

  useEffect(() => {
    fetchUserRecommendations();
  }, []);

  const fetchUserRecommendations = async () => {
    try {
      const response = await fetch('/api/satgas/user-recommendations');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecommendation) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/satgas/user-recommendations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedRecommendation.id,
          status: responseData.status,
          response: responseData.response
        })
      });

      if (response.ok) {
        setShowResponseForm(false);
        setSelectedRecommendation(null);
        setResponseData({ status: "", response: "" });
        fetchUserRecommendations();
        alert('Respons berhasil dikirim ke user');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengirim respons');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal mengirim respons');
    } finally {
      setSubmitting(false);
    }
  };

  const openResponseForm = (recommendation: UserRecommendation) => {
    setSelectedRecommendation(recommendation);
    setResponseData({
      status: recommendation.status === 'pending' ? 'responded' : recommendation.status,
      response: recommendation.response || ""
    });
    setShowResponseForm(true);
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
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Rekomendasi dari User</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola rekomendasi dan permintaan pendampingan dari user</p>
          </div>
        </div>

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

        {/* Response Form Modal */}
        {showResponseForm && selectedRecommendation && (
          <Card className="mb-6 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle>Berikan Respons - {selectedRecommendation.title}</CardTitle>
              <CardDescription>
                Berikan respons atau update status untuk rekomendasi dari {selectedRecommendation.user.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResponseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <Select value={responseData.status} onValueChange={(value) => setResponseData({...responseData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="responded">Ada Respons</SelectItem>
                      <SelectItem value="in_progress">Sedang Diproses</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Respons/Penjelasan
                  </label>
                  <Textarea
                    value={responseData.response}
                    onChange={(e) => setResponseData({...responseData, response: e.target.value})}
                    placeholder="Berikan respons detail atau penjelasan terkait rekomendasi ini"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting || !responseData.status}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Mengirim...' : 'Kirim Respons'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowResponseForm(false)}>
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* User Recommendations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat rekomendasi user...</p>
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
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Dari:</strong> {rec.user.name} ({rec.user.email})</p>
                      {rec.respondedBy && <p><strong>Direspon oleh:</strong> {rec.respondedBy}</p>}
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
                    onClick={() => openResponseForm(rec)}
                    size="sm"
                    variant={rec.status === 'pending' ? 'default' : 'outline'}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {rec.status === 'pending' ? 'Berikan Respons' : 'Update Respons'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {recommendations.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Belum ada rekomendasi dari user</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Rekomendasi dari user akan muncul di sini
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}