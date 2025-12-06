"use client";

import { useState, useEffect, type ReactNode } from "react"; // Add 'type ReactNode' for RoleGuard
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  User,
  BookOpen,
  Loader2,
  Eye,
  Edit,
  FilePlus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";

// RoleGuard component with explicit typing for children prop
const RoleGuard = ({ children }: { children: ReactNode }) => children;

export default function InvestigationPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  
  // Predefined incident types (using actual database values)
  const incidentTypes = [
    { value: "kekerasan_seksual", label: "Kekerasan Seksual" },
    { value: "kekerasan_fisik", label: "Kekerasan Fisik" },
    { value: "kekerasan_psikis", label: "Kekerasan Psikis / Verbal" },
    { value: "bullying", label: "Perundungan (Bullying)" },
    { value: "diskriminasi", label: "Diskriminasi / Intoleransi" },
    { value: "lainnya", label: "Lainnya" }
  ];

  // No longer need modal states since we have dedicated pages

  // Fetch reports when the active tab changes
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        if (data.success) {
          let filteredReports = [];
          switch (activeTab) {
            case "active":
              filteredReports = data.reports.filter((report: any) => report.status === 'IN_PROGRESS');
              break;
            case "scheduled":
              filteredReports = data.reports.filter((report: any) => report.status === 'SCHEDULED');
              break;
            case "completed":
              filteredReports = data.reports.filter((report: any) => report.status === 'COMPLETED');
              break;
            default:
              filteredReports = data.reports.filter((report: any) => report.status === 'IN_PROGRESS');
          }
          setReports(filteredReports);
          setFilteredReports(filteredReports); // Set filtered reports as well
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
  }, [activeTab]);

  // Filter reports based on search term, category, and date range
  useEffect(() => {
    let filtered = reports;

    // Apply category filter first
    if (selectedCategory !== "all") {
      filtered = filtered.filter((report) => 
        report.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply date filter
    if (selectedDateRange?.from && selectedDateRange?.to) {
      const fromDate = selectedDateRange.from;
      const toDate = selectedDateRange.to;
      // Include the entire end date by setting time to end of day
      toDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= fromDate && reportDate <= toDate;
      });
    } else if (selectedDateRange?.from) {
      const fromDate = selectedDateRange.from;
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= fromDate;
      });
    } else if (selectedDateRange?.to) {
      const toDate = selectedDateRange.to;
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate <= toDate;
      });
    }

    // Then apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((report) =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.severity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reporter?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredReports(filtered);
  }, [reports, searchTerm, selectedCategory, selectedDateRange]);

  // Helper function to return status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Sedang Berlangsung</Badge>;
      case "SCHEDULED":
        return <Badge className="bg-purple-500 hover:bg-purple-600 text-white">Terjadwal</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "SCHEDULED":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };


  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Investigasi</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola proses investigasi laporan kekerasan</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Cari berdasarkan judul, nomor laporan, kategori, tingkat keparahan, pelapor, atau deskripsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">

                
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
                    setSelectedCategory("all");
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

        {/* Tab Navigation */}
        <Card className="mb-6 rounded-xl shadow-sm dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="border-b dark:border-gray-700">
              <nav className="flex space-x-8">
                <button
                  className={`py-2 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                    activeTab === "active"
                      ? "border-red-500 text-red-600 dark:text-red-400 dark:border-red-400"
                      : "border-transparent text-gray-500 hover:text-red-500 hover:border-red-300 dark:text-gray-400 dark:hover:text-red-400"
                  }`}
                  onClick={() => setActiveTab("active")}
                >
                  Aktif
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                    activeTab === "scheduled"
                      ? "border-red-500 text-red-600 dark:text-red-400 dark:border-red-400"
                      : "border-transparent text-gray-500 hover:text-red-500 hover:border-red-300 dark:text-gray-400 dark:hover:text-red-400"
                  }`}
                  onClick={() => setActiveTab("scheduled")}
                >
                  Terjadwal
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                    activeTab === "completed"
                      ? "border-red-500 text-red-600 dark:text-red-400 dark:border-red-400"
                      : "border-transparent text-gray-500 hover:text-red-500 hover:border-red-300 dark:text-gray-400 dark:hover:text-red-400"
                  }`}
                  onClick={() => setActiveTab("completed")}
                >
                  Selesai
                </button>
              </nav>
            </div>
          </CardContent>
        </Card>

        {/* List of Investigation Reports */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Memuat laporan investigasi...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {searchTerm ? 'Tidak ada hasil pencarian' : 'Tidak ada laporan dalam investigasi'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? `Tidak ada laporan yang cocok dengan pencarian "${searchTerm}"`
                    : 'Belum ada laporan yang diteruskan untuk investigasi.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1 flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold truncate max-w-full md:max-w-md text-gray-900 dark:text-white">{report.title}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-mono text-xs">{report.reportNumber}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {report.category || 'N/A'}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-red-500 dark:text-red-400">{report.severity || 'N/A'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {report.reporter?.name || 'N/A'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 w-full max-w-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progres {report.investigationProgress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${report.investigationProgress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/satgas/dashboard/investigasi/${report.id}/rekapan`} className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          Detail
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/satgas/dashboard/investigasi/${report.id}/proses`} className="hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1">
                          <Edit className="w-4 h-4" />
                          Action
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

