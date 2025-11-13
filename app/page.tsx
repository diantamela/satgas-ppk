"use client";

import React, { useState, useEffect } from 'react';
// Mengganti semua import komponen eksternal/Next.js dengan elemen native dan logic mandiri
// Menambahkan ikon Sun dan Moon untuk ThemeToggle
import { Users, BookOpen, Mail, Shield, ArrowRight, LogIn, UserPlus, Sun, Moon } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";

// =======================================================
// Komponen Dasar & Helper Mandiri (menggantikan ShadCN/Next.js)
// =======================================================

/** Komponen Card Sederhana (Menggantikan ShadCN Card) */
interface CustomCardProps {
    children: React.ReactNode;
    className?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({ children, className = '' }) => (
    <div
        className={`bg-white dark:bg-gray-850 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 ${className}`}
    >
        {children}
    </div>
);

/** Komponen Button Sederhana (Menggantikan ShadCN Button) */
interface CustomButtonProps {
    children: React.ReactNode;
    href?: string;
    variant?: string;
    size?: string;
    className?: string;
    [key: string]: any;
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, href, variant = 'primary', size = 'md', className = '', ...props }) => {
    let baseStyles = "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]";
    let sizeStyles = size === 'lg' ? "px-7 py-2 text-lg" : "px-4 py-1.5 text-sm";
    
    let variantStyles;
    if (variant === 'primary') {
        variantStyles = "bg-red-700 hover:bg-red-800 text-white shadow-md shadow-red-500/50 border border-red-700";
    } else if (variant === 'outline') {
        variantStyles = "bg-transparent border border-red-600 text-red-700 dark:border-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700";
    } else if (variant === 'ghost') {
        variantStyles = "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent";
    } else if (variant === 'link') {
        variantStyles = "bg-transparent text-red-600 dark:text-red-400 font-bold hover:no-underline p-0 h-auto";
    }

    const Element = href ? 'a' : 'button';
    const linkProps = href ? { href } : {};

    return (
        <Element 
            className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
            {...linkProps}
            {...props}
        >
            {children}
        </Element>
    );
};

/** Komponen ThemeToggle Mandiri (Menggantikan import ThemeToggle) */
const ThemeToggle = () => {
    // Inisialisasi state mode gelap berdasarkan class 'dark' di <html>
    const [isDark, setIsDark] = useState(
        () => typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
    );

    // Efek untuk mengaplikasikan/menghapus class 'dark' pada <html>
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <CustomButton
            variant="ghost"
            size="sm"
            onClick={() => setIsDark(prev => !prev)}
            className="p-2 !h-auto" // Override padding/height
            aria-label="Toggle Theme"
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </CustomButton>
    );
};


/** Komponen AuthButtons - Selalu tampilkan sign in/up buttons di home page */
const AuthButtons = ({ session }: { session: any }) => {
  // Di home page, selalu tampilkan sign in/up buttons terlepas dari status login
  return (
    <>
      <CustomButton variant="ghost" size="sm" href="/sign-in" className="flex items-center">
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </CustomButton>
      <CustomButton variant="primary" size="sm" href="/sign-up" className="flex items-center">
        <UserPlus className="w-4 h-4 mr-2" />
        Sign Up
      </CustomButton>
    </>
  );
};

/**
 * Home Page (Landing Page) untuk Pusat Informasi & Edukasi SATGAS PPK.
 * Disesuaikan agar lebih compact (tidak terlalu banyak spasi/jarak) dan mandiri (standalone).
 */
