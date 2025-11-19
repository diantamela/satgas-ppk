import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Users, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DefinisiKekerasanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* BACK + BADGE */}
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
            Kenali, Cegah, dan Laporkan Kekerasan
          </span>
        </div>

        {/* HERO / INTRO */}
        <Card className="mb-8 border border-red-100/80 dark:border-red-900/40 bg-white/95 dark:bg-gray-950/95 shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-300/30 dark:bg-red-900/40 blur-3xl" />
          <CardHeader className="relative text-center">
            <CardTitle className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Definisi Kekerasan di Lingkungan Kampus
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">
              Pemahaman yang jelas tentang berbagai bentuk kekerasan membantu sivitas akademika
              mengenali tanda-tanda, mencegah, dan berani melapor ketika kekerasan terjadi.
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
              <CardTitle className="text-lg md:text-xl">
                Landasan Hukum
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Definisi dan penanganan kekerasan di lingkungan kampus merujuk pada regulasi nasional
              dan aturan internal perguruan tinggi berikut:
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
                  Tentang Pencegahan dan Penanganan Kekerasan Seksual di Lingkungan Perguruan Tinggi.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4 py-1 bg-red-50/40 dark:bg-red-900/10 rounded-sm">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Peraturan Rektor UIN Imam Bonjol
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tentang pencegahan dan penanganan kekerasan di lingkungan kampus sebagai turunan regulasi nasional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DEFINISI UMUM */}
        <Card className="mb-8 border border-yellow-100/80 dark:border-yellow-900/40 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                Definisi Umum Kekerasan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4 border border-yellow-100 dark:border-yellow-800/60">
              <p className="text-gray-800 dark:text-gray-100 text-sm md:text-base font-medium leading-relaxed">
                Kekerasan adalah setiap perbuatan yang dilakukan seseorang atau sekelompok orang terhadap
                orang lain yang menyebabkan atau mungkin menyebabkan bahaya, kerugian, atau penderitaan
                fisik, psikis, seksual, atau kerugian ekonomi, termasuk ancaman untuk melakukan perbuatan tersebut.
              </p>
            </div>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              Kekerasan dapat terjadi dalam berbagai bentuk dan intensitas, dari yang tampak jelas
              hingga yang sulit dikenali. Kekerasan tidak hanya berupa tindakan fisik, tetapi juga
              mencakup aspek psikologis, seksual, sosial, dan ekonomi yang memengaruhi martabat serta
              keselamatan korban.
            </p>
          </CardContent>
        </Card>

        {/* JENIS-JENIS KEKERASAN */}
        <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Bentuk-Bentuk Kekerasan yang Umum Terjadi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
            <CardHeader>
              <CardTitle className="text-lg">Kekerasan Fisik</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Tindakan yang menyebabkan atau berpotensi menyebabkan cedera fisik pada korban.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Pukulan, tendangan, atau tamparan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Dorongan atau tarikan yang kasar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Penggunaan benda untuk melukai.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Pembatasan gerak fisik.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
            <CardHeader>
              <CardTitle className="text-lg">Kekerasan Verbal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Penggunaan kata-kata yang menyakiti, menghina, atau merendahkan martabat korban.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Penggunaan kata-kata kasar atau umpatan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Penghinaan atau ejekan yang merendahkan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Ancaman verbal yang menakut-nakuti.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Penyebaran rumor atau fitnah.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
            <CardHeader>
              <CardTitle className="text-lg">Kekerasan Seksual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Setiap perbuatan yang bersifat seksual yang dilakukan tanpa persetujuan atau dengan paksaan.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Pelecehan seksual (verbal/non-verbal).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Pemerkosaan atau percobaan pemerkosaan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Paksaan hubungan seksual.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>Eksploitasi seksual.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
            <CardHeader>
              <CardTitle className="text-lg">Kekerasan Psikologis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Tindakan yang menyebabkan kerugian atau penderitaan mental dan emosional.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Gaslighting atau manipulasi mental.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Isolasi sosial.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Kontrol berlebihan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Penolakan atau pengabaian emosional.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* KBGO */}
        <Card className="mb-8 border border-yellow-100/80 dark:border-yellow-900/40 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl">
                <Shield className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                Kekerasan Berbasis Gender Online (KBGO)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
              Kekerasan yang terjadi melalui platform digital dan media sosial yang menargetkan
              korban berdasarkan gender atau ekspresi gendernya.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Cyberbullying atau perundungan online.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Penyebaran gambar pribadi tanpa izin (revenge porn).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Stalking atau penguntitan online.</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Pemerasan seksual online (sextortion).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Penyebaran hoaks atau informasi palsu yang merugikan korban.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Body shaming atau komentar merendahkan di ruang digital.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* DAMPAK KEKERASAN */}
        <Card className="mb-8 border border-red-100/80 dark:border-red-900/40 bg-white/95 dark:bg-gray-950/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl">
                <Users className="w-6 h-6 text-red-700 dark:text-red-300" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                Dampak Kekerasan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Kekerasan meninggalkan dampak luas pada korban, komunitas, dan lingkungan kampus.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-3 text-red-700 dark:text-red-300">
                  Dampak Fisik
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Cedera dan luka fisik.</li>
                  <li>• Gangguan kesehatan jangka panjang.</li>
                  <li>• Kehamilan yang tidak diinginkan.</li>
                  <li>• Penyakit menular seksual.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-red-700 dark:text-red-300">
                  Dampak Psikologis
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Trauma dan gangguan stres pasca peristiwa.</li>
                  <li>• Depresi dan kecemasan.</li>
                  <li>• Gangguan tidur dan mimpi buruk.</li>
                  <li>• Penurunan kepercayaan diri.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-red-700 dark:text-red-300">
                  Dampak Sosial
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Isolasi dari lingkungan pertemanan.</li>
                  <li>• Kesulitan dalam membangun relasi.</li>
                  <li>• Masalah akademik atau performa kerja.</li>
                  <li>• Stigma dari lingkungan sekitar.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-red-700 dark:text-red-300">
                  Dampak Ekonomi
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Kehilangan pendapatan atau beasiswa.</li>
                  <li>• Biaya pengobatan dan pemulihan.</li>
                  <li>• Biaya proses hukum.</li>
                  <li>• Kesulitan finansial jangka panjang.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Sudah Memahami Definisi Kekerasan?
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
              Langkah berikutnya adalah mengetahui cara melapor dan memahami hak-hak korban
              agar proses penanganan berjalan adil dan berperspektif korban.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/edukasi/prosedur"
                className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Pelajari Prosedur Laporan
              </Link>
              <Link
                href="/edukasi/hak-korban"
                className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Hak & Perlindungan Korban
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
