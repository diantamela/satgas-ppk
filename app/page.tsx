"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, BookOpen, Mail, AlertTriangle, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons } from "@/components/auth-buttons";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent font-parkinsans">
            Satgas PPK
          </h1>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Pencegahan dan Penanganan Kekerasan
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 mb-8">
          Platform digital untuk melaporkan, menangani, dan mencegah kasus kekerasan di lingkungan kampus secara cepat, aman, dan terintegrasi
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/laporkan-kasus">
              Laporkan Kasus
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="dark:border-gray-600">
            <Link href="/cek-status">
              Cek Status Laporan
            </Link>
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-8 max-w-6xl">
        {/* About Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">Tentang Satgas PPK</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Misi Kami</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Satgas PPK (Pencegahan dan Penanganan Kekerasan) adalah unit yang dibentuk untuk mencegah, 
                menangani, dan menyelesaikan kasus kekerasan di lingkungan kampus secara profesional, adil, dan terintegrasi.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Kami berkomitmen untuk menciptakan lingkungan kampus yang aman, inklusif, dan bebas dari kekerasan 
                bagi seluruh sivitas akademika.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">Permendikbudristek No. 55 Tahun 2024</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Platform ini dibangun sesuai dengan ketentuan regulasi yang berlaku untuk memastikan 
                    perlindungan maksimal terhadap korban kekerasan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">Layanan Kami</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg">Pelaporan Kasus</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Laporkan kasus kekerasan secara online, anonim, dan aman. 
                Bukti dapat diunggah langsung ke sistem.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200/50 dark:border-purple-700/30 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg">Verifikasi & Investigasi</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Proses verifikasi dan investigasi dilakukan secara cepat 
                dan profesional oleh tim Satgas PPK.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200/50 dark:border-green-700/30 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg">Rekomendasi & Tindak Lanjut</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Rekomendasi ditetapkan secara digital dengan tanda tangan resmi 
                dan dikoordinasikan dengan pimpinan universitas.
              </p>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">Akses Cepat</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Button asChild size="lg" variant="outline" className="flex items-center gap-3 h-16 dark:border-gray-600">
              <Link href="/laporkan-kasus" className="flex items-center gap-3 w-full">
                <AlertTriangle className="w-5 h-5" />
                <span>Laporkan Kasus Kekerasan</span>
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="flex items-center gap-3 h-16 dark:border-gray-600">
              <Link href="/cek-status" className="flex items-center gap-3 w-full">
                <CheckCircle className="w-5 h-5" />
                <span>Cek Status Laporan</span>
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="flex items-center gap-3 h-16 dark:border-gray-600">
              <Link href="/edukasi" className="flex items-center gap-3 w-full">
                <BookOpen className="w-5 h-5" />
                <span>Artikel Edukasi</span>
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="flex items-center gap-3 h-16 dark:border-gray-600">
              <Link href="/kontak" className="flex items-center gap-3 w-full">
                <Mail className="w-5 h-5" />
                <span>Kontak Satgas</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Butuh Bantuan atau Informasi Lebih Lanjut?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-6">
              Tim Satgas PPK siap membantu Anda. Hubungi kami melalui layanan informasi 
              atau ajukan pertanyaan melalui form kontak kami.
            </p>
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link href="/kontak">
                Hubungi Kami
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
