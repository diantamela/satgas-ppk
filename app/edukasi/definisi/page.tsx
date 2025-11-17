import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Users, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DefinisiKekerasanPage() {
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
              <CardTitle className="text-3xl font-bold">Definisi Kekerasan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Pemahaman mendalam tentang berbagai bentuk kekerasan yang dapat terjadi di lingkungan kampus
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
                <h4 className="font-semibold">Peraturan Rektor UIN Imam Bonjol</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tentang Pencegahan dan Penanganan Kekerasan di Lingkungan Kampus
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Definisi Umum Kekerasan */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Definisi Umum Kekerasan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Kekerasan adalah setiap perbuatan yang dilakukan seseorang atau sekelompok orang terhadap orang lain
                yang menyebabkan atau mungkin menyebabkan bahaya, kerugian, penderitaan fisik, psikis, seksual, atau
                kerugian ekonomi, termasuk ancaman untuk melakukan perbuatan tersebut.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Kekerasan dapat terjadi dalam berbagai bentuk dan intensitas, mulai dari yang ringan hingga yang sangat
              serius. Penting untuk memahami bahwa kekerasan tidak hanya terbatas pada tindakan fisik, tetapi juga
              mencakup aspek psikologis, seksual, dan sosial.
            </p>
          </CardContent>
        </Card>

        {/* Jenis-jenis Kekerasan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kekerasan Fisik</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tindakan yang menyebabkan atau berpotensi menyebabkan cedera fisik pada korban.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Pukulan, tendangan, atau tamparan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Dorongan atau tarikan yang kasar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Penggunaan benda untuk melukai</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Pembatasan gerak fisik</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kekerasan Verbal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Penggunaan kata-kata yang menyakiti, menghina, atau merendahkan martabat korban.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Penggunaan kata-kata kasar atau umpatan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Penghinaan atau ejekan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Ancaman verbal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Penyebaran rumor atau fitnah</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kekerasan Seksual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Setiap perbuatan yang bersifat seksual yang dilakukan tanpa persetujuan atau dengan paksaan.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Pelecehan seksual (verbal/non-verbal)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Pemerkosaan atau percobaan pemerkosaan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Paksaan hubungan seksual</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Eksploitasi seksual</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kekerasan Psikologis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tindakan yang menyebabkan kerugian atau penderitaan mental dan emosional.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Gaslighting atau manipulasi mental</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Isolasi sosial</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Kontrol berlebihan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Penolakan atau pengabaian emosional</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Kekerasan Berbasis Gender Online */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-lg">Kekerasan Berbasis Gender Online (KBGO)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Kekerasan yang terjadi melalui platform digital dan media sosial yang menargetkan korban berdasarkan gender.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Cyberbullying atau perundungan online</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Penyebaran gambar pribadi tanpa izin (revenge porn)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Stalking atau penguntitan online</span>
                </li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Pemerasan seksual online (sextortion)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Penyebaran hoax atau informasi palsu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Body shaming atau komentar merendahkan</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Dampak Kekerasan */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-lg">Dampak Kekerasan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">Dampak Fisik</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Cedera dan luka fisik</li>
                  <li>• Gangguan kesehatan jangka panjang</li>
                  <li>• Kehamilan yang tidak diinginkan</li>
                  <li>• Penyakit menular seksual</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">Dampak Psikologis</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Trauma dan gangguan mental</li>
                  <li>• Depresi dan kecemasan</li>
                  <li>• Gangguan tidur</li>
                  <li>• Penurunan kepercayaan diri</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">Dampak Sosial</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Isolasi sosial</li>
                  <li>• Kesulitan dalam hubungan</li>
                  <li>• Masalah akademik/performa kerja</li>
                  <li>• Stigma sosial</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">Dampak Ekonomi</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Kehilangan pendapatan</li>
                  <li>• Biaya pengobatan</li>
                  <li>• Biaya hukum</li>
                  <li>• Kesulitan finansial jangka panjang</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Paham Definisi Kekerasan?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Pelajari lebih lanjut tentang prosedur pelaporan dan hak-hak korban kekerasan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/edukasi/prosedur"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Prosedur Laporan
              </Link>
              <Link
                href="/edukasi/hak-korban"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Hak Korban
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}