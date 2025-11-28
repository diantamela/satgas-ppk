"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Calendar,
  User,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";

interface Recommendation {
  id: string;
  investigationId: string;
  title: string;
  description: string;
  recommendation: string;
  status: 'pending' | 'approved' | 'implemented';
  createdAt: string;
  investigator: string;
  priority: 'low' | 'medium' | 'high';
}

export default function RektorRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      } else {
        console.error('Failed to fetch recommendations');
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recommendationId: string) => {
    setProcessingId(recommendationId);
    try {
      const response = await fetch(`/api/recommendations/${recommendationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'APPROVED' })
      });

      if (response.ok) {
        fetchRecommendations(); // Refresh the list
        alert('Rekomendasi berhasil disetujui');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyetujui rekomendasi');
      }
    } catch (error) {
      console.error('Error approving recommendation:', error);
      alert('Gagal menyetujui rekomendasi');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRecommendation || !rejectReason.trim()) return;

    setProcessingId(selectedRecommendation.id);
    try {
      const response = await fetch(`/api/recommendations/${selectedRecommendation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason: rejectReason
        })
      });

      if (response.ok) {
        fetchRecommendations(); // Refresh the list
        setShowRejectDialog(false);
        setRejectReason("");
        setSelectedRecommendation(null);
        alert('Rekomendasi berhasil ditolak');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menolak rekomendasi');
      }
    } catch (error) {
      console.error('Error rejecting recommendation:', error);
      alert('Gagal menolak rekomendasi');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkImplemented = async (recommendationId: string) => {
    setProcessingId(recommendationId);
    try {
      const response = await fetch(`/api/recommendations/${recommendationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'IMPLEMENTED' })
      });

      if (response.ok) {
        fetchRecommendations(); // Refresh the list
        alert('Rekomendasi berhasil ditandai sebagai diimplementasikan');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menandai implementasi');
      }
    } catch (error) {
      console.error('Error marking as implemented:', error);
      alert('Gagal menandai implementasi');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowRejectDialog(true);
  };

  const getStatusBadge = (status: Recommendation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Menunggu Persetujuan</Badge>;
      case 'approved':
        return <Badge variant="default">Disetujui</Badge>;
      case 'implemented':
        return <Badge variant="success">Diimplementasikan</Badge>;
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

  if (loading) {
    return (
      <RoleGuard requiredRoles={["REKTOR"]}>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Rekomendasi
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Memuat rekomendasi dari investigasi...
              </p>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRoles={["REKTOR"]}>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Rekomendasi
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Rekomendasi dari hasil investigasi Satgas PPK
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {recommendations.filter(r => r.status === 'implemented').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Diimplementasikan</p>
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
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(rec.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{rec.investigator}</span>
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

                <div className="flex gap-2">
                  {rec.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(rec.id)}
                        disabled={processingId === rec.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processingId === rec.id ? 'Memproses...' : 'Setujui'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRejectDialog(rec)}
                        disabled={processingId === rec.id}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Tolak
                      </Button>
                    </>
                  )}
                  {rec.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleMarkImplemented(rec.id)}
                      disabled={processingId === rec.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processingId === rec.id ? 'Memproses...' : 'Tandai Implementasi'}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    Lihat Detail Investigasi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {recommendations.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Belum ada rekomendasi</p>
            </CardContent>
          </Card>
        )}

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tolak Rekomendasi</DialogTitle>
              <DialogDescription>
                Berikan alasan penolakan untuk rekomendasi ini.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Jelaskan alasan penolakan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                  setSelectedRecommendation(null);
                }}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim() || processingId === selectedRecommendation?.id}
              >
                {processingId === selectedRecommendation?.id ? 'Memproses...' : 'Tolak Rekomendasi'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}