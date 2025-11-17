"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Mail,
  Shield,
  ArrowRight,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Phone,
  MapPin,
} from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";

// =======================================================
// Komponen Dasar & Helper Mandiri
// =======================================================

interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-850 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 ${className}`}
  >
    {children}
  </div>
);

interface CustomButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: string;
  size?: string;
  className?: string;
  [key: string]: any;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]";
  const sizeStyles =
    size === "lg" ? "px-7 py-2 text-lg" : "px-4 py-1.5 text-sm";

  let variantStyles;

  if (variant === "primary" || variant === "default") {
    variantStyles =
      "bg-red-700 hover:bg-red-800 text-white shadow-md shadow-red-500/50 border border-red-700";
  } else if (variant === "outline") {
    variantStyles =
      "bg-transparent border border-red-600 text-red-700 dark:border-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700";
  } else if (variant === "ghost") {
    variantStyles =
      "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent";
  } else if (variant === "link") {
    variantStyles =
      "bg-transparent text-red-600 dark:text-red-400 font-bold hover:no-underline p-0 h-auto";
  } else {
    // fallback kalau ada variant aneh
    variantStyles =
      "bg-red-700 hover:bg-red-800 text-white shadow-md shadow-red-500/50 border border-red-700";
  }

  const Element: any = href ? "a" : "button";
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

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(
    () =>
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <CustomButton
      variant="ghost"
      size="sm"
      onClick={() => setIsDark((prev: boolean) => !prev)}
      className="p-2 !h-auto"
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </CustomButton>
  );
};

const AuthButtons = ({ session }: { session: any }) => {
  return (
    <>
      <CustomButton
        variant="ghost"
        size="sm"
        href="/sign-in"
        className="flex items-center"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </CustomButton>
      <CustomButton
        variant="primary"
        size="sm"
        href="/sign-up"
        className="flex items-center"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Sign Up
      </CustomButton>
    </>
  );
};

export default function Home(): React.ReactElement {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-inter">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100/70 dark:border-gray-800/70 backdrop-blur-md bg-white/90 dark:bg-gray-950/90 shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
          <a
            href="/"
            className="flex items-center space-x-2 font-extrabold text-xl text-red-700 dark:text-red-400 hover:text-red-600 transition"
          >
            <Shield className="w-6 h-6 fill-red-200 dark:fill-red-900" />
            <span>SATGAS PPK</span>
          </a>

          <div className="flex items-center gap-2">
            <CustomButton
              variant="ghost"
              size="sm"
              href="/profil"
              className="text-sm"
            >
              Profil
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="sm"
              href="/galeri"
              className="text-sm"
            >
              Galeri
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="sm"
              href="/unduh-materi"
              className="text-sm"
            >
              Unduh Materi
            </CustomButton>

            <AuthButtons session={session} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-10 sm:pt-24 sm:pb-12 text-center overflow-hidden bg-gradient-to-br from-red-50/70 via-white to-yellow-50/70 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 z-0 opacity-60 dark:opacity-40">
          <div className="absolute -top-16 -left-16 w-96 h-96 bg-red-300/30 dark:bg-red-900/40 rounded-full blur-[90px]" />
          <div className="absolute bottom-16 right-16 w-[30rem] h-[30rem] bg-yellow-300/30 dark:bg-yellow-800/40 rounded-full blur-[90px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="flex justify-center mb-6">
            <img
              src="/images/icons/Logo_UIN_Imam_Bonjol.png"
              alt="Logo UIN Imam Bonjol"
              width={140}
              height={140}
              className="h-24 sm:h-28 w-auto object-contain drop-shadow-xl"
            />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-red-600 to-yellow-600 dark:from-red-400 dark:via-red-300 dark:to-yellow-200">
            Pusat Informasi & Edukasi
          </h1>
          <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Wujudkan Kampus yang Aman, Inklusif, dan Bebas Kekerasan.
          </h2>
          <p className="mt-5 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Temukan semua informasi yang Anda butuhkan tentang pencegahan,
            penanganan, dan hak-hak korban di lingkungan kampus kami.
          </p>

          <div className="flex flex-col sm:flex-row justify-center mt-10 gap-4">
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-6 pb-16 max-w-7xl">
        {/* Tentang Kami */}
        <section id="tentang-kami" className="mt-8 sm:mt-10 mb-16 sm:mb-20 pt-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              <Users className="inline-block w-8 h-8 mr-3 text-red-600" />{" "}
              Mengenal Satgas PPK
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded-full" />
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Komitmen kami untuk menciptakan lingkungan kampus yang aman dan
              berintegritas.
            </p>
          </div>

          <CustomCard className="p-8 sm:p-10 shadow-xl border-l-8 border-red-600 transition-all hover:shadow-2xl">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-base font-medium border-b border-gray-100 dark:border-gray-700 pb-3">
                  Satuan Tugas Pencegahan dan Penanganan Kekerasan (SATGAS PPK)
                  dibentuk sebagai wujud komitmen UIN Imam Bonjol untuk
                  menciptakan kampus yang aman dari segala bentuk kekerasan,
                  sesuai dengan Permendikbudristek No. 55 Tahun 2024.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Kami bekerja secara independen, menjunjung tinggi kerahasiaan
                  dan keadilan bagi seluruh sivitas akademika. Tim kami siap
                  memberikan pendampingan dan memastikan proses penanganan
                  dilakukan secara profesional dan berempati.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg shadow transition hover:bg-red-100 dark:hover:bg-red-900/50">
                  <Shield className="w-5 h-5 text-red-700 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">
                      Perlindungan Korban
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                      Menjamin hak-hak dan keamanan korban adalah prioritas
                      utama Satgas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg shadow transition hover:bg-yellow-100 dark:hover:bg-yellow-900/50">
                  <Mail className="w-5 h-5 text-yellow-700 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">
                      Kerahasiaan Data
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                      Semua laporan dan identitas pelapor dijaga ketat
                      kerahasiaannya.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CustomCard>
        </section>

        {/* Pusat Edukasi */}
        <section id="edukasi" className="my-16 sm:my-20">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              <BookOpen className="inline-block w-8 h-8 mr-3 text-yellow-600" />{" "}
              Jelajahi Pusat Edukasi
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full" />
            <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg">
              Perkuat pemahaman Anda tentang pencegahan, pelaporan, dan hak-hak
              di kampus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <CustomCard className="p-6 shadow-lg hover:shadow-xl transition duration-300 border-t-[5px] border-yellow-500 hover:border-red-600 transform hover:-translate-y-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-yellow-600" /> Definisi
                Kekerasan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-[4rem]">
                Pahami berbagai bentuk dan jenis kekerasan seksual, perundungan,
                dan kekerasan berbasis gender lainnya.
              </p>
              <CustomButton
                variant="link"
                href="/edukasi/definisi"
                className="text-sm"
              >
                Baca Selengkapnya{" "}
                <ArrowRight className="w-4 h-4 ml-1 inline-block transition-transform group-hover:translate-x-1" />
              </CustomButton>
            </CustomCard>

            <CustomCard className="p-6 shadow-lg hover:shadow-xl transition duration-300 border-t-[5px] border-red-500 hover:border-yellow-600 transform hover:-translate-y-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-red-600" /> Prosedur Laporan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-[4rem]">
                Langkah-langkah yang harus dilakukan jika Anda menjadi korban
                atau saksi. Panduan pelaporan yang aman dan rahasia.
              </p>
              <CustomButton
                variant="link"
                href="/edukasi/prosedur"
                className="text-sm"
              >
                Baca Selengkapnya{" "}
                <ArrowRight className="w-4 h-4 ml-1 inline-block transition-transform group-hover:translate-x-1" />
              </CustomButton>
            </CustomCard>

            <CustomCard className="p-6 shadow-lg hover:shadow-xl transition duration-300 border-t-[5px] border-orange-500 hover:border-red-600 transform hover:-translate-y-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" /> Hak Korban
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-[4rem]">
                Informasi detail tentang hak-hak dan perlindungan yang akan
                Anda terima selama proses penanganan.
              </p>
              <CustomButton
                variant="link"
                href="/edukasi/hak-korban"
                className="text-sm"
              >
                Baca Selengkapnya{" "}
                <ArrowRight className="w-4 h-4 ml-1 inline-block transition-transform group-hover:translate-x-1" />
              </CustomButton>
            </CustomCard>
          </div>
        </section>

        {/* CTA Akhir */}
        <section id="kontak-akhir" className="text-center my-16 sm:my-20">
          <div className="bg-gradient-to-r from-red-700 to-yellow-600 dark:from-red-900 dark:to-yellow-800 rounded-[1.5rem] p-10 sm:p-16 text-white shadow-2xl shadow-red-500/30 dark:shadow-red-900/50">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-3">
              Butuh Bantuan Segera?
            </h2>
            <p className="text-yellow-100 max-w-3xl mx-auto mb-8 text-base">
              Jika Anda atau seseorang yang Anda kenal membutuhkan pendampingan
              atau ingin melaporkan kasus, jangan ragu. Tim Satgas siap
              membantu Anda dengan kerahasiaan penuh.
            </p>
            <CustomButton
              variant="default"
              size="lg"
              href="/kontak"
              className="!bg-white !text-red-700 !font-bold !px-8 !py-2 !rounded-full !hover:bg-red-50 !shadow-lg hover:shadow-xl"
            >
              <Mail className="w-5 h-5 mr-3" /> Kontak Satgas PPK
            </CustomButton>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-red-700 text-white pt-4 pb-3">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          {/* BARIS UTAMA */}
          <div className="grid md:grid-cols-2 gap-8 pb-4 border-b border-red-500/60">
            {/* KOLOM KIRI: INFO SATGAS */}
            <div>
              <h3 className="text-lg font-semibold tracking-wide mb-2">
                SATGAS PPK UIN IMAM BONJOL
              </h3>
              <div className="w-14 h-[2px] bg-white/80 mb-4" />

              <div className="space-y-2 text-xs sm:text-sm">
                <p className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5" />
                  <span>satgasppk@uinib.ac.id</span>
                </p>

                <p className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5" />
                  <span>+62 8xx-xxxx-xxxx</span>
                </p>

                <p className="flex items-start gap-2 leading-relaxed">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Kampus III UIN Imam Bonjol Padang
                    <br />
                    Sungai Bangek, Balai Gadang, Koto Tangah
                    <br />
                    Kota Padang, Sumatera Barat 25586
                  </span>
                </p>
              </div>
            </div>

            {/* KOLOM KANAN: MAPS (BARCODE) */}
            <div className="flex flex-col items-center md:items-end md:pr-4">
              <div className="w-full md:w-auto md:text-right text-center">
                <h3 className="text-lg font-semibold tracking-wide mb-2">
                  Maps
                </h3>
                <div className="w-14 h-[2px] bg-white/80 mb-4 md:ml-auto md:mr-0 mx-auto" />
              </div>

              <div className="inline-block bg-white rounded-md p-3 shadow-md">
                <img
                  src="/images/icons/peta_uin.png"
                  alt="Peta UIN Imam Bonjol"
                  className="w-32 h-auto object-contain"
                />
              </div>

              <a
                href="https://maps.app.goo.gl/fKjxKtym3YhMqTTm8"
                target="_blank"
                rel="noreferrer"
                className="block mt-2 text-[11px] sm:text-xs text-red-100 hover:text-white break-all md:text-right text-center"
              >
                Lihat peta lebih besar
              </a>
            </div>
          </div>

          {/* COPYRIGHT */}
          <div className="pt-2 text-center text-[11px] sm:text-xs text-red-100">
            &copy; {new Date().getFullYear()} Satgas Pencegahan dan Penanganan Kekerasan UIN Imam Bonjol Padang. Dibangun dengan Next.js.
          </div>
        </div>
      </footer>
    </div>
  );
}
