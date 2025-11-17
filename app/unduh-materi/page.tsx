import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen, Shield, Users, AlertTriangle, ArrowLeft } from "lucide-react";

export default function UnduhMateriPage() {
  const materials = [
    {
      id: 1,
      title: "Panduan Pelaporan Kekerasan Seksual",
      description: "Panduan lengkap tentang prosedur pelaporan kekerasan seksual di lingkungan kampus UIN Imam Bonjol.",
      category: "Panduan",
      fileSize: "2.5 MB",
      fileType: "PDF",
      downloads: 245,
      icon: FileText,
      color: "blue"
    },
    {
      id: 2,
      title: "Permendikbudristek No. 55 Tahun 2024",
      description: "Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi tentang Pencegahan dan Penanganan Kekerasan Seksual di Perguruan Tinggi.",
      category: "Regulasi",
      fileSize: "1.8 MB",
      fileType: "PDF",
      downloads: 189,
      icon: Shield,
      color: "red"
    },
    {
      id: 3,
      title: "Buku Saku Korban Kekerasan Seksual",
      description: "Buku panduan untuk korban kekerasan seksual berisi informasi hak-hak korban dan langkah-langkah yang harus dilakukan.",
      category: "Buku",
      fileSize: "4.2 MB",
      fileType: "PDF",
      downloads: 156,
      icon: BookOpen,
      color: "green"
    },
    {
      id: 4,
      title: "Formulir Laporan Kekerasan",
      description: "Formulir standar untuk pelaporan kasus kekerasan seksual yang dapat diunduh dan diisi secara offline.",
      category: "Formulir",
      fileSize: "850 KB",
      fileType: "DOCX",
      downloads: 312,
      icon: FileText,
      color: "purple"
    },
    {
      id: 5,
      title: "Materi Edukasi Pencegahan Kekerasan",
      description: "Paket materi edukasi lengkap untuk workshop dan seminar pencegahan kekerasan seksual.",
      category: "Materi Edukasi",
      fileSize: "15.6 MB",
      fileType: "ZIP",
      downloads: 98,
      icon: Users,
      color: "orange"
    },
    {
      id: 6,
      title: "Protokol Penanganan Darurat",
      description: "Prosedur darurat untuk menangani korban kekerasan seksual dalam kondisi kritis.",
      category: "Protokol",
      fileSize: "1.2 MB",
      fileType: "PDF",
      downloads: 134,
      icon: AlertTriangle,
      color: "red"
    }
  ];

  const categories = ["Semua", "Panduan", "Regulasi", "Buku", "Formulir", "Materi Edukasi", "Protokol"];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <a href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </a>
          </Button>
        </div>
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Download className="w-8 h-8 text-green-600" />
              Unduh Materi Satgas PPK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-green dark:prose-invert max-w-none text-center">
              <p className="text-lg">
                Akses berbagai materi edukasi, panduan, dan dokumen penting terkait
                pencegahan dan penanganan kekerasan seksual di kampus.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filter Kategori */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-full text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid Materi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => {
            const IconComponent = material.icon;
            return (
              <Card key={material.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getColorClasses(material.color)}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{material.title}</CardTitle>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {material.category}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {material.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{material.fileType} • {material.fileSize}</span>
                    <span>{material.downloads} unduhan</span>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Unduh
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Tambahan */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Penting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Cara Menggunakan Materi</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Baca dan pahami isi materi sebelum menggunakannya</li>
                  <li>Distribusikan materi ini untuk tujuan edukasi</li>
                  <li>Jangan mengubah isi materi tanpa izin</li>
                  <li>Laporkan jika menemukan kesalahan dalam materi</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Kontak Dukungan</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Jika Anda membutuhkan bantuan atau memiliki pertanyaan tentang materi:
                </p>
                <div className="text-sm">
                  <p><strong>Email:</strong> satgasppk@uinib.ac.id</p>
                  <p><strong>Telepon:</strong> +62 8xx-xxxx-xxxx</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}