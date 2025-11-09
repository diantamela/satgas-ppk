"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Bell,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { RoleGuard } from "../role-guard";

export default function NotificationManagementPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      reportNumber: "SPPK-20241015-1001",
      recipient: "pelapor@example.com",
      type: "email",
      message: "Laporan Anda telah diterima dan sedang diproses",
      status: "sent",
      sentAt: "2024-10-15T10:30:00Z",
      reportId: 1
    },
    {
      id: 2,
      reportNumber: "SPPK-20241014-2002",
      recipient: "081234567890",
      type: "whatsapp",
      message: "Terima kasih telah melaporkan kasus ini. Tim kami sedang menanganinya.",
      status: "delivered",
      sentAt: "2024-10-14T14:20:00Z",
      reportId: 2
    },
    {
      id: 3,
      reportNumber: "SPPK-20241015-1001",
      recipient: "rektor@universitas.ac.id",
      type: "email",
      message: "Laporan investigasi terbaru memerlukan perhatian Anda",
      status: "pending",
      sentAt: null,
      reportId: 1
    }
  ]);
  const [filteredNotifications, setFilteredNotifications] = useState(notifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Apply filters when search term or status/type filter changes
  useState(() => {
    let result = notifications;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(notification => 
        notification.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(notification => notification.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter(notification => notification.type === typeFilter);
    }

    setFilteredNotifications(result);
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4" />;
      case "sms":
        return <Phone className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Menunggu</Badge>;
      case "sent":
        return <Badge variant="default">Terkirim</Badge>;
      case "delivered":
        return <Badge variant="success">Diterima</Badge>;
      case "failed":
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "email":
        return <Badge variant="outline">Email</Badge>;
      case "whatsapp":
        return <Badge variant="outline">WhatsApp</Badge>;
      case "sms":
        return <Badge variant="outline">SMS</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <RoleGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Notifikasi</h1>
              <p className="text-gray-600 dark:text-gray-400">Kelola dan lacak notifikasi yang dikirim</p>
            </div>
            <Button className="mt-4 md:mt-0">
              <Send className="w-4 h-4 mr-2" />
              Kirim Notifikasi
            </Button>
          </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari notifikasi berdasarkan nomor laporan atau penerima..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="sent">Terkirim</option>
                  <option value="delivered">Diterima</option>
                  <option value="failed">Gagal</option>
                </select>
                <select 
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Semua Jenis</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
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
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Tidak ada notifikasi</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {notifications.length === 0 
                    ? "Belum ada notifikasi yang dikirim." 
                    : "Tidak ada notifikasi yang sesuai dengan filter pencarian Anda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium truncate max-w-xs">{notification.reportNumber}</h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{notification.recipient}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getTypeBadge(notification.type)}
                          {getStatusBadge(notification.status)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {notification.sentAt ? new Date(notification.sentAt).toLocaleString() : "Belum dikirim"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4 mr-1" />
                        Kirim Ulang
                      </Button>
                      <Button variant="outline" size="sm">
                        Detail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Kirim Notifikasi Baru
            </CardTitle>
            <CardDescription>
              Kirim notifikasi ke pelapor, terlapor, atau pihak terkait
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nomor Laporan
                  </label>
                  <Input placeholder="Masukkan nomor laporan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jenis Notifikasi
                  </label>
                  <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800">
                    <option value="">Pilih jenis notifikasi</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Penerima
                </label>
                <Input placeholder="Alamat email atau nomor telepon" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pesan
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 h-32"
                  placeholder="Tulis pesan notifikasi..."
                ></textarea>
              </div>
              
              <Button className="w-full md:w-auto">
                <Send className="w-4 h-4 mr-2" />
                Kirim Notifikasi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}