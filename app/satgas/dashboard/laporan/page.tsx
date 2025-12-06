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
  MoreHorizontal,
  Calendar as CalendarIcon,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

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

    // Apply date filter
    if (selectedDateRange?.from && selectedDateRange?.to) {
      const fromDate = selectedDateRange.from;
      const toDate = selectedDateRange.to;
      // Include the entire end date by setting time to end of day
      toDate.setHours(23, 59, 59, 999);
      
      result = result.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= fromDate && reportDate <= toDate;
      });
    } else if (selectedDateRange?.from) {
      const fromDate = selectedDateRange.from;
      result = result.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= fromDate;
      });
    } else if (selectedDateRange?.to) {
      const toDate = selectedDateRange.to;
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate <= toDate;
      });
    }

    setFilteredReports(result);
  }, [searchTerm, selectedDateRange, reports]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Menunggu</Badge>;
      case "VERIFIED":
        return <Badge variant="default">Terverifikasi</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Sedang Berlangsung</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "COMPLETED":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Selesai</Badge>;
      case "SCHEDULED":
        return <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Terjadwal</Badge>;
      case "DELETED":
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
              <div className="flex flex-wrap gap-2">
                {/* Date Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[280px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                    <Calendar
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
              <Card 
                key={report.id} 
                className={`hover:shadow-md transition-shadow ${
                  report.status === 'PENDING' 
                    ? 'bg-gray-100 dark:bg-gray-800' 
                    : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        report.status === 'PENDING' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          : report.status === 'VERIFIED'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : report.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : report.status === 'COMPLETED'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : report.status === 'REJECTED'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {getStatusIcon(report.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                              {report.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                              {report.category} - {report.reporter?.name || 'Unknown User'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{report.reportNumber}</span>
                              <span>•</span>
                              <span>{report.severity}</span>
                              <span>•</span>
                              <span>{format(new Date(report.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(report.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <Link href={`/satgas/dashboard/laporan/${report.id}`} className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          Detail
                        </Link>
                      </Button>
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
