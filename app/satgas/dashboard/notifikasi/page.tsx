"use client";

import { useState, useEffect } from "react";
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
import { RoleGuard } from "../../../../components/auth/role-guard";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
  readAt?: string;
}

interface NotificationDetailModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

// Notification Detail Modal Component
function NotificationDetailModal({ notification, isOpen, onClose, onMarkAsRead }: NotificationDetailModalProps) {
  if (!isOpen || !notification) return null;

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
    onClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "REPORT_STATUS_CHANGED":
        return <AlertTriangle className="w-4 h-4" />;
      case "REPORT_ASSIGNED":
        return <Mail className="w-4 h-4" />;
      case "NEW_RECOMMENDATION":
        return <MessageCircle className="w-4 h-4" />;
      case "DECISION_MADE":
        return <CheckCircle className="w-4 h-4" />;
      case "DOCUMENT_UPLOADED":
        return <Mail className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (isRead: boolean) => {
    return isRead 
      ? <Badge variant="default">Dibaca</Badge>
      : <Badge variant="destructive">Belum Dibaca</Badge>;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "REPORT_STATUS_CHANGED":
        return <Badge variant="outline">Status Laporan</Badge>;
      case "REPORT_ASSIGNED":
        return <Badge variant="outline">Laporan Ditugaskan</Badge>;
      case "NEW_RECOMMENDATION":
        return <Badge variant="outline">Rekomendasi Baru</Badge>;
      case "DECISION_MADE":
        return <Badge variant="outline">Keputusan</Badge>;
      case "DOCUMENT_UPLOADED":
        return <Badge variant="outline">Pesan Kontak</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getEntityLink = () => {
    if (!notification.relatedEntityId || !notification.relatedEntityType) return null;
    
    switch (notification.relatedEntityType) {
      case 'REPORT':
        return `/satgas/dashboard/laporan/${notification.relatedEntityId}`;
      case 'CONTACT_MESSAGE':
        return `/satgas/dashboard/kontak`;
      default:
        return null;
    }
  };

  const entityLink = getEntityLink();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getNotificationIcon(notification.type)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {notification.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(notification.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pesan:</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {notification.message}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Jenis:</span>
                <div className="mt-1">
                  {getTypeBadge(notification.type)}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Status:</span>
                <div className="mt-1">
                  {getStatusBadge(notification.isRead)}
                </div>
              </div>
              {notification.readAt && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-900 dark:text-white">Dibaca pada:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(notification.readAt).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
              {entityLink && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-900 dark:text-white">Tindakan:</span>
                  <div className="mt-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={entityLink} target="_blank" rel="noopener noreferrer">
                        Lihat Detail {notification.relatedEntityType === 'REPORT' ? 'Laporan' : 'Pesan'}
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          {!notification.isRead && (
            <Button onClick={handleMarkAsRead} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Tandai Dibaca
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationManagementPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/notifications');
      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data.notifications);
      } else {
        setError(result.message || 'Gagal mengambil notifikasi');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Terjadi kesalahan saat mengambil notifikasi');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          isRead: true,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Open notification detail modal
  const openNotificationDetail = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    
    // Auto-mark as read when opening detail
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Apply filters when search term or status/type filter changes
  useEffect(() => {
    let result = notifications;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.relatedEntityType && notification.relatedEntityType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(notification => 
        statusFilter === "read" ? notification.isRead : !notification.isRead
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter(notification => 
        notification.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    setFilteredNotifications(result);
  }, [notifications, searchTerm, statusFilter, typeFilter]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "REPORT_STATUS_CHANGED":
        return <AlertTriangle className="w-4 h-4" />;
      case "REPORT_ASSIGNED":
        return <Mail className="w-4 h-4" />;
      case "NEW_RECOMMENDATION":
        return <MessageCircle className="w-4 h-4" />;
      case "DECISION_MADE":
        return <CheckCircle className="w-4 h-4" />;
      case "DOCUMENT_UPLOADED":
        return <Mail className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (isRead: boolean) => {
    return isRead 
      ? <Badge variant="default">Dibaca</Badge>
      : <Badge variant="destructive">Belum Dibaca</Badge>;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "REPORT_STATUS_CHANGED":
        return <Badge variant="outline">Status Laporan</Badge>;
      case "REPORT_ASSIGNED":
        return <Badge variant="outline">Laporan Ditugaskan</Badge>;
      case "NEW_RECOMMENDATION":
        return <Badge variant="outline">Rekomendasi Baru</Badge>;
      case "DECISION_MADE":
        return <Badge variant="outline">Keputusan</Badge>;
      case "DOCUMENT_UPLOADED":
        return <Badge variant="outline">Pesan Kontak</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Notifikasi</h1>
            <p className="text-gray-600 dark:text-gray-400">Lihat notifikasi terbaru dari sistem</p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            variant="outline"
            onClick={fetchNotifications}
            disabled={loading}
          >
            <Bell className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari notifikasi berdasarkan judul atau pesan..."
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
                  <option value="unread">Belum Dibaca</option>
                  <option value="read">Sudah Dibaca</option>
                </select>
                <select 
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Semua Jenis</option>
                  <option value="REPORT_STATUS_CHANGED">Status Laporan</option>
                  <option value="REPORT_ASSIGNED">Laporan Ditugaskan</option>
                  <option value="NEW_RECOMMENDATION">Rekomendasi Baru</option>
                  <option value="DECISION_MADE">Keputusan</option>
                  <option value="DOCUMENT_UPLOADED">Pesan Kontak</option>
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
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Memuat notifikasi...</h3>
                <p className="text-gray-500 dark:text-gray-400">Mohon tunggu sebentar</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Error</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                <Button onClick={fetchNotifications} variant="outline">
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Tidak ada notifikasi</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {notifications.length === 0 
                    ? "Belum ada notifikasi yang diterima." 
                    : "Tidak ada notifikasi yang sesuai dengan filter pencarian Anda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`hover:shadow-md transition-shadow ${
                  !notification.isRead 
                    ? 'bg-gray-50 dark:bg-gray-800 border-l-4 border-l-blue-500' 
                    : 'bg-white dark:bg-gray-900'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-medium truncate max-w-xs ${!notification.isRead ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm line-clamp-2 whitespace-pre-line">
                          {notification.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getTypeBadge(notification.type)}
                          {getStatusBadge(notification.isRead)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notification.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Tandai Dibaca
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openNotificationDetail(notification)}
                      >
                        Detail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Notification Detail Modal */}
        <NotificationDetailModal
          notification={selectedNotification}
          isOpen={isModalOpen}
          onClose={closeModal}
          onMarkAsRead={markAsRead}
        />
      </div>
    </RoleGuard>
  );
}