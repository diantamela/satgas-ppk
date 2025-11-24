"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
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

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    // Mock data - replace with actual API call
    const mockRecommendations: Recommendation[] = [
      {
        id: "1",
        investigationId: "SPPK-20241018-1005",
        title: "Rekomendasi Penanganan Bullying Online",
        description: "Investigasi kasus bullying online di lingkungan kampus",
        recommendation: "1. Perkuat sistem monitoring media sosial kampus\n2. Tambahkan sesi edukasi anti-bullying\n3. Buat mekanisme pelaporan anonim yang lebih mudah\n4. Kolaborasi dengan platform media sosial",
        status: "pending",
        createdAt: "2024-10-20",
        investigator: "Dr. Ahmad Santoso",
        priority: "high"
      },
      {
        id: "2",
        investigationId: "SPPK-20241015-2003",
        title: "Rekomendasi Pencegahan Kekerasan Seksual",
        description: "Kasus dugaan kekerasan seksual di area parkir kampus",
        recommendation: "1. Tambahkan penerangan di area parkir\n2. Instal kamera CCTV di titik strategis\n3. Buat patroli rutin keamanan kampus\n4. Sosialisasi kampanye kesadaran gender",
        status: "approved",
        createdAt: "2024-10-18",
        investigator: "Prof. Siti Nurhaliza",
        priority: "high"
      },
      {
        id: "3",
        investigationId: "SPPK-20241010-3001",
        title: "Rekomendasi Penanganan Kekerasan Verbal",
        description: "Konflik verbal antar mahasiswa di kelas",
        recommendation: "1. Tambahkan modul komunikasi efektif dalam kurikulum\n2. Buat program mediator mahasiswa\n3. Perkuat kode etik mahasiswa\n4. Workshop resolusi konflik",
        status: "implemented",
        createdAt: "2024-10-12",
        investigator: "Dr. Budi Prasetyo",
        priority: "medium"
      }
    ];

    setRecommendations(mockRecommendations);
    setLoading(false);
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
            <SidebarTrigger className="sm:flex hidden" />
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
            <SidebarTrigger className="sm:flex hidden" />
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
                      <Button size="sm" variant="default">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Setujui
                      </Button>
                      <Button size="sm" variant="outline">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Revisi
                      </Button>
                    </>
                  )}
                  {rec.status === 'approved' && (
                    <Button size="sm" variant="default">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Tandai Implementasi
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
      </div>
    </RoleGuard>
  );
}