"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Search,
  Calendar,
  User,
  Shield,
  Filter,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";

interface FinalReport {
  id: string;
  investigationId: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'published';
  submittedDate: string;
  investigator: string;
  fileUrl?: string;
  fileSize?: string;
  approvedDate?: string;
  approvedBy?: string;
}

export default function RektorFinalReportsPage() {
  const [reports, setReports] = useState<FinalReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<FinalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter]);

  const fetchReports = async () => {
    // Mock data - replace with actual API call
    const mockReports: FinalReport[] = [
      {
        id: "1",
        investigationId: "SPPK-20241018-1005",
        title: "Laporan Akhir Investigasi Bullying Online",
        description: "Laporan lengkap investigasi kasus bullying online di lingkungan kampus",
        status: "submitted",
        submittedDate: "2024-10-22",
        investigator: "Dr. Ahmad Santoso",
        fileUrl: "/reports/SPPK-20241018-1005-final.pdf",
        fileSize: "2.4 MB"
      },
      {
        id: "2",
        investigationId: "SPPK-20241018-1005",
        title: "Laporan Akhir Investigasi Bullying Online",
        description: "Laporan lengkap investigasi kasus bullying online di lingkungan kampus",
        status: "submitted",
        submittedDate: "2024-10-22",
        investigator: "Dr. Ahmad Santoso",
        fileUrl: "/reports/SPPK-20241018-1005-final.pdf",
        fileSize: "2.4 MB"
      },
      {
        id: "3",
        investigationId: "SPPK-20241018-1005",
        title: "Laporan Akhir Investigasi Bullying Online",
        description: "Laporan lengkap investigasi kasus bullying online di lingkungan kampus",
        status: "submitted",
        submittedDate: "2024-10-22",
        investigator: "Dr. Ahmad Santoso",
        fileUrl: "/reports/SPPK-20241018-1005-final.pdf",
        fileSize: "2.4 MB"
      },
    ];

    setReports(mockReports);
    setLoading(false);
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.investigationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.investigator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  };

  const getStatusBadge = (status: FinalReport['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'submitted':
        return <Badge variant="default">Diajukan</Badge>;
      case 'approved':
        return <Badge variant="success">Disetujui</Badge>;
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

  const handleApprove = async (reportId: string) => {
    // Mock approval - replace with actual API call
    setReports(prev => prev.map(report =>
      report.id === reportId
        ? {
            ...report,
            status: 'approved' as const,
            approvedDate: new Date().toISOString().split('T')[0],
            approvedBy: 'Dr. Rektor Universitas'
          }
        : report
    ));
  };

  const handleDownload = (fileUrl: string) => {
    // Mock download - replace with actual download logic
    window.open(fileUrl, '_blank');
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
                  Laporan Akhir
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Memuat laporan akhir investigasi...
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
                  Laporan Akhir
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Laporan akhir dari investigasi yang telah selesai
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Laporan</p>
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
                  {reports.filter(r => r.status === 'submitted').length}
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
                  {reports.filter(r => r.status === 'approved' || r.status === 'published').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disetujui</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.fileUrl).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Berkas Tersedia</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari laporan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  Semua
                </Button>
                <Button
                  variant={statusFilter === "submitted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("submitted")}
                >
                  Diajukan
                </Button>
                <Button
                  variant={statusFilter === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("approved")}
                >
                  Disetujui
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {report.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {report.investigationId}
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Diajukan: {formatDate(report.submittedDate)}
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {report.investigator}
                  </div>

                  {report.fileSize && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {report.fileSize}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {report.fileUrl && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(report.fileUrl!)}>
                          Unduh
                        </Button>
                        <Button size="sm" variant="outline">
                          Lihat
                        </Button>
                      </>
                    )}
                    {report.status === 'submitted' && (
                      <Button size="sm" onClick={() => handleApprove(report.id)}>
                        Setujui Laporan
                      </Button>
                    )}
                    {report.status === 'approved' && (
                      <Button size="sm" variant="default">
                        Publikasikan
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      Lihat Detail Investigasi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {reports.length === 0 ? "Belum ada laporan akhir" : "Tidak ada laporan yang sesuai dengan filter"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}