"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Mail, Shield, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle"; // Asumsi komponen ini ada
import { AuthButtons } from "@/components/auth-buttons"; // Asumsi komponen ini ada (handle Sign In/Sign Up)
import Image from "next/image";
import Link from "next/link";
import React from 'react'; // Impor React eksplisit untuk lingkungan TSX

/**
 * Home Page (Landing Page) yang disederhanakan, fokus pada Edukasi dan Informasi.
 */
export default function Home(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* 1. NAVBAR & HERO */}
      <section className="relative py-24 sm:py-28 text-center overflow-hidden">
        
        {/* Decorative Circles */}
        <div className="absolute inset-0">
          <div className="absolute -top-10 -left-10 w-80 h-80 bg-red-200/50 dark:bg-red-900/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[25rem] h-[25rem] bg-yellow-200/50 dark:bg-yellow-700/20 rounded-full blur-3xl"></div>
        </div>

        {/* Navbar - Sign In, Sign Up, Theme Toggle */}
        <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
          {/* Fitur 6 & 7: Sign In & Sign Up di dalam AuthButtons */}
          <AuthButtons /> 
          <ThemeToggle />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/icons/Logo_UIN_Imam_Bonjol.png" // Ganti dengan path logo Anda yang sebenarnya
              alt="Logo UIN Imam Bonjol"
              width={90}
              height={90}
              className="rounded-full border-4 border-white shadow-xl bg-white/10 backdrop-blur-md"
            />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-600 to-yellow-500">
            Pusat Informasi & Edukasi
          </h1>
          <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200">
            Wujudkan Kampus yang Aman, Inklusif, dan Bebas Kekerasan.
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Temukan semua informasi yang Anda butuhkan tentang pencegahan, penanganan, dan hak-hak korban di lingkungan kampus kami.
          </p>

          <div className="flex flex-col sm:flex-row justify-center mt-8 gap-4">
            {/* Fitur 1: Pusat Edukasi (CTA Utama) */}
            <Button
              asChild
              size="lg"
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition"
            >
              <Link href="/edukasi">
                <BookOpen className="w-5 h-5 mr-2" /> Pusat Edukasi
              </Link>
            </Button>
            {/* Fitur 4 & 5: Kontak & Hubungi Kami */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-red-600 text-red-700 dark:border-red-500 dark:text-red-400 hover:bg-red-600 hover:text-white transition"
            >
              <Link href="/kontak">
                <Mail className="w-5 h-5 mr-2" /> Hubungi Kami
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT */}
      <main className="container mx-auto px-6 pb-24 max-w-6xl">
        
        {/* ABOUT (Tentang Kami) */}
        <section id="tentang-kami" className="mb-20 pt-10">
          <div className="text-center mb-10">
            {/* Fitur 3: Tentang Kami */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              <Users className="inline-block w-8 h-8 mr-2 text-red-600" /> Tentang Kami
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
          </div>

          <Card className="p-8 shadow-xl bg-white dark:bg-gray-800 border-l-4 border-red-600">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 font-medium">
                  **Satuan Tugas Pencegahan dan Penanganan Kekerasan (SATGAS PPK)** dibentuk sebagai wujud komitmen UIN Imam Bonjol untuk menciptakan kampus yang aman dari segala bentuk kekerasan, sesuai dengan Permendikbudristek No. 55 Tahun 2024.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Kami bekerja secara independen, menjunjung tinggi **kerahasiaan** dan **keadilan** bagi seluruh sivitas akademika. Tim kami siap memberikan **pendampingan** dan memastikan proses penanganan dilakukan secara profesional.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    **Misi Utama:** Melindungi dan menjamin hak-hak korban kekerasan.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    **Kerahasiaan:** Semua informasi dan identitas pelapor dijaga ketat.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* PUSAT EDUKASI & ARTIKEL */}
        <section id="edukasi" className="mb-20">
          <div className="text-center mb-10">
            {/* Fitur 1 & 2: Pusat Edukasi & Jelajahi Artikel */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              <BookOpen className="inline-block w-8 h-8 mr-2 text-yellow-600" /> Jelajahi Artikel
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Perkuat pemahaman Anda tentang kekerasan dan hak-hak Anda di kampus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 dark:bg-gray-800 shadow-lg hover:shadow-xl transition border-t-4 border-yellow-500">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Definisi Kekerasan</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Pahami berbagai bentuk dan jenis kekerasan seksual dan perundungan.
              </p>
              <Button asChild variant="link" className="p-0 text-red-600 dark:text-red-400">
                <Link href="/edukasi/definisi">Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </Card>

            <Card className="p-6 dark:bg-gray-800 shadow-lg hover:shadow-xl transition border-t-4 border-red-500">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Prosedur Laporan</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Langkah-langkah yang harus dilakukan jika Anda menjadi korban atau saksi.
              </p>
              <Button asChild variant="link" className="p-0 text-red-600 dark:text-red-400">
                <Link href="/edukasi/prosedur">Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </Card>

            <Card className="p-6 dark:bg-gray-800 shadow-lg hover:shadow-xl transition border-t-4 border-blue-500">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Hak Korban</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Informasi detail tentang hak-hak dan perlindungan yang akan Anda terima.
              </p>
              <Button asChild variant="link" className="p-0 text-red-600 dark:text-red-400">
                <Link href="/edukasi/hak-korban">Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </Card>
          </div>
        </section>

        {/* CTA FINAL (Hubungi Kami) */}
        <section id="kontak" className="text-center bg-gradient-to-r from-red-700 to-yellow-500 rounded-2xl p-10 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-3">Tidak Yakin atau Butuh Pendampingan?</h2>
          <p className="text-yellow-100 max-w-2xl mx-auto mb-6">
            Jangan ragu. Tim Satgas siap membantu Anda dengan kerahasiaan penuh.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-red-700 font-semibold px-8 py-4 rounded-lg hover:bg-yellow-50 transition"
          >
            <Link href="/kontak">
              <Mail className="w-5 h-5 mr-2" /> Kontak Satgas PPK
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
}