'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SchedulingStats {
  total: number;
  inProgress: number;
  scheduled: number;
  completed: number;
  pendingScheduling: number;
}

interface InProgressReport {
  id: string;
  reportNumber: string;
  title: string;
  reporter: {
    name: string;
    email: string;
  };
  createdAt: string;
  documentsCount: number;
}

export default function AutoSchedulingPage() {
  const sessionHook = useSession();
  const session = sessionHook?.data;
  const status = sessionHook?.status || 'loading';
  
  const [stats, setStats] = useState<SchedulingStats | null>(null);
  const [reports, setReports] = useState<InProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (session) {
      loadSchedulingData();
    }
  }, [session]);

  const loadSchedulingData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsResponse = await fetch('/api/reports/auto-schedule/stats?includeReports=true', {
        headers: {
          'Authorization': `Bearer ${(session as any)?.accessToken || ''}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data.stats);
        setReports(statsData.data.inProgressReports || []);
      }
    } catch (error) {
      console.error('Error loading scheduling data:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data penjadwalan' });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSchedule = async () => {
    if (!(session as any)?.user?.id) {
      setMessage({ type: 'error', text: 'Session tidak valid' });
      return;
    }

    try {
      setScheduling(true);
      setMessage(null);

      const response = await fetch('/api/reports/auto-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any)?.user?.accessToken || ''}`,
        },
        body: JSON.stringify({
          scheduledBy: (session as any).user.id,
          scheduleConfig: {
            defaultLocation: 'Ruang pertemuan satgas',
            defaultDuration: 2,
            autoAssignTeam: false
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `${data.message} Laporan yang dijadwalkan: ${data.data.scheduledCount}` 
        });
        
        // Refresh the data
        await loadSchedulingData();
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal melakukan penjadwalan otomatis' });
      }
    } catch (error) {
      console.error('Error scheduling reports:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat penjadwalan otomatis' });
    } finally {
      setScheduling(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600">Anda perlu login untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Penjadwalan Otomatis</h1>
          <p className="mt-2 text-gray-600">
            Kelola penjadwalan otomatis untuk laporan dengan status "in_progress"
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Total Laporan</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Scheduled</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Pending Schedule</h3>
              <p className="text-3xl font-bold text-red-600">{stats.pendingScheduling}</p>
            </div>
          </div>
        )}

        {/* Auto Schedule Button */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Penjadwalan Otomatis</h2>
          <p className="text-gray-600 mb-6">
            Klik tombol di bawah untuk menjadwalkan semua laporan dengan status "in_progress" 
            yang belum memiliki jadwal investigasi.
          </p>
          
          <button
            onClick={handleAutoSchedule}
            disabled={scheduling || (stats?.pendingScheduling || 0) === 0}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
              scheduling || (stats?.pendingScheduling || 0) === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {scheduling ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menjalankan Penjadwalan...
              </>
            ) : (
              'Jadwalkan Semua Laporan'
            )}
          </button>
          
          {stats && stats.pendingScheduling === 0 && (
            <p className="mt-3 text-sm text-gray-500">
              Semua laporan in_progress sudah memiliki jadwal investigasi.
            </p>
          )}
        </div>

        {/* In Progress Reports List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Laporan In Progress ({reports.length})
            </h2>
          </div>
          
          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nomor Laporan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelapor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Lapor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bukti
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.reportNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.reporter.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.documentsCount} file
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>Tidak ada laporan in progress yang perlu dijadwalkan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}