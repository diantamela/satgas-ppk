import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { prisma } from '@/lib/database/prisma'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Kontak Satgas PPK</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Hubungi kami untuk pelaporan, informasi, atau pertanyaan terkait pencegahan dan penanganan kekerasan
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Kontak Resmi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Email</h4>
                <p className="text-blue-600 dark:text-blue-400">satgasppk@universitas.ac.id</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Telepon</h4>
                <p className="text-blue-600 dark:text-blue-400">+62 123 4567 890</p>
              </div>
              
              <div>
                <h4 className="font-semibold">WhatsApp</h4>
                <p className="text-blue-600 dark:text-blue-400">+62 812 3456 7890</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Alamat</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Gedung Rektorat Lt. 2<br />
                  Universitas Negeri Contoh<br />
                  Jl. Pendidikan No. 123<br />
                  Kota Pendidikan, Provinsi Pendidikan
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Jam Layanan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Layanan Pelaporan</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Layanan pelaporan tersedia 24/7 melalui platform digital ini. 
                  Laporan akan diproses sesuai prosedur operasional standar.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Konsultasi Langsung</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Senin - Jumat: 08.00 - 16.00 WIB<br />
                  Sabtu: 09.00 - 12.00 WIB
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Waktu Respon</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Laporan darurat: Maks. 1 jam<br />
                  Laporan biasa: Maks. 24 jam<br />
                  Verifikasi awal: Maks. 3 hari kerja
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Formulir Kontak</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" 
                    placeholder="Nama Anda" 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" 
                    placeholder="Alamat email" 
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">Subjek</label>
                <input 
                  type="text" 
                  id="subject" 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" 
                  placeholder="Subjek pertanyaan" 
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Pesan</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" 
                  placeholder="Tulis pesan Anda di sini..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Kirim Pesan
              </button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Jenis Pertanyaan yang Dapat Ditanyakan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Informasi tentang prosedur pelaporan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Tanya jawab mengenai hak dan perlindungan korban</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Permintaan informasi tentang kasus yang sedang ditangani</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Permintaan edukasi atau pelatihan untuk unit kerja</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Laporan dugaan pelanggaran kode etik oleh petugas Satgas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Saran dan masukan untuk penyempurnaan sistem</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}