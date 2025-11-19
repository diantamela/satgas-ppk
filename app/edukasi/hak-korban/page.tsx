import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Users,
  Heart,
  Scale,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function HakKorbanPage() {
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
            Hak Korban Dilindungi Negara & Kampus
          </span>
        </div>

        {/* HERO / INTRO */}
        <Card className="mb-8 border border-red-100/80 dark:border-red-900/40 bg-white/95 dark:bg-gray-950/95 shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-300/30 dark:bg-red-900/40 blur-3xl" />
          <CardHeader className="relative text-center">
            <CardTitle className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Hak Korban Kekerasan
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">
              Hak-hak korban kekerasan dijamin oleh undang-undang, kebijakan kampus,
              dan standar HAM internasional. Mengetahui hak ini membantu korban
              mendapatkan perlindungan dan pemulihan secara layak.
            </p>
          </CardContent>
        </Card>

        {/* LANDASAN HUKUM */}
        <Card className="mb-8 border border-red-100/80 dark:border-red-900/40 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-red-700 dark:text-red-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">Landasan Hukum</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Hak korban diatur secara tegas dalam regulasi nasional dan instrumen hukum
              internasional berikut:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4 py-1 bg-red-50/40 dark:bg-red-900/10 rounded-sm">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Undang-Undang No. 12 Tahun 2022
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tentang Tindak Pidana Kekerasan Seksual (TPKS).
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4 py-1 bg-red-50/40 dark:bg-red-900/10 rounded-sm">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Permendikbudristek No. 55 Tahun 2024
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tentang Pencegahan dan Penanganan Kekerasan Seksual di Lingkungan
                  Perguruan Tinggi.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4 py-1 bg-red-50/40 dark:bg-red-900/10 rounded-sm">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Konvensi CEDAW
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Konvensi PBB tentang penghapusan segala bentuk diskriminasi terhadap
                  perempuan, sebagai standar internasional perlindungan korban.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HAK-HAK KORBAN (GRID) */}
        <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Kelompok Hak Utama Korban Kekerasan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Hak Perlindungan */}
          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                </div>
                <CardTitle className="text-lg">Hak Perlindungan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak untuk Dilindungi</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Korban berhak mendapatkan perlindungan dari ancaman, intimidasi,
                      atau tindakan balasan dari pelaku maupun pihak lain.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Kerahasiaan</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Identitas dan informasi pribadi korban wajib dijaga kerahasiaannya,
                      termasuk dalam proses administratif dan hukum.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Keamanan</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Korban berhak atas jaminan keamanan fisik dan psikologis selama
                      proses penanganan hingga pasca kasus.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Hak Pendampingan */}
          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl">
                  <Users className="w-6 h-6 text-green-700 dark:text-green-300" />
                </div>
                <CardTitle className="text-lg">Hak Pendampingan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Pendamping</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Korban berhak didampingi oleh keluarga, teman, atau pendamping
                      profesional dalam setiap tahapan proses.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Dukungan Psikologis</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Berhak memperoleh layanan konseling dan dukungan psikologis untuk
                      mengatasi trauma dan dampak emosional.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Bantuan Hukum</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Mendapatkan pendampingan hukum, termasuk bantuan hukum gratis dari
                      lembaga yang berwenang.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Hak Proses Peradilan */}
          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl">
                  <Scale className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                </div>
                <CardTitle className="text-lg">Hak Proses Peradilan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak untuk Didengar</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Korban berhak didengar, dihargai, dan diperlakukan secara bermartabat
                      dalam setiap proses.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Informasi</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Berhak memperoleh informasi tentang perkembangan kasus, hak-hak yang
                      dimiliki, dan langkah yang sedang ditempuh.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Keadilan</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Berhak atas proses peradilan yang adil, tidak diskriminatif, dan
                      sesuai prinsip hukum yang berlaku.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Hak Rehabilitasi */}
          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl">
                  <Heart className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
                </div>
                <CardTitle className="text-lg">Hak Rehabilitasi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Pemulihan</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Mendapatkan dukungan untuk pemulihan fisik, psikologis, dan sosial
                      setelah kejadian kekerasan.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Kompensasi</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Berhak memperoleh kompensasi atas kerugian yang diderita, termasuk
                      biaya pengobatan dan kehilangan pendapatan.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Restitusi</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Berhak mendapatkan pemulihan hak-hak yang terlanggar akibat
                      kekerasan yang dialami.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* HAK KHUSUS KORBAN KEKERASAN SEKSUAL */}
        <Card className="mb-8 border border-red-100/80 dark:border-red-900/40 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-700 dark:text-red-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                Hak Khusus Korban Kekerasan Seksual
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 border border-red-100 dark:border-red-800/70">
              <p className="text-gray-800 dark:text-gray-100 text-sm md:text-base font-medium">
                Undang-Undang No. 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual
                memberikan perlindungan khusus bagi korban, termasuk layanan kesehatan,
                bantuan hukum, dan perlindungan dari stigma.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                    Hak atas Layanan Kesehatan
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Pemeriksaan kesehatan tanpa diskriminasi.</li>
                    <li>• Pengobatan luka fisik dan dukungan medis lanjutan.</li>
                    <li>• Tes kehamilan dan infeksi menular seksual.</li>
                    <li>• Konseling psikologis profesional.</li>
                  </ul>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                    Hak dalam Proses Peradilan
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Didampingi saksi ahli dan pendamping korban.</li>
                    <li>• Pemeriksaan di ruang terpisah dari pelaku.</li>
                    <li>• Perlindungan dari pertanyaan yang menyudutkan.</li>
                    <li>• Menghindari paparan berulang yang memicu trauma.</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                    Hak atas Perlindungan Khusus
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Perlindungan dari stigma dan victim blaming.</li>
                    <li>• Hak atas privasi, termasuk di ruang digital.</li>
                    <li>• Perlindungan dari ancaman dan pembalasan.</li>
                    <li>• Lingkungan pendidikan yang aman dan suportif.</li>
                  </ul>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                    Hak atas Kompensasi
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Kompensasi atas penderitaan dan kerugian materiil.</li>
                    <li>• Biaya pengobatan dan rehabilitasi.</li>
                    <li>• Penggantian kehilangan pendapatan.</li>
                    <li>• Biaya proses hukum dan pendampingan.</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HAK DI LINGKUNGAN KAMPUS */}
        <Card className="mb-8 border border-blue-100/80 dark:border-blue-900/40 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                <Users className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                Hak Korban di Lingkungan Kampus
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">
                  Hak Akademik
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Proses studi tidak boleh dirugikan karena melapor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Keringanan tugas atau penyesuaian akademik sementara.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perpanjangan tenggat waktu studi bila diperlukan.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perlindungan dari diskriminasi akademik.</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">
                  Hak Sosial di Kampus
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Kebebasan beraktivitas tanpa intimidasi di lingkungan kampus.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perlindungan dari bullying dan perundungan sejawat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Akses setara terhadap fasilitas kampus.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Dukungan komunitas dan organisasi kampus.</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Ketahui & Gunakan Hak Anda
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
              Jika Anda mengalami atau menyaksikan kekerasan, Anda berhak dilindungi
              dan didampingi. Gunakan hak Anda dan jangan ragu untuk menghubungi Satgas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-in?next=/laporkan-kasus"
                className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg transition-colors text-sm font-semibold"
              >
                Laporkan Kasus
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
