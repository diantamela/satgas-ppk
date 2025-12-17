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
  Filter,
  Calendar as CalendarIcon,
  User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { RoleGuard } from "../../../../components/auth/role-guard";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface ConsultationMessage {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
  readAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ConsultationDetailModalProps {
  message: ConsultationMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

// Consultation Detail Modal Component
function ConsultationDetailModal({ message, isOpen, onClose, onMarkAsRead }: ConsultationDetailModalProps) {
  if (!isOpen || !message) return null;

  const handleMarkAsRead = () => {
    onMarkAsRead(message.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {message.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(message.createdAt).toLocaleString('id-ID')}
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
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pesan Konsultasi:</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {message.message}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Jenis:</span>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Mail className="w-3 h-3 mr-1" />
                    Pesan Konsultasi
                  </Badge>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Status:</span>
                <div className="mt-1">
                  {message.isRead ? (
                    <Badge variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Dibaca
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <Bell className="w-3 h-3 mr-1" />
                      Belum Dibaca
                    </Badge>
                  )}
                </div>
              </div>
              {message.readAt && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-900 dark:text-white">Dibaca pada:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(message.readAt).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          {!message.isRead && (
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

export default function KonsultasiPage() {
  const [consultations, setConsultations] = useState<ConsultationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredConsultations, setFilteredConsultations] = useState<ConsultationMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ConsultationMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch consultation messages from contact API
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/contact');
      const result = await response.json();
      
      if (result.success) {
        setConsultations(result.data.messages || []);
      } else {
        setError(result.message || 'Gagal mengambil konsultasi');
      }
    } catch (err) {
      console.error('Error fetching konsultasi:', err);
      setError('Terjadi kesalahan saat mengambil konsultasi');
    } finally {
      setLoading(false);
    }
  };

  // Mark consultation as read
  const markAsRead = async (messageId: string) => {
    try {
      // For consultation messages, we can mark them as read using the notifications API
      // since they are stored as notifications in the database
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: messageId,
          isRead: true,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setConsultations(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, isRead: true, readAt: new Date().toISOString() }
              : msg
          )
        );
      }
    } catch (err) {
      console.error('Error marking konsultasi as read:', err);
    }
  };

  // Open consultation detail modal
  const openMessageDetail = (message: ConsultationMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    
    // Auto-mark as read when opening detail
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  // Load consultations on component mount
  useEffect(() => {
    fetchConsultations();
  }, []);

  // Apply filters when search term or date filter changes
  useEffect(() => {
    let result = consultations;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(message => 
        message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (selectedDateRange?.from && selectedDateRange?.to) {
      result = result.filter(message => {
        const messageDate = new Date(message.createdAt);
        const fromDate = new Date(selectedDateRange.from!);
        const toDate = new Date(selectedDateRange.to!);
        
        // Set toDate to end of day
        toDate.setHours(23, 59, 59, 999);
        
        return messageDate >= fromDate && messageDate <= toDate;
      });
    }

    setFilteredConsultations(result);
  }, [consultations, searchTerm, selectedDateRange]);

  return (
    <RoleGuard>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Konsultasi</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola pesan konsultasi dari form kontak masyarakat</p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            variant="outline"
            onClick={fetchConsultations}
            disabled={loading}
          >
            <Mail className="w-4 h-4 mr-2" />
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
                    placeholder="Cari konsultasi berdasarkan judul atau pesan..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
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
                  <Filter className="w-4 h-4 mr-1" />
                  Reset
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Memuat konsultasi...</h3>
                <p className="text-gray-500 dark:text-gray-400">Mohon tunggu sebentar</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Error</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                <Button onClick={fetchConsultations} variant="outline">
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          ) : filteredConsultations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Tidak ada konsultasi</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {consultations.length === 0 
                    ? "Belum ada konsultasi yang diterima." 
                    : "Tidak ada konsultasi yang sesuai dengan filter pencarian Anda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredConsultations.map((message) => (
              <Card 
                key={message.id} 
                className={`hover:shadow-md transition-shadow ${
                  !message.isRead 
                    ? 'bg-gray-50 dark:bg-gray-800 border-l-4 border-l-blue-500' 
                    : 'bg-white dark:bg-gray-900'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-medium truncate max-w-xs ${!message.isRead ? 'font-bold' : ''}`}>
                            {message.title}
                          </h3>
                          {!message.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm line-clamp-2 whitespace-pre-line">
                          {message.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Mail className="w-3 h-3 mr-1" />
                            Pesan Konsultasi
                          </Badge>
                          {message.isRead ? (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Dibaca
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <Bell className="w-3 h-3 mr-1" />
                              Belum Dibaca
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(message.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!message.isRead && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAsRead(message.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Tandai Dibaca
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openMessageDetail(message)}
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

        {/* Consultation Detail Modal */}
        <ConsultationDetailModal
          message={selectedMessage}
          isOpen={isModalOpen}
          onClose={closeModal}
          onMarkAsRead={markAsRead}
        />
      </div>
    </RoleGuard>
  );
}
