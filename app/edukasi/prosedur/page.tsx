import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, Shield, Users, Phone, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ProsedurLaporanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Prosedur Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Panduan lengkap untuk melaporkan kasus kekerasan di lingkungan kampus UIN Imam Bonjol
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mekanisme Pelaporan */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Mekanisme Pelaporan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Satgas PPK UIN Imam Bonjol menyediakan berbagai kanal pelaporan yang aman, rahasia,
                dan dapat diakses 24 jam untuk memudahkan korban melaporkan kasus kekerasan.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">Kanal Pelaporan:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Platform digital online (website/formulir)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>WhatsApp: +62 812 3456 7890</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Email: satgasppk@uinib.ac.id</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Konsultasi langsung dengan petugas Satgas</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">Prinsip Pelaporan:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Rahasia dan aman</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Tanpa biaya</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Dapat dilakukan anonim</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Ditangani secara profesional</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tahapan Pelaporan */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Tahapan Pelaporan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Persiapan Laporan</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Kumpulkan informasi yang diperlukan untuk melengkapi laporan
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Identitas korban (opsional untuk laporan anonim)</li>
                    <li>• Kronologi kejadian secara detail</li>
                    <li>• Waktu, tempat, dan saksi-saksi kejadian</li>
                    <li>• Bukti-bukti pendukung (foto, pesan, dll)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Pengajuan Laporan</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Ajukan laporan melalui kanal yang tersedia
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Pilih kanal pelaporan yang nyaman</li>
                    <li>• Isi formulir laporan dengan lengkap</li>
                    <li>• Lampirkan bukti-bukti yang ada</li>
                    <li>• Konfirmasi pengiriman laporan</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Verifikasi Awal</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Tim Satgas melakukan verifikasi awal terhadap laporan
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Pengecekan kelengkapan data</li>
                    <li>• Validasi informasi awal</li>
                    <li>• Penilaian tingkat urgensi</li>
                    <li>• Waktu: Maksimal 3 hari kerja</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Penanganan Kasus</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Proses penanganan sesuai dengan tingkat keparahan kasus
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Investigasi mendalam</li>
                    <li>• Pendampingan korban</li>
                    <li>• Koordinasi dengan pihak terkait</li>
                    <li>• Tindakan pencegahan</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Tindak Lanjut</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Pelaporan hasil penanganan dan rekomendasi
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Laporan hasil investigasi</li>
                    <li>• Rekomendasi tindakan</li>
                    <li>• Monitoring dan evaluasi</li>
                    <li>• Penutupan kasus</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Waktu Respon */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-lg">Waktu Respon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    !
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400">Laporan Darurat</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Maksimal 1 jam</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700 dark:text-orange-400">Laporan Biasa</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Maksimal 24 jam</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">Verifikasi Awal</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Maksimal 3 hari kerja</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Penanganan Lengkap</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Sesuai kompleksitas kasus</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Perlindungan Korban */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Perlindungan Korban</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-400">Selama Proses</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perlindungan dari ancaman balasan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Kerahasiaan identitas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pendampingan psikologis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Bantuan hukum</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-400">Setelah Proses</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Monitoring kondisi korban</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Rekomendasi tindakan pencegahan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Dukungan rehabilitasi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Follow-up berkala</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kontak Darurat */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <Phone className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-lg">Kontak Darurat</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Satgas PPK UIN Imam Bonjol</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>WhatsApp:</strong> +62 812 3456 7890</p>
                    <p><strong>Email:</strong> satgasppk@uinib.ac.id</p>
                    <p><strong>Telepon:</strong> +62 123 4567 890</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Layanan Eksternal</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>SAPA 129:</strong> Layanan kesehatan jiwa</p>
                    <p><strong>KPAI:</strong> Komisi Perlindungan Anak Indonesia</p>
                    <p><strong>Layanan Kesehatan Terdekat</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Siap Melaporkan?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Laporkan kasus kekerasan sekarang juga. Kami siap membantu Anda dengan aman dan rahasia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-in?next=/laporkan-kasus"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Laporkan Kasus Sekarang
              </Link>
              <Link
                href="/kontak"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Hubungi Kami
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}