import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, AlertTriangle, Shield, Users } from "lucide-react";

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Edukasi Pencegahan Kekerasan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Informasi, artikel, dan sumber daya untuk mencegah dan menangani kekerasan di lingkungan kampus
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Jenis-jenis Kekerasan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li>
                  <h4 className="font-semibold">Kekerasan Fisik</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tindakan yang menyebabkan cedera atau bahaya fisik</p>
                </li>
                <li>
                  <h4 className="font-semibold">Kekerasan Verbal</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Penghinaan, hinaan, atau kata-kata yang menyakiti</p>
                </li>
                <li>
                  <h4 className="font-semibold">Pelecehan Seksual</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tindakan seksual yang tidak diinginkan atau dipaksakan</p>
                </li>
                <li>
                  <h4 className="font-semibold">Kekerasan Psikologis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tekanan mental, ancaman, atau perilaku yang menyakiti mental</p>
                </li>
                <li>
                  <h4 className="font-semibold">Bullying</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Pelecehan atau penindasan yang berulang</p>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Cara Mencegah Kekerasan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li>
                  <h4 className="font-semibold">Edukasi dan Kesadaran</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Pemahaman tentang hak asasi manusia dan kekerasan</p>
                </li>
                <li>
                  <h4 className="font-semibold">Budaya Lapor</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Membangun lingkungan yang mendukung pelaporan</p>
                </li>
                <li>
                  <h4 className="font-semibold">Kebijakan Jelas</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Kebijakan yang tegas terhadap kekerasan</p>
                </li>
                <li>
                  <h4 className="font-semibold">Dukungan Sosial</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Jaringan dukungan untuk korban dan pelapor</p>
                </li>
                <li>
                  <h4 className="font-semibold">Kampanye Kesadaran</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Program edukasi berkelanjutan</p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Hak Korban Kekerasan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li>
                  <h4 className="font-semibold">Hak untuk Dilindungi</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Korban berhak mendapatkan perlindungan dari ancaman atau tindakan balasan</p>
                </li>
                <li>
                  <h4 className="font-semibold">Hak untuk Didengar</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Proses penanganan yang adil dan menghormati korban</p>
                </li>
                <li>
                  <h4 className="font-semibold">Hak untuk Disembunyikan Identitasnya</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Kerahasiaan identitas korban harus dijaga</p>
                </li>
                <li>
                  <h4 className="font-semibold">Hak untuk Mendapatkan Pendampingan</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Dukungan psikologis, hukum, dan sosial</p>
                </li>
                <li>
                  <h4 className="font-semibold">Hak untuk Mengetahui Proses</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Mendapat informasi tentang progres penanganan kasus</p>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-lg">Sumber Daya Edukasi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li>
                  <h4 className="font-semibold">Materi Edukasi</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Modul, buku saku, dan infografis tentang pencegahan kekerasan</p>
                </li>
                <li>
                  <h4 className="font-semibold">Pelatihan</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Workshop dan pelatihan untuk sivitas akademika</p>
                </li>
                <li>
                  <h4 className="font-semibold">Kampanye Kesadaran</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Acara dan kampanye untuk meningkatkan kesadaran</p>
                </li>
                <li>
                  <h4 className="font-semibold">Konseling</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Layanan konseling untuk pencegahan dan penanganan</p>
                </li>
                <li>
                  <h4 className="font-semibold">Hotline Bantuan</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Kontak darurat untuk korban kekerasan</p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Artikel Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-lg mb-2">Kekerasan Seksual di Kampus: Fakta dan Realitas</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Artikel ini membahas data dan studi tentang kekerasan seksual di perguruan tinggi, 
                  termasuk faktor risiko dan dampak jangka panjang.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dipublikasikan: 15 Oktober 2024</p>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-lg mb-2">Membangun Budaya Kampus yang Aman dan Inklusif</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Strategi dan pendekatan untuk menciptakan lingkungan kampus yang bebas dari kekerasan 
                  dan mendukung semua individu.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dipublikasikan: 8 Oktober 2024</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Peran Mahasiswa dalam Pencegahan Kekerasan</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Bagaimana mahasiswa dapat menjadi agen perubahan dalam menciptakan kampus yang aman dan 
                  melaporkan kekerasan yang terjadi.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dipublikasikan: 1 Oktober 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}