import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, BookOpen, FileText } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Tentang Satgas PPK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <p className="text-lg">
                Satgas PPK (Pencegahan dan Penanganan Kekerasan) adalah unit yang dibentuk untuk mencegah, 
                menangani, dan menyelesaikan kasus kekerasan di lingkungan kampus secara profesional, adil, dan terintegrasi.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Dasar Hukum</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Permendikbudristek No. 55 Tahun 2024 tentang Pencegahan dan Penanganan Kekerasan Seksual di Perguruan Tinggi</li>
                <li>Undang-Undang Republik Indonesia Nomor 12 Tahun 2020 tentang Perubahan Kedua atas Undang-Undang Nomor 12 Tahun 2012 tentang Pendidikan Tinggi</li>
                <li>Peraturan internal universitas terkait penanganan kasus kekerasan</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Visi</h3>
              <p>
                Mewujudkan lingkungan kampus yang aman, inklusif, dan bebas dari kekerasan bagi seluruh sivitas akademika.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Misi</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Menyediakan mekanisme pelaporan yang aman dan terpercaya</li>
                <li>Menangani kasus kekerasan secara profesional dan objektif</li>
                <li>Memberikan pendampingan kepada korban kekerasan</li>
                <li>Melakukan edukasi pencegahan kekerasan di lingkungan kampus</li>
                <li>Bekerja sama dengan berbagai pihak untuk menciptakan kampus yang lebih aman</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Tugas dan Fungsi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Melakukan pendataan dan verifikasi laporan kekerasan</li>
                <li>Melaksanakan pendampingan korban secara psikologis dan hukum</li>
                <li>Melakukan mediasi antara korban dan pelaku apabila diperlukan</li>
                <li>Membantu proses hukum yang berjalan</li>
                <li>Menyusun rekomendasi penyelesaian kasus</li>
                <li>Menyusun laporan tahunan terkait penanganan kasus</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Struktur Organisasi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ketua Satgas: Bertanggung jawab atas keseluruhan aktivitas Satgas PPK</li>
                <li>Sekretaris: Menangani administrasi dan dokumentasi</li>
                <li>Divisi Pendataan: Menangani pelaporan dan pengumpulan informasi</li>
                <li>Divisi Investigasi: Melakukan pemeriksaan dan investigasi kasus</li>
                <li>Divisi Pendampingan: Memberikan pendampingan kepada korban</li>
                <li>Divisi Advokasi: Memberikan pendampingan hukum</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Kebijakan dan Prosedur</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <h4 className="text-lg font-semibold">Prinsip Penanganan Kasus</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Non-diskriminasi:</strong> Perlakuan yang adil tanpa memandang jenis kelamin, agama, suku, atau orientasi seksual</li>
                <li><strong>Konfidensialitas:</strong> Menjaga kerahasiaan identitas pelapor dan korban</li>
                <li><strong>Due process:</strong> Menjamin proses yang adil bagi pelapor dan terlapor</li>
                <li><strong>Non-retaliation:</strong> Melindungi pelapor dari tindakan balasan atau perundungan</li>
                <li><strong>Healing centered approach:</strong> Pendekatan yang memperhatikan kebutuhan korban secara holistik</li>
              </ul>
              
              <h4 className="text-lg font-semibold">Waktu Penanganan</h4>
              <p>
                Seluruh proses penanganan kasus dilakukan dalam waktu maksimal 30 (tiga puluh) hari kerja 
                sejak laporan diterima, tergantung pada kompleksitas kasus.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}