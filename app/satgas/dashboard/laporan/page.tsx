"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reports from the API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        if (data.success) {
          setReports(data.reports);
          setFilteredReports(data.reports);
        } else {
          console.error("Error fetching reports:", data.message);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Apply filters when search term or status filter changes
  useEffect(() => {
    let result = reports;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(report => report.status === statusFilter);
    }

    setFilteredReports(result);
  }, [searchTerm, statusFilter, reports]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Menunggu</Badge>;
      case "verified":
        return <Badge variant="default">Terverifikasi</Badge>;
      case "under_investigation":
        return <Badge variant="default">Dalam Investigasi</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "completed":
        return <Badge variant="success">Selesai</Badge>;
      case "deleted":
        return <Badge variant="outline">Dihapus</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "under_investigation":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <RoleGuard>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Laporan</h1>
              <p className="text-gray-600 dark:text-gray-400">Kelola laporan kekerasan yang masuk</p>
            </div>
          </div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Laporan</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola laporan kekerasan yang masuk</p>
          </div>
          <Button className="mt-4 md:mt-0">
            <FileText className="w-4 h-4 mr-2" />
            Ekspor Laporan
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari laporan berdasarkan judul, nomor, atau kategori..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="verified">Terverifikasi</option>
                  <option value="under_investigation">Dalam Investigasi</option>
                  <option value="rejected">Ditolak</option>
                  <option value="completed">Selesai</option>
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Tidak ada laporan</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {reports.length === 0 
                    ? "Belum ada laporan yang masuk." 
                    : "Tidak ada laporan yang sesuai dengan filter pencarian Anda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getStatusIcon(report.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium truncate max-w-[200px] md:max-w-md">{report.title}</h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{report.reportNumber}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{report.category}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{report.severity}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/satgas/dashboard/laporan/${report.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Lihat
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
    </div>
  </RoleGuard>
  );
}