export default function Home(): React.ReactElement {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-inter">
      
      {/* 1. NAVBAR (Header Navigation) */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100/70 dark:border-gray-800/70 backdrop-blur-md bg-white/90 dark:bg-gray-950/90 shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
          {/* Logo/Nama: Mengganti Link Next.js dengan <a> */}
          <a href="/" className="flex items-center space-x-2 font-extrabold text-xl text-red-700 dark:text-red-400 hover:text-red-600 transition">
            <Shield className="w-6 h-6 fill-red-200 dark:fill-red-900" />
            <span>SATGAS PPK</span>
          </a>
          
          {/* Auth & Theme Toggle */}
          <div className="flex items-center gap-2">
            <AuthButtons session={session} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative py-20 sm:py-28 text-center overflow-hidden bg-gradient-to-br from-red-50/70 via-white to-yellow-50/70 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        
        {/* Decorative Shapes */}
        <div className="absolute inset-0 z-0 opacity-60 dark:opacity-40">
          <div className="absolute -top-16 -left-16 w-96 h-96 bg-red-300/30 dark:bg-red-900/40 rounded-full blur-[90px]"></div>
          <div className="absolute bottom-16 right-16 w-[30rem] h-[30rem] bg-yellow-300/30 dark:bg-yellow-800/40 rounded-full blur-[90px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="flex justify-center mb-6">
            {/* Mengganti next/image dengan <img> dan placeholder */}
            <img
              src="/images/icons/Logo_UIN_Imam_Bonjol.png" // Placeholder Image
              alt="Logo UIN Imam Bonjol"
              width={100}
              height={100} 
              className="rounded-full border-4 border-white/50 dark:border-gray-700 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all hover:scale-[1.05]"
            />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-red-600 to-yellow-600 dark:from-red-400 dark:via-red-300 dark:to-yellow-200">
            Pusat Informasi & Edukasi
          </h1>
          <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Wujudkan Kampus yang Aman, Inklusif, dan Bebas Kekerasan.
          </h2>
          <p className="mt-5 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Temukan semua informasi yang Anda butuhkan tentang pencegahan, penanganan, dan hak-hak korban di lingkungan kampus kami.
          </p>

          <div className="flex flex-col sm:flex-row justify-center mt-10 gap-4">
            {/* CTA Utama: Pusat Edukasi */}
            <CustomButton
              variant="primary"
              size="lg" 
              href="/user/edukasi"
              className="shadow-2xl shadow-red-500/50"
            >
              <BookOpen className="w-5 h-5 mr-3" /> Pusat Edukasi
            </CustomButton>
            
            {/* CTA Sekunder: Hubungi Kami */}
            <CustomButton
              variant="outline"
              size="lg"
              href="/user/kontak"
              className="hover:shadow-lg"
            >
              <Mail className="w-5 h-5 mr-3" /> Hubungi Kami
            </CustomButton>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT (Tentang Kami & Edukasi) */}
      <main className="container mx-auto px-6 pb-16 max-w-7xl">
        
        {/* --- ABOUT (Tentang Kami) --- */}
        <section id="tentang-kami" className="my-16 sm:my-20 pt-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              <Users className="inline-block w-8 h-8 mr-3 text-red-600" /> Mengenal **Satgas PPK**
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Komitmen kami untuk menciptakan lingkungan kampus yang aman dan berintegritas.
            </p>
          </div>

          {/* Mengganti Card dengan CustomCard */}
          <CustomCard className="p-8 sm:p-10 shadow-xl border-l-8 border-red-600 transition-all hover:shadow-2xl">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              
              {/* Visi Misi */}
              <div className="lg:col-span-2">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-base font-medium border-b border-gray-100 dark:border-gray-700 pb-3">
                  Satuan Tugas Pencegahan dan Penanganan Kekerasan (SATGAS PPK) dibentuk sebagai wujud komitmen **UIN Imam Bonjol** untuk menciptakan kampus yang aman dari segala bentuk kekerasan, sesuai dengan **Permendikbudristek No. 55 Tahun 2024**.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Kami bekerja secara **independen**, menjunjung tinggi **kerahasiaan** dan keadilan bagi seluruh sivitas akademika. Tim kami siap memberikan pendampingan dan memastikan proses penanganan dilakukan secara profesional dan berempati.
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg shadow transition hover:bg-red-100 dark:hover:bg-red-900/50">
                  <Shield className="w-5 h-5 text-red-700 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">Perlindungan Korban</h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">Menjamin hak-hak dan keamanan korban adalah prioritas utama Satgas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg shadow transition hover:bg-yellow-100 dark:hover:bg-yellow-900/50">
                  <Mail className="w-5 h-5 text-yellow-700 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">Kerahasiaan Data</h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">Semua laporan dan identitas pelapor dijaga ketat kerahasiaannya.</p>
                  </div>
                </div>
              </div>

            </div>
          </CustomCard>
        </section>

        {/* --- PUSAT EDUKASI & ARTIKEL --- */}
        <section id="edukasi" className="my-16 sm:my-20">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              <BookOpen className="inline-block w-8 h-8 mr-3 text-yellow-600" /> Jelajahi **Pusat Edukasi**
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg">
              Perkuat pemahaman Anda tentang pencegahan, pelaporan, dan hak-hak di kampus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Kartu 1: Definisi - Mengganti Card dengan CustomCard */}
            <CustomCard className="p-6 shadow-lg hover:shadow-xl transition duration-300 border-t-[5px] border-yellow-500 hover:border-red-600 transform hover:-translate-y-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center"><Shield className='w-5 h-5 mr-2 text-yellow-600'/> Definisi Kekerasan</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-[4rem]">
                Pahami berbagai bentuk dan jenis kekerasan seksual, perundungan, dan kekerasan berbasis gender lainnya.
              </p>
              <CustomButton variant="link" href="/user/edukasi/definisi" className="text-sm">
                Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1 inline-block transition-transform group-hover:translate-x-1" />
              </CustomButton>
            </CustomCard>

            {/* Kartu 2: Prosedur - Mengganti Card dengan CustomCard */}
            <CustomCard className="p-6 shadow-lg hover:shadow-xl transition duration-300 border-t-[5px] border-red-500 hover:border-yellow-600 transform hover:-translate-y-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center"><Mail className='w-5 h-5 mr-2 text-red-600'/> Prosedur Laporan</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-[4rem]">
                Langkah-langkah yang harus dilakukan jika Anda menjadi korban atau saksi. Panduan pelaporan yang aman dan rahasia.
              </p>
              <CustomButton variant="link" href="/user/edukasi/prosedur" className="text-sm">
                Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1 inline-block transition-transform group-hover:translate-x-1" />
              </CustomButton>
            </CustomCard>

            {/* Kartu 3: Hak Korban - Mengganti Card dengan CustomCard */}
            <CustomCard className="p-6 shadow-lg hover:shadow-xl transition duration-300 border-t-[5px] border-orange-500 hover:border-red-600 transform hover:-translate-y-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center"><Users className='w-5 h-5 mr-2 text-blue-600'/> Hak Korban</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-[4rem]">
                Informasi detail tentang hak-hak dan perlindungan yang akan Anda terima selama proses penanganan.
              </p>
              <CustomButton variant="link" href="/user/edukasi/hak-korban" className="text-sm">
                Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1 inline-block transition-transform group-hover:translate-x-1" />
              </CustomButton>
            </CustomCard>

          </div>
        </section>

        {/* --- CTA FINAL (Hubungi Kami) --- */}
        <section id="kontak-akhir" className="text-center my-16 sm:my-20">
          <div className="bg-gradient-to-r from-red-700 to-yellow-600 dark:from-red-900 dark:to-yellow-800 rounded-[1.5rem] p-10 sm:p-16 text-white shadow-2xl shadow-red-500/30 dark:shadow-red-900/50">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-3">Butuh Bantuan Segera?</h2>
            <p className="text-yellow-100 max-w-3xl mx-auto mb-8 text-base">
              Jika Anda atau seseorang yang Anda kenal membutuhkan pendampingan atau ingin melaporkan kasus, jangan ragu. Tim Satgas siap membantu Anda dengan kerahasiaan penuh.
            </p>
            {/* CTA Kontak */}
            <CustomButton
              variant="default" // Default di CustomButton adalah primary, tapi disini kita pakai styling custom
              size="lg" 
              href="/user/kontak"
              className="!bg-white !text-red-700 !font-bold !px-8 !py-2 !rounded-full !hover:bg-red-50 !shadow-lg hover:shadow-xl"
            >
              <Mail className="w-5 h-5 mr-3" /> Kontak Satgas PPK
            </CustomButton>
          </div>
        </section>
      </main>
      
      {/* 4. FOOTER */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 max-w-7xl text-center text-sm text-gray-500 dark:text-gray-400">
              <p>&copy; {new Date().getFullYear()} SATGAS PPK UIN Imam Bonjol. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}