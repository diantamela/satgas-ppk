"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Search,
  Download,
  Bell,
  X,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { reportFormStyles as styles } from '@/lib/styles/report-form-styles';

export default function StatusCheckPage() {
  const [reportNumber, setReportNumber] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [reportStatus, setReportStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);

  // Fetch notifications related to the found report
  const fetchNotifications = async (reportId: string) => {
    try {
      setNotificationsLoading(true);
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      console.log('All notifications response:', data);
      
      if (data.success) {
        // Filter notifications related to this specific report
        const allNotifications = data.data.notifications || [];
        console.log('All notifications:', allNotifications);
        
        const reportNotifications = allNotifications.filter((n: any) => {
          console.log('Checking notification:', { id: n.id, relatedEntityId: n.relatedEntityId, relatedEntityType: n.relatedEntityType, reportId });
          return n.relatedEntityId === reportId || n.relatedEntityType === 'REPORT';
        });
        
        console.log('Filtered report notifications:', reportNotifications);
        setNotifications(reportNotifications);
        const unreadCount = reportNotifications.filter((n: any) => !n.isRead).length;
        setUnreadNotifications(unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          isRead: true
        }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );
        setUnreadNotifications(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleSearch = async () => {
    if (!reportNumber.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/reports/check-status?reportNumber=${encodeURIComponent(
          reportNumber
        )}`
      );
      const result = await response.json();

      if (result.success) {
        setReportStatus(result.report);
        // Fetch notifications for this report
        if (result.report.id) {
          fetchNotifications(result.report.id);
        }
      } else {
        setReportStatus(null);
        setNotifications([]);
        setUnreadNotifications(0);
      }
    } catch (error) {
      console.error("Error checking report status:", error);
      setReportStatus(null);
      setNotifications([]);
      setUnreadNotifications(0);
    } finally {
      setSearchPerformed(true);
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="secondary"
            className="bg-[#FFF4D1] text-[#7A5A00] border-none"
          >
            Menunggu Verifikasi
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="default"
            className="bg-[#E9B44C] text-[#5b3f00] border-none"
          >
            Dalam Investigasi
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="destructive"
            className="bg-[#FBE3E4] text-[#9F1D1D] border-none"
          >
            Ditolak
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-[#E5F7E8] text-[#1f5d2b] border border-[#2f8a3a]"
          >
            Selesai
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-[#ccc] text-[#555]">
            {status}
          </Badge>
        );
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'INFO':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REPORT_STATUS_CHANGED':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'REPORT_ASSIGNED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'NEW_RECOMMENDATION':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'DECISION_MADE':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'DOCUMENT_UPLOADED':
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} menit yang lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.wrap}>
        {/* Topbar sama seperti halaman form */}
        <div className={styles.topbar}>SISTEM INFORMASI PENGADUAN SATGAS PPKS</div>

        <Card className={styles.card}>
          <CardHeader className="text-center border-b border-[#f2e6d5] pb-5">
            <div className="flex justify-center mb-3">
              <div className="bg-[#FDEBD0] p-3 rounded-full">
                <Search className="w-8 h-8 text-[#A13D3D]" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <CardTitle className={styles.heading}>Cek Status Laporan</CardTitle>
              
              {/* Notification Bell - Show when report is found */}
              {reportStatus && (
                <Dialog open={notificationsDialogOpen} onOpenChange={setNotificationsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-600 hover:bg-red-50 relative"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadNotifications > 0 && (
                        <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[1.2rem] h-5 rounded-full flex items-center justify-center">
                          {unreadNotifications > 99 ? '99+' : unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifikasi Laporan
                        {unreadNotifications > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {unreadNotifications} baru
                          </Badge>
                        )}
                      </DialogTitle>
                      <DialogDescription>
                        Notifikasi terkait laporan {reportStatus.reportNumber}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 max-h-[60vh] overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Memuat notifikasi...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="font-semibold">Belum ada notifikasi</p>
                          <p className="text-sm mt-1">Notifikasi akan muncul ketika ada pembaruan pada laporan Anda</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border rounded-lg transition-colors ${
                                notification.isRead
                                  ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                  : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {notification.title}
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                        {formatNotificationTime(notification.createdAt)}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                      {!notification.isRead && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => markNotificationAsRead(notification.id)}
                                          className="text-xs h-7 px-2"
                                        >
                                          Tandai dibaca
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <CardDescription className={styles.lead}>
              Masukkan nomor laporan untuk melihat status dan progres penanganan
              kasus yang telah Anda ajukan.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-6 space-y-5">
            {/* Input nomor laporan */}
            <div className={styles.searchRow}>
              <Input
                type="text"
                placeholder="Masukkan nomor laporan (contoh: LPN-250123)"
                value={reportNumber}
                onChange={(e) => setReportNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                style={{ background: "#A13D3D", color: "#E9B44C" }}
              >
                {isLoading ? "Mencari..." : "Cari"}
              </Button>
            </div>

            {/* Info awal sebelum pencarian */}
            {!searchPerformed && (
              <div className={styles.noteBox}>
                Nomor laporan diberikan setelah Anda berhasil mengirimkan
                laporan. Contoh format: <span className="font-mono">LPN-25xxxx</span>.
                Simpan nomor tersebut untuk memantau status penanganan.
              </div>
            )}

            {/* Jika laporan tidak ditemukan */}
            {searchPerformed && !reportStatus && (
              <div className={styles.notFoundBox}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 mt-0.5 text-[#b00020]" />
                  <div>
                    <h3 className="text-base font-semibold mb-1">
                      Laporan tidak ditemukan
                    </h3>
                    <p className="text-sm">
                      Nomor laporan yang Anda masukkan tidak terdaftar di
                      sistem. Periksa kembali penulisan nomor laporan atau
                      hubungi admin jika Anda merasa ini sebuah kesalahan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Jika laporan ditemukan */}
            {reportStatus && (
              <div className="space-y-5">
                {/* Ringkasan laporan */}
                <Card className={styles.statusCard}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <h3 className={styles.statusTitle}>
                          {reportStatus.title}
                        </h3>
                        <p className={styles.statusText}>
                          {reportStatus.description}
                        </p>
                      </div>
                      <div className="mt-1 sm:mt-0">
                        {getStatusBadge(reportStatus.status)}
                      </div>
                    </div>

                    <div className={styles.infoGrid}>
                      <div>
                        <p className={styles.value}>
                          <span className={styles.label}>Nomor Laporan: </span>
                          {reportStatus.reportNumber}
                        </p>
                        <p className={styles.value}>
                          <span className={styles.label}>Kategori: </span>
                          {reportStatus.category}
                        </p>
                        <p className={styles.value}>
                          <span className={styles.label}>
                            Tingkat Keparahan:{" "}
                          </span>
                          {reportStatus.severity}
                        </p>
                      </div>
                      <div>
                        <p className={styles.value}>
                          <span className={styles.label}>Tanggal Laporan: </span>
                          {new Date(
                            reportStatus.createdAt
                          ).toLocaleDateString()}
                        </p>
                        <p className={styles.value}>
                          <span className={styles.label}>Diperbarui: </span>
                          {new Date(
                            reportStatus.updatedAt
                          ).toLocaleDateString()}
                        </p>
                        <p className={styles.value}>
                          <span className={styles.label}>Ditangani oleh: </span>
                          {reportStatus.assignedTo}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progres penanganan */}
                <Card className={styles.sectionCard}>
                  <CardHeader>
                    <CardTitle className={styles.sectionTitle}>
                      <FileText className="w-5 h-5 text-[#A13D3D]" />
                      Progres Penanganan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-[#4a2a2a]">
                          Progres: {reportStatus.investigationProgress || 0}%
                        </span>
                        <span className="text-sm font-medium text-[#666666]">
                          {reportStatus.statusText}
                        </span>
                      </div>
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${reportStatus.investigationProgress || 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {reportStatus.status !== "COMPLETED" &&
                      reportStatus.nextStep && (
                        <div className="mt-3 p-3 border-l-4 border-[#A13D3D] bg-[#fff5f5] rounded-md text-sm text-[#4a2a2a]">
                          <div className="font-semibold mb-1">
                            Langkah selanjutnya
                          </div>
                          <p>{reportStatus.nextStep}</p>
                          {reportStatus.estimatedCompletion && (
                            <p className="mt-1">
                              <span className="font-semibold">
                                Perkiraan selesai:{" "}
                              </span>
                              {new Date(
                                reportStatus.estimatedCompletion
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Alasan penolakan (jika ada) */}
                {reportStatus.status === "REJECTED" &&
                  reportStatus.decisionNotes && (
                    <Card className={styles.sectionCard}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#9F1D1D]">
                          <AlertCircle className="w-5 h-5" />
                          Alasan Penolakan
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 rounded-md bg-[#FFF0F0] text-sm text-[#5b0000]">
                          {reportStatus.decisionNotes}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Dokumen pendukung */}
                {reportStatus.documents &&
                  reportStatus.documents.length > 0 && (
                    <Card className={styles.sectionCard}>
                      <CardHeader>
                        <CardTitle className={styles.sectionTitle}>
                          <FileText className="w-5 h-5 text-[#A13D3D]" />
                          Dokumen Pendukung / Bukti
                          {reportStatus.evidenceCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-2 bg-[#FDEBD0] text-[#7A5A00] border-none"
                            >
                              {reportStatus.evidenceCount} file
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className={styles.smallText}>
                          File bukti disimpan di server internal sistem Satgas
                          PPKS.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {reportStatus.documents.map((doc: any) => (
                            <div
                              key={doc.id}
                              className="border border-[#f0e0c2] rounded-lg p-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-[#4a2a2a] mb-1">
                                    {doc.fileName}
                                  </h4>
                                  <p className={styles.smallText}>
                                    {(doc.fileSize / 1024).toFixed(1)} KB •{" "}
                                    {doc.fileType}
                                  </p>
                                  {doc.description && (
                                    <p
                                      className={`${styles.smallText} mt-1`}
                                    >
                                      {doc.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-[#A13D3D] text-[#A13D3D]"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(
                                        `/api/documents/${doc.id}/download`
                                      );
                                      const data = await response.json();
                                      if (data.success) {
                                        window.open(data.url, "_blank");
                                      } else {
                                        alert("Gagal mendapatkan URL unduhan");
                                      }
                                    } catch (error) {
                                      alert(
                                        "Terjadi kesalahan saat mengunduh dokumen"
                                      );
                                    }
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Unduh
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Informasi tambahan */}
                <Card className={styles.sectionCard}>
                  <CardHeader>
                    <CardTitle className={styles.sectionTitle}>
                      <Shield className="w-5 h-5 text-[#A13D3D]" />
                      Informasi Tambahan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-[#4a2a2a]">
                        {reportStatus.status === "COMPLETED" ? (
                          <CheckCircle className="w-5 h-5 text-[#2f8a3a]" />
                        ) : (
                          <Clock className="w-5 h-5 text-[#A13D3D]" />
                        )}
                        <span>
                          {reportStatus.status === "COMPLETED"
                            ? "Proses penanganan laporan telah selesai."
                            : "Laporan sedang ditangani oleh tim Satgas PPKS secara bertahap."}
                        </span>
                      </div>

                      <div className={styles.smallText}>
                        <p className="mb-1.5">
                          Tim Satgas PPKS berkomitmen menjaga kerahasiaan
                          pelapor dan menangani setiap laporan secara adil,
                          profesional, dan humanis.
                        </p>
                        <p>
                          Untuk pertanyaan lebih lanjut, Anda dapat menghubungi
                          kontak resmi yang tercantum di laman utama sistem.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
