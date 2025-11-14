"use client";

import { useState, type ReactNode } from "react"; // Tambahkan 'type ReactNode' untuk RoleGuard
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    FileImage
} from "lucide-react";

// Perbaikan: Placeholder untuk RoleGuard dengan tipe eksplisit untuk children
const RoleGuard = ({ children }: { children: ReactNode }) => children; 

export default function InvestigationPage() {
    // State untuk mengontrol navigasi tab
    const [activeTab, setActiveTab] = useState("active");

    // Mock data untuk laporan investigasi
    const investigationReports = [
        {
            id: 1,
            reportNumber: "SPPK-20241015-1001",
            title: "Dugaan Pelecehan Seksual",
            status: "under_investigation",
            category: "Pelecehan Seksual",
            severity: "Tinggi",
            reporterName: "Anonim",
            respondentName: "Budi Santoso",
            createdAt: "2024-10-15",
            assignedTo: "Siti Rahayu",
            progress: 60
        },
        {
            id: 2,
            reportNumber: "SPPK-20241014-2002",
            title: "Kekerasan Verbal",
            status: "investigation_scheduled",
            category: "Kekerasan Verbal",
            severity: "Sedang",
            reporterName: "Ahmad Kurniawan",
            respondentName: "Rina Wijaya",
            createdAt: "2024-10-14",
            assignedTo: "Agus Prasetyo",
            progress: 20
        },
    ];

    /**
     * Fungsi helper untuk mendapatkan Badge status dengan warna yang sesuai
     * @param status Status laporan investigasi
     * @returns Komponen Badge React
     */
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "investigation_scheduled":
                return <Badge variant="secondary">Penjadwalan</Badge>;
            case "under_investigation":
                // Anda mungkin perlu menyesuaikan varian default/color jika tidak ada varian 'default' yang sesuai
                return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Dalam Investigasi</Badge>;
            case "awaiting_response":
                return <Badge variant="outline">Menunggu Respon</Badge>;
            case "completed":
                // Asumsi ada varian 'success' atau menggunakan warna hijau kustom
                return <Badge className="bg-green-500 hover:bg-green-600 text-white">Selesai</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };
    
    // Logika filter sederhana (belum terimplementasi sepenuhnya di UI, hanya mock data)
    const filteredReports = investigationReports.filter(report => {
        if (activeTab === "active") {
            return report.status === "under_investigation" || report.status === "awaiting_response";
        }
        if (activeTab === "scheduled") {
            return report.status === "investigation_scheduled";
        }
        if (activeTab === "completed") {
            return report.status === "completed";
        }
        return true; // Jika ada tab lain
    });


    return (
        <RoleGuard>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 font-['Inter']">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pt-4 border-b pb-4 dark:border-gray-700">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Investigasi</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola proses investigasi laporan kekerasan</p>
                    </div>
                    <Button className="mt-4 md:mt-0 shadow-md transition-shadow hover:shadow-lg bg-red-600 hover:bg-red-700">
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
                    {/* Menggunakan mock data asli, implementasi filter perlu ditambahkan jika ingin sesuai dengan tab */}
                    {investigationReports.map((report) => (
                        <Card key={report.id} className="hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 rounded-xl">
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="mt-1 flex-shrink-0">
                                            {report.status === "investigation_scheduled" && <Calendar className="w-5 h-5 text-blue-500" />}
                                            {report.status === "under_investigation" && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                                            {report.status === "completed" && <CheckCircle className="w-5 h-5 text-green-500" />}
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
                                                    <BookOpen className="w-3 h-3" /> {report.category}
                                                </span>
                                                <span>•</span>
                                                <span className="font-semibold text-red-500 dark:text-red-400">{report.severity}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> Ditugaskan ke: {report.assignedTo}
                                                </span>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="mt-3 w-full max-w-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progres {report.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="bg-red-600 h-2 rounded-full transition-all duration-500" 
                                                        style={{ width: `${report.progress}%` }}
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
                                            onClick={() => console.log(`Lihat detail laporan ${report.id}`)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Detail
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
                    ))}
                </div>
                
            </div>
        </RoleGuard>
    );
}