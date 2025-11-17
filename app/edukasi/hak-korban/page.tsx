import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Heart, Scale, BookOpen, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function HakKorbanPage() {
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
              <CardTitle className="text-3xl font-bold">Hak Korban</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Hak-hak korban kekerasan yang dijamin oleh undang-undang dan kebijakan kampus
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Landasan Hukum */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-lg">Landasan Hukum</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold">Undang-Undang No. 12 Tahun 2022</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tentang Tindak Pidana Kekerasan Seksual (TPKS)
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold">Permendikbudristek No. 55 Tahun 2024</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tentang Pencegahan dan Penanganan Kekerasan Seksual di Lingkungan Perguruan Tinggi
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold">Konvensi CEDAW (Convention on the Elimination of All Forms of Discrimination Against Women)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Konvensi PBB tentang penghapusan segala bentuk diskriminasi terhadap perempuan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hak-Hak Korban */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Hak Perlindungan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak untuk Dilindungi</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Korban berhak mendapatkan perlindungan dari segala bentuk ancaman, intimidasi,
                      atau tindakan balasan dari pelaku atau pihak lain.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Kerahasiaan</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Identitas korban, informasi pribadi, dan detail kasus harus dijaga kerahasiaannya
                      sesuai permintaan korban.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Keamanan</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Korban berhak mendapatkan jaminan keamanan fisik dan psikologis selama proses
                      penanganan kasus.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Hak Pendampingan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Pendamping</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Korban berhak didampingi oleh keluarga, teman, atau pendamping profesional
                      selama proses penanganan.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Dukungan Psikologis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Mendapatkan layanan konseling dan dukungan psikologis untuk mengatasi trauma
                      dan dampak psikologis.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Bantuan Hukum</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Mendapatkan pendampingan hukum gratis dari pengacara atau lembaga bantuan hukum.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Hak Proses Peradilan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak untuk Didengar</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Korban berhak untuk didengar, dihormati, dan diperlakukan secara adil
                      dalam setiap proses penanganan.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Informasi</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Berhak mendapatkan informasi lengkap tentang perkembangan kasus,
                      hak-hak yang dimiliki, dan proses yang sedang berlangsung.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Keadilan</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Berhak atas proses peradilan yang adil, tidak memihak, dan sesuai dengan
                      prinsip-prinsip hukum yang berlaku.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                  <Heart className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-lg">Hak Rehabilitasi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Pemulihan</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Mendapatkan dukungan untuk pemulihan fisik, psikologis, dan sosial
                      pasca kejadian kekerasan.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Kompensasi</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Berhak mendapatkan kompensasi atas kerugian yang diderita,
                      termasuk biaya pengobatan dan kehilangan pendapatan.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Hak atas Restitusi</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Berhak mendapatkan pengembalian hak-hak yang dirampas akibat kekerasan
                      yang dialami.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Hak Khusus Korban Kekerasan Seksual */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-lg">Hak Khusus Korban Kekerasan Seksual</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Berdasarkan Undang-Undang No. 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual,
                korban kekerasan seksual memiliki hak-hak khusus yang dijamin oleh negara.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Hak atas Layanan Kesehatan</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Pemeriksaan kesehatan gratis</li>
                    <li>• Pengobatan luka dan cedera</li>
                    <li>• Tes kehamilan dan PMS</li>
                    <li>• Konseling psikologis</li>
                    <li>• Dukungan reproduksi seksual</li>
                  </ul>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Hak dalam Proses Peradilan</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Saksi ahli pendamping</li>
                    <li>• Pemeriksaan di ruang terpisah</li>
                    <li>• Perlindungan dari secondary trauma</li>
                    <li>• Hak untuk tidak dihadirkan di persidangan</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Hak atas Perlindungan Khusus</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Perlindungan dari stigma sosial</li>
                    <li>• Hak atas privasi digital</li>
                    <li>• Perlindungan dari pembalasan</li>
                    <li>• Hak atas pendidikan yang aman</li>
                  </ul>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Hak atas Kompensasi</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Kompensasi atas penderitaan</li>
                    <li>• Biaya pengobatan dan rehabilitasi</li>
                    <li>• Kehilangan pendapatan</li>
                    <li>• Biaya hukum dan pendampingan</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hak di Lingkungan Kampus */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Hak Korban di Lingkungan Kampus</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400">Hak Akademik</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Kuliah tidak terganggu proses hukum</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Keringanan tugas akademik sementara</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perpanjangan tenggat waktu studi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perlindungan dari diskriminasi akademik</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400">Hak Sosial</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Kebebasan beraktivitas di kampus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perlindungan dari bullying sejawat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Akses fasilitas kampus yang sama</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Dukungan komunitas kampus</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Ketahui Hak Anda</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Jika Anda mengalami kekerasan, segera hubungi kami. Hak-hak Anda akan dilindungi sepenuhnya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-in?next=/laporkan-kasus"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Laporkan Kasus
              </Link>
              <Link
                href="/kontak"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Hubungi Pendamping
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}