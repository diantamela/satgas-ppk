"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  FileText,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Shield,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function RektorDashboardPage() {
  // --------- MOCK DATA (ganti nanti dengan data dari API) ----------
  const summaryStats = {
    newReports: 5,
    underInvestigation: 5,
    finished: 5,
    rejected: 5,
  };

  // data pie chart tipe laporan
  const reportTypeData = [
    { name: "Kekerasan Fisik", value: 5, color: "#8B0000" },        // merah tua
    { name: "Kekerasan Verbal", value: 4, color: "#B75C5C" },       // merah muda
    { name: "Kekerasan Seksual", value: 3, color: "#000000" },      // hitam
    { name: "Kekerasan Berbasis Gender", value: 6, color: "#333333" }, // abu gelap
    { name: "Kekerasan Psikologis", value: 7, color: "#FFC233" },   // kuning
  ];

  const totalReports = reportTypeData.reduce((acc, cur) => acc + cur.value, 0);

  // Mock data for weekly and monthly statistics
  const weeklyStats = [
    { week: "Minggu 1", count: 12 },
    { week: "Minggu 2", count: 8 },
    { week: "Minggu 3", count: 15 },
    { week: "Minggu 4", count: 10 },
  ];

  const monthlyStats = [
    { month: "Januari", count: 45 },
    { month: "Februari", count: 52 },
    { month: "Maret", count: 38 },
    { month: "April", count: 61 },
    { month: "Mei", count: 49 },
    { month: "Juni", count: 55 },
  ];

  return (
    <RoleGuard requiredRoles={["REKTOR"]}>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header Dashboard */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="sm:flex hidden" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard Rektor
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Ringkasan laporan kekerasan dan distribusi jenis kasus.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KARTU STAT ATAS: mirip gambar (4 kotak besar angka 5) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Laporan Baru */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <FileText className="w-10 h-10 mb-2 text-gray-800" />
              <div className="text-4xl font-bold text-gray-900">
                {summaryStats.newReports}
              </div>
              <p className="mt-2 text-base font-semibold text-gray-800">
                Laporan Baru
              </p>
            </CardContent>
          </Card>

          {/* Dalam Investigasi */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <ClipboardList className="w-10 h-10 mb-2 text-gray-800" />
              <div className="text-4xl font-bold text-gray-900">
                {summaryStats.underInvestigation}
              </div>
              <p className="mt-2 text-base font-semibold text-gray-800">
                Dalam Investigasi
              </p>
            </CardContent>
          </Card>

          {/* Selesai */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <CheckCircle2 className="w-10 h-10 mb-2 text-gray-800" />
              <div className="text-4xl font-bold text-gray-900">
                {summaryStats.finished}
              </div>
              <p className="mt-2 text-base font-semibold text-gray-800">
                Selesai
              </p>
            </CardContent>
          </Card>

          {/* Ditolak */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <XCircle className="w-10 h-10 mb-2 text-gray-800" />
              <div className="text-4xl font-bold text-gray-900">
                {summaryStats.rejected}
              </div>
              <p className="mt-2 text-base font-semibold text-gray-800">
                Ditolak
              </p>
            </CardContent>
          </Card>
        </div>

        {/* PIE CHART TIPE LAPORAN */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold">
              Pie Chart Tipe Laporan
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Chart */}
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${value} laporan`,
                        name,
                      ]}
                    />
                    <Pie
                      data={reportTypeData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {reportTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend di tengah */}
              <div className="space-y-3">
                {reportTypeData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm md:text-base text-gray-800">
                        {item.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs md:text-sm">
                      {item.value} laporan
                    </Badge>
                  </div>
                ))}

                <p className="mt-4 text-xs text-gray-500">
                  Total laporan tercatat:{" "}
                  <span className="font-semibold">{totalReports}</span>
                </p>
              </div>

              {/* Statistik Mingguan dan Bulanan */}
              <div className="space-y-6">
                {/* Statistik Mingguan */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Laporan per Minggu
                  </h4>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="week"
                          fontSize={10}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis
                          fontSize={10}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          formatter={(value: any) => [`${value} laporan`, 'Jumlah']}
                        />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Statistik Bulanan */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Laporan per Bulan
                  </h4>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyStats.slice(0, 4)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          fontSize={10}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis
                          fontSize={10}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          formatter={(value: any) => [`${value} laporan`, 'Jumlah']}
                        />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
