"use client";

import { useState, useEffect, type ReactNode } from "react"; // Tambahkan 'type ReactNode' untuk RoleGuard
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import {
    FileText,
    AlertTriangle,
    Clock,
    CheckCircle,
    User,
    Calendar,
    MapPin,
    Upload,
    Eye,
    Download,
    Edit,
    MessageSquare,
    FilePlus,
    Users,
    BookOpen,
    FileImage,
    Loader2
} from "lucide-react";
import ScheduleInvestigationModal from "@/components/schedule-investigation-modal";

// Perbaikan: Placeholder untuk RoleGuard dengan tipe eksplisit untuk children
const RoleGuard = ({ children }: { children: ReactNode }) => children;

export default function InvestigationPage() {
    // State untuk mengontrol navigasi tab
    const [activeTab, setActiveTab] = useState("active");
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [isScheduling, setIsScheduling] = useState(false);
    const [pendingReports, setPendingReports] = useState<any[]>([]);
    const [showReportSelection, setShowReportSelection] = useState(false);

    // Fetch reports from the API
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch('/api/reports');
                const data = await response.json();
                if (data.success) {
                    let filteredReports = [];

                    switch (activeTab) {
                        case "active":
                            // Filter reports that are in active investigation (IN_PROGRESS status)
                            filteredReports = data.reports.filter((report: any) =>
                                report.status === 'IN_PROGRESS'
                            );
                            break;
                        case "scheduled":
                            // Filter reports that are scheduled for investigation
                            filteredReports = data.reports.filter((report: any) =>
                                report.status === 'SCHEDULED'
                            );
                            break;
                        case "completed":
                            // Filter reports that are completed
                            filteredReports = data.reports.filter((report: any) =>
                                report.status === 'COMPLETED'
                            );
                            break;
                        default:
                            filteredReports = data.reports.filter((report: any) =>
                                report.status === 'IN_PROGRESS'
                            );
                    }

                    setReports(filteredReports);
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

    /**
     * Fungsi helper untuk mendapatkan Badge status dengan warna yang sesuai
     * @param status Status laporan investigasi
     * @returns Komponen Badge React
     */
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "IN_PROGRESS":
                return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Dalam Investigasi</Badge>;
            case "SCHEDULED":
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Terjadwal</Badge>;
            case "COMPLETED":
                return <Badge className="bg-green-500 hover:bg-green-600 text-white">Selesai</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Handle opening schedule modal
    const handleOpenScheduleModal = async () => {
        try {
            const response = await fetch('/api/reports');
            const data = await response.json();
            if (data.success) {
                // Filter pending reports that can be scheduled
                const pending = data.reports.filter((report: any) =>
                    report.status === 'VERIFIED' || report.status === 'PENDING'
                );
                setPendingReports(pending);
                setShowReportSelection(true);
            }
        } catch (error) {
            console.error('Error fetching pending reports:', error);
            alert('Gagal memuat laporan yang dapat dijadwalkan');
        }
    };

    // Handle scheduling investigation
    const handleScheduleInvestigation = async (scheduledDate: string, notes: string) => {
        if (!selectedReport) return;

        setIsScheduling(true);
        try {
            const response = await fetch('/api/reports/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId: selectedReport.id,
                    scheduledDate,
                    notes
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Refresh the reports list
                const reportsResponse = await fetch('/api/reports');
                const reportsData = await reportsResponse.json();
                if (reportsData.success) {
                    const filteredReports = reportsData.reports.filter((report: any) =>
                        activeTab === "scheduled" ? report.status === 'SCHEDULED' : report.status === 'IN_PROGRESS'
                    );
                    setReports(filteredReports);
                }

                setShowScheduleModal(false);
                setSelectedReport(null);
                alert('Investigasi berhasil dijadwalkan');
            } else {
                alert(data.message || 'Gagal menjadwalkan investigasi');
            }
        } catch (error) {
            console.error('Schedule investigation error:', error);
            alert('Terjadi kesalahan saat menjadwalkan investigasi');
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <RoleGuard>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 font-['Inter']">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pt-4 border-b pb-4 dark:border-gray-700">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Investigasi</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola proses investigasi laporan kekerasan</p>
                    </div>
                    <Button
                        className="mt-4 md:mt-0 shadow-md transition-shadow hover:shadow-lg bg-red-600 hover:bg-red-700"
                        onClick={handleOpenScheduleModal}
                    >
                        <FilePlus className="w-4 h-4 mr-2" />
                        Jadwalkan Investigasi
                    </Button>
                </div>

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
                    ) : reports.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Tidak ada laporan dalam investigasi</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Belum ada laporan yang diteruskan untuk investigasi.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        reports.map((report) => (
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
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={`/satgas/dashboard/investigasi/${report.id}`}>
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Detail
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" className="hover:bg-gray-200 dark:hover:bg-gray-700">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" className="bg-red-500 hover:bg-red-600">
                                                <MessageSquare className="w-4 h-4 mr-1" />
                                                Catatan
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Report Selection Modal */}
                <Dialog open={showReportSelection} onOpenChange={setShowReportSelection}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Pilih Laporan untuk Dijadwalkan</DialogTitle>
                            <DialogDescription>
                                Pilih laporan yang akan dijadwalkan untuk investigasi.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {pendingReports.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Tidak ada laporan yang dapat dijadwalkan</p>
                                </div>
                            ) : (
                                pendingReports.map((report) => (
                                    <Card key={report.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                          onClick={() => {
                                              setSelectedReport(report);
                                              setShowReportSelection(false);
                                              setShowScheduleModal(true);
                                          }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {report.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-mono text-xs">{report.reportNumber}</span>
                                                        <span>•</span>
                                                        <span>{report.category || 'N/A'}</span>
                                                        <span>•</span>
                                                        <span className="font-semibold text-red-500">{report.severity || 'N/A'}</span>
                                                        <span>•</span>
                                                        <span>{report.reporter?.name || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowReportSelection(false)}>
                                Batal
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Schedule Investigation Modal */}
                {selectedReport && (
                    <ScheduleInvestigationModal
                        isOpen={showScheduleModal}
                        onClose={() => {
                            setShowScheduleModal(false);
                            setSelectedReport(null);
                        }}
                        onSchedule={handleScheduleInvestigation}
                        reportTitle={selectedReport.title}
                        isLoading={isScheduling}
                    />
                )}

            </div>
        </RoleGuard>
    );
}