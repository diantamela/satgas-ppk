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
  BarChart3,
  TrendingUp,
  FileSearch,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";

interface FinalReport {
  id: string;
  investigationId: string;
  title: string;
  description: string;
  status: 'completed' | 'archived';
  completedDate: string;
  investigator: string;
  fileUrl?: string;
  fileSize?: string;
  caseSummary: string;
  actionTaken: string[];
  recommendations: string[];
}

export default function RektorFinalReportsPage() {
  const [reports, setReports] = useState<FinalReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<FinalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchReports();
  }, [statusFilter, startDate, endDate, searchTerm]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, startDate, endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/final-reports?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setReports(data.finalReports || []);
      } else {
        console.error("Failed to fetch reports:", data.message);
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching final reports:", error);
      setReports([]);
      // You might want to show a user-friendly error message here
    } finally {
      setLoading(false);
    }
  };

  // Remove local filtering since API handles filtering
  const filterReports = () => {
    // Data is already filtered by the API
    setFilteredReports(reports);
  };

  const getStatusBadge = (status: FinalReport['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Selesai</Badge>;
      case 'archived':
        return <Badge variant="secondary">Diarsipkan</Badge>;
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

  const handleDownload = (fileUrl: string) => {
    // Mock download - replace with actual download logic
    window.open(fileUrl, '_blank');
  };

  const handlePreview = (reportId: string) => {
    // Mock preview - replace with actual preview logic
    window.open(`/reports/preview/${reportId}`, '_blank');
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <RoleGuard requiredRoles={["REKTOR"]}>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="flex sm:hidden" />
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
            <SidebarTrigger className="flex sm:hidden" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Laporan Akhir Investigasi
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Monitoring laporan akhir dari investigasi yang telah selesai
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
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Investigasi Selesai</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.fileUrl).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Berkas Tersedia</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter(r => {
                    const completedDate = new Date(r.completedDate);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return completedDate >= thirtyDaysAgo;
                  }).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">30 Hari Terakhir</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and Date Filters Row */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari laporan berdasarkan judul, ID investigasi, investigator, atau ringkasan kasus..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  {/* Date Filter Inputs */}
                  <div className="flex gap-2">
                    <div className="relative">
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pl-8 h-9 text-sm w-32"
                        placeholder="Mulai"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="pl-8 h-9 text-sm w-32"
                        placeholder="Selesai"
                      />
                    </div>
                  </div>
                  {/* Status Filter Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("all")}
                    >
                      Semua
                    </Button>
                    <Button
                      variant={statusFilter === "completed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("completed")}
                    >
                      Selesai
                    </Button>
                    <Button
                      variant={statusFilter === "archived" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("archived")}
                    >
                      Diarsipkan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearDateFilters}
                    >
                      <Filter className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {report.title}
                      </h3>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {report.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ringkasan Kasus
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {report.caseSummary}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Informasi Investigasi
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FileSearch className="w-3 h-3" />
                          <span>{report.investigationId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>{report.investigator}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>Selesai: {formatDate(report.completedDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tindakan yang Diambil
                      </h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {report.actionTaken.slice(0, 3).map((action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 mt-0.5 text-green-500" />
                            <span>{action}</span>
                          </li>
                        ))}
                        {report.actionTaken.length > 3 && (
                          <li className="text-xs text-gray-500">
                            +{report.actionTaken.length - 3} tindakan lainnya
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rekomendasi
                      </h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {report.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <TrendingUp className="w-3 h-3 mt-0.5 text-blue-500" />
                            <span>{rec}</span>
                          </li>
                        ))}
                        {report.recommendations.length > 3 && (
                          <li className="text-xs text-gray-500">
                            +{report.recommendations.length - 3} rekomendasi lainnya
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {report.fileUrl && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(report.fileUrl!)}>
                          <Download className="w-4 h-4 mr-1" />
                          Unduh Laporan
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePreview(report.id)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </>
                    )}
                    {report.fileSize && (
                      <span className="text-xs text-gray-500 self-center">
                        Ukuran file: {report.fileSize}
                      </span>
                    )}
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
                {reports.length === 0 ? "Belum ada laporan akhir investigasi" : "Tidak ada laporan yang sesuai dengan filter"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}