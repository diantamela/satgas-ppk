import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Clock,
  Shield,
  Users,
  Phone,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function ProsedurLaporanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* HEADER + BADGE */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>

          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 px-4 py-1 text-xs font-semibold tracking-wide">
            <Shield className="w-4 h-4" />
            Panduan Laporan Aman & Rahasia
          </span>
        </div>

        {/* HERO / INTRO */}
        <Card className="mb-8 border border-red-100/80 dark:border-red-900/40 bg-white/95 dark:bg-gray-950/95 shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-300/30 dark:bg-red-900/40 blur-3xl" />
          <CardHeader className="relative text-center">
            <CardTitle className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Prosedur Laporan Kekerasan
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">
              Panduan langkah demi langkah untuk melaporkan kasus kekerasan di
              lingkungan kampus UIN Imam Bonjol, dengan mengedepankan
              kerahasiaan dan keberpihakan pada korban.
            </p>
          </CardContent>
        </Card>

        {/* MEKANISME PELAPORAN */}
        <Card className="mb-8 border border-red-100/80 dark:border-red-900/40 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl">
                <FileText className="w-6 h-6 text-red-700 dark:text-red-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                Mekanisme Pelaporan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6 border border-yellow-100 dark:border-yellow-800/60">
              <p className="text-gray-800 dark:text-gray-100 text-sm md:text-base font-medium">
                Satgas PPK UIN Imam Bonjol menyediakan berbagai kanal pelaporan
                yang aman, rahasia, dan dapat diakses 24 jam untuk memudahkan
                korban, saksi, atau pihak yang mengetahui kejadian kekerasan.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Kanal Pelaporan:
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Platform digital online (website / formulir laporan).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>WhatsApp Satgas: +62 812 3456 7890.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Email: satgasppk@uinib.ac.id.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Konsultasi langsung dengan petugas Satgas di sekretariat.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Prinsip Pelaporan:
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Rahasia dan aman bagi pelapor dan korban.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Tanpa biaya (gratis).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Dapat dilakukan secara anonim.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Ditangani oleh tim yang terlatih dan profesional.</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TAHAPAN PELAPORAN */}
        <Card className="mb-8 border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl">
                <Clock className="w-6 h-6 text-green-700 dark:text-green-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                Tahapan Pelaporan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-sm md:text-base text-gray-700 dark:text-gray-200">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    Persiapan Laporan
                  </h4>
                  <p className="mb-2">
                    Kumpulkan informasi dasar yang membantu memperjelas
                    kronologi.
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>• Identitas korban (opsional untuk laporan anonim).</li>
                    <li>• Kronologi kejadian secara berurutan.</li>
                    <li>• Waktu, tempat, dan saksi-saksi kejadian.</li>
                    <li>• Bukti pendukung (pesan, foto, rekaman, dsb.).</li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    Pengajuan Laporan
                  </h4>
                  <p className="mb-2">
                    Laporkan melalui kanal yang dirasa paling nyaman dan aman.
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>• Pilih kanal pelaporan yang tersedia.</li>
                    <li>• Isi formulir laporan dengan jelas dan jujur.</li>
                    <li>• Lampirkan bukti yang dimiliki.</li>
                    <li>• Simpan bukti pengajuan laporan (jika ada).</li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    Verifikasi Awal
                  </h4>
                  <p className="mb-2">
                    Tim Satgas melakukan verifikasi awal terhadap laporan yang
                    masuk.
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>• Pengecekan kelengkapan data laporan.</li>
                    <li>• Validasi informasi awal dengan pelapor (bila perlu).</li>
                    <li>• Penilaian tingkat urgensi kasus.</li>
                    <li>• Waktu verifikasi maksimal 3 hari kerja.</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    Penanganan Kasus
                  </h4>
                  <p className="mb-2">
                    Proses penanganan dilakukan sesuai tingkat keparahan dan
                    kebutuhan korban.
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>• Investigasi mendalam oleh tim Satgas.</li>
                    <li>• Pendampingan psikologis dan hukum bagi korban.</li>
                    <li>• Koordinasi dengan unit/fakultas dan pihak eksternal (bila perlu).</li>
                    <li>• Penerapan langkah pencegahan lanjutan.</li>
                  </ul>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    Tindak Lanjut & Penutupan
                  </h4>
                  <p className="mb-2">
                    Satgas menyampaikan hasil penanganan dan rekomendasi tindak
                    lanjut.
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>• Laporan hasil investigasi kepada pihak terkait.</li>
                    <li>• Rekomendasi sanksi dan/atau pemulihan.</li>
                    <li>• Monitoring pelaksanaan rekomendasi.</li>
                    <li>• Penutupan kasus dengan tetap memperhatikan kondisi korban.</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WAKTU RESPON */}
        <Card className="mb-8 border border-yellow-100/80 dark:border-yellow-900/40 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                Standar Waktu Respon
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    !
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-300">
                      Laporan Darurat
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Ditangani maksimal dalam waktu{" "}
                      <span className="font-semibold">1 jam</span>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300">
                      Laporan Non-Darurat
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Respon awal maksimal{" "}
                      <span className="font-semibold">24 jam</span>.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                      Verifikasi Awal
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Proses verifikasi maksimal{" "}
                      <span className="font-semibold">3 hari kerja</span>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-300">
                      Penanganan Lengkap
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Durasi penanganan menyesuaikan{" "}
                      <span className="font-semibold">kompleksitas kasus</span>,
                      dengan tetap menginformasikan perkembangan kepada korban.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PERLINDUNGAN KORBAN */}
        <Card className="mb-8 border border-purple-100/80 dark:border-purple-900/40 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl">
                <Shield className="w-6 h-6 text-purple-700 dark:text-purple-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                Perlindungan Korban
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-300">
                  Selama Proses Penanganan
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perlindungan dari ancaman dan intimidasi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Kerahasiaan identitas pelapor dan korban.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pendampingan psikologis oleh tenaga profesional.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Bantuan dan rujukan bantuan hukum.</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-300">
                  Setelah Proses Penanganan
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Monitoring kondisi korban secara berkala.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Rekomendasi pemulihan akademik/pekerjaan.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Dukungan rehabilitasi lanjutan bila dibutuhkan.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Follow-up untuk memastikan lingkungan tetap aman.</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KONTAK DARURAT */}
        <Card className="mb-8 border border-red-100/80 dark:border-red-900/40 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl">
                <Phone className="w-6 h-6 text-red-700 dark:text-red-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                Kontak Darurat & Layanan Pendukung
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/70">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                    Satgas PPK UIN Imam Bonjol
                  </h4>
                  <div className="space-y-1 text-gray-700 dark:text-gray-200">
                    <p>
                      <strong>WhatsApp:</strong> +62 812 3456 7890
                    </p>
                    <p>
                      <strong>Email:</strong> satgasppk@uinib.ac.id
                    </p>
                    <p>
                      <strong>Telepon:</strong> +62 123 4567 890
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/70">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    Layanan Eksternal
                  </h4>
                  <div className="space-y-1 text-gray-700 dark:text-gray-200">
                    <p>
                      <strong>SAPA 129:</strong> Layanan perlindungan perempuan & anak.
                    </p>
                    <p>
                      <strong>KPAI:</strong> Komisi Perlindungan Anak Indonesia.
                    </p>
                    <p>
                      <strong>Fasilitas kesehatan terdekat</strong> untuk
                      penanganan medis segera.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA: LAPOR / KONTAK */}
        <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Siap Melaporkan?
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
              Anda tidak sendiri. Laporkan kasus kekerasan yang Anda alami atau
              saksikan. Satgas akan mendampingi dengan aman, rahasia, dan tanpa
              menghakimi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-in?next=/laporkan-kasus"
                className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg transition-colors text-sm font-semibold"
              >
                Laporkan Kasus Sekarang
              </Link>
              <Link
                href="/kontak"
                className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg transition-colors text-sm font-semibold"
              >
                Konsultasi dengan Satgas
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
