"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  BookOpen,
  Shield,
  Users,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

export default function UnduhMateriPage() {
  const materials = [
    {
      id: 1,
      title: "Panduan Pelaporan Kekerasan Seksual",
      description:
        "Panduan lengkap tentang prosedur pelaporan kekerasan seksual di lingkungan kampus UIN Imam Bonjol.",
      category: "Panduan",
      fileSize: "2.5 MB",
      fileType: "PDF",
      downloads: 245,
      icon: FileText,
      color: "blue",
    },
    {
      id: 2,
      title: "Permendikbudristek No. 55 Tahun 2024",
      description:
        "Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi tentang Pencegahan dan Penanganan Kekerasan Seksual di Perguruan Tinggi.",
      category: "Regulasi",
      fileSize: "1.8 MB",
      fileType: "PDF",
      downloads: 189,
      icon: Shield,
      color: "red",
    },
    {
      id: 3,
      title: "Buku Saku Korban Kekerasan Seksual",
      description:
        "Buku panduan untuk korban kekerasan seksual berisi informasi hak-hak korban dan langkah-langkah yang harus dilakukan.",
      category: "Buku",
      fileSize: "4.2 MB",
      fileType: "PDF",
      downloads: 156,
      icon: BookOpen,
      color: "green",
    },
    {
      id: 4,
      title: "Formulir Laporan Kekerasan",
      description:
        "Formulir standar untuk pelaporan kasus kekerasan seksual yang dapat diunduh dan diisi secara offline.",
      category: "Formulir",
      fileSize: "850 KB",
      fileType: "DOCX",
      downloads: 312,
      icon: FileText,
      color: "purple",
    },
    {
      id: 5,
      title: "Materi Edukasi Pencegahan Kekerasan",
      description:
        "Paket materi edukasi lengkap untuk workshop dan seminar pencegahan kekerasan seksual.",
      category: "Materi Edukasi",
      fileSize: "15.6 MB",
      fileType: "ZIP",
      downloads: 98,
      icon: Users,
      color: "orange",
    },
    {
      id: 6,
      title: "Protokol Penanganan Darurat",
      description:
        "Prosedur darurat untuk menangani korban kekerasan seksual dalam kondisi kritis.",
      category: "Protokol",
      fileSize: "1.2 MB",
      fileType: "PDF",
      downloads: 134,
      icon: AlertTriangle,
      color: "red",
    },
  ];

  const categories = [
    "Semua",
    "Panduan",
    "Regulasi",
    "Buku",
    "Formulir",
    "Materi Edukasi",
    "Protokol",
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      green:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      purple:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      orange:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const filteredMaterials =
    selectedCategory === "Semua"
      ? materials
      : materials.filter((m) => 
          m.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* back button */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild className="px-0">
            <a href="/" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </a>
          </Button>
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 px-4 py-1 text-xs font-semibold tracking-wide">
            Materi resmi • Boleh didistribusikan untuk edukasi
          </span>
        </div>

        {/* hero */}
        <Card className="mb-8 border border-red-100/70 dark:border-red-900/40 bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 text-white shadow-2xl overflow-hidden">
          <CardHeader className="text-center space-y-3 py-8 relative z-10">
            <CardTitle className="text-3xl md:text-4xl font-extrabold flex items-center justify-center gap-3">
              <Download className="w-8 h-8" />
              Unduh Materi Satgas PPK
            </CardTitle>
            <p className="text-sm md:text-base max-w-3xl mx-auto text-yellow-50/90">
              Akses panduan, regulasi, buku saku, dan materi edukasi yang
              mendukung upaya pencegahan dan penanganan kekerasan seksual di
              kampus.
            </p>
          </CardHeader>
        </Card>

        {/* filter kategori */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={[
                  "px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all",
                  active
                    ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-500/40"
                    : "bg-white/90 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* grid materi */}
        {filteredMaterials.length === 0 ? (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
            Belum ada materi untuk kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => {
              const IconComponent = material.icon;
              return (
                <Card
                  key={material.id}
                  className="hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl ${getColorClasses(
                          material.color
                        )}`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base md:text-lg mb-1">
                          {material.title}
                        </CardTitle>
                        <span className="text-[11px] px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                          {material.category}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {material.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                      <span>
                        {material.fileType} • {material.fileSize}
                      </span>
                      <span>{material.downloads} unduhan</span>
                    </div>

                    <Button className="w-full bg-red-700 hover:bg-red-800 text-white text-sm">
                      <Download className="w-4 h-4 mr-2" />
                      Unduh
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* info tambahan */}
        <Card className="mt-8 bg-white/95 dark:bg-gray-950/95 border border-gray-200/80 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">
              Informasi Penggunaan Materi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Cara Menggunakan Materi</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Baca dan pahami isi materi sebelum menyebarkannya.</li>
                  <li>
                    Gunakan materi untuk kegiatan edukasi, sosialisasi, dan
                    workshop.
                  </li>
                  <li>Jangan mengubah isi materi tanpa persetujuan Satgas.</li>
                  <li>
                    Laporkan ke Satgas jika menemukan kekeliruan pada isi
                    dokumen.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Kontak Dukungan</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Jika mengalami kendala mengunduh atau membutuhkan format lain
                  dari materi:
                </p>
                <div className="space-y-1">
                  <p>
                    <strong>Email:</strong> satgasppk@uinib.ac.id
                  </p>
                  <p>
                    <strong>Telepon:</strong> +62 8xx-xxxx-xxxx
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
