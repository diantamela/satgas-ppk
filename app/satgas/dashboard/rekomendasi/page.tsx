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
} from "lucide-react";
import { RoleGuard } from "../../../../components/auth/role-guard";

interface Report {
  id: string;
  reportNumber: string;
  title: string;
  description: string;
  status: string;
}

interface Recommendation {
  id: string;
  investigationId: string;
  title: string;
  description: string;
  recommendation: string;
  status: 'pending' | 'approved' | 'implemented' | 'rejected';
  createdAt: string;
  investigator: string;
  priority: 'low' | 'medium' | 'high';
}

export default function SatgasRecommendationsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    priority: "MEDIUM"
  });

  useEffect(() => {
    fetchReports();
    fetchRecommendations();
  }, []);

  const fetchReports = async () => {
    try {
      // Get reports assigned to current user (SATGAS)
      // For now, get all reports - in real implementation, filter by assignee
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReport,
          title: formData.title,
          description: formData.description,
          content: formData.content,
          priority: formData.priority,
          userId: "temp-user-id", // TODO: Get actual user ID from auth
        })
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          title: "",
          description: "",
          content: "",
          priority: "MEDIUM"
        });
        setSelectedReport("");
        fetchRecommendations();
        alert('Rekomendasi berhasil diajukan ke Rektor');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengajukan rekomendasi');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal mengajukan rekomendasi');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: Recommendation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Menunggu Persetujuan</Badge>;
      case 'approved':
        return <Badge variant="default">Disetujui</Badge>;
      case 'implemented':
        return <Badge variant="success">Diimplementasikan</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Prioritas Tinggi</Badge>;
      case 'medium':
        return <Badge variant="default">Prioritas Sedang</Badge>;
      case 'low':
        return <Badge variant="secondary">Prioritas Rendah</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Rekomendasi</h1>
            <p className="text-gray-600 dark:text-gray-400">Ajukan rekomendasi hasil investigasi ke Rektor</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? 'Batal' : 'Buat Rekomendasi'}
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Buat Rekomendasi Baru</CardTitle>
              <CardDescription>
                Ajukan rekomendasi berdasarkan hasil investigasi yang telah dilakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pilih Laporan Investigasi
                  </label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih laporan investigasi" />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Judul Rekomendasi
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Contoh: Rekomendasi Penanganan Kekerasan Verbal"
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
                    placeholder="Jelaskan konteks rekomendasi ini"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Isi Rekomendasi
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Jelaskan rekomendasi yang diajukan secara detail"
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prioritas
                  </label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Rendah</SelectItem>
                      <SelectItem value="MEDIUM">Sedang</SelectItem>
                      <SelectItem value="HIGH">Tinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={submitting || !selectedReport}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Mengajukan...' : 'Ajukan ke Rektor'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Menunggu Persetujuan</p>
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
                  {recommendations.filter(r => r.status === 'approved' || r.status === 'implemented').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disetujui</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{rec.title}</CardTitle>
                    <CardDescription className="mb-3">
                      {rec.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getStatusBadge(rec.status)}
                      {getPriorityBadge(rec.priority)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{rec.investigationId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(rec.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Rekomendasi:</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {rec.recommendation}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {recommendations.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Belum ada rekomendasi yang diajukan</p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}