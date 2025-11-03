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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* HERO */}
      <section className="relative py-24 sm:py-28 text-center overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0">
          <div className="absolute -top-10 -left-10 w-80 h-80 bg-red-200/50 dark:bg-red-900/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[25rem] h-[25rem] bg-yellow-200/50 dark:bg-yellow-700/20 rounded-full blur-3xl"></div>
        </div>

        {/* Navbar */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <AuthButtons />
          <ThemeToggle />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/icons/Logo_UIN_Imam_Bonjol.png"
              alt="Logo UIN Imam Bonjol"
              width={90}
              height={90}
              className="rounded-full border-4 border-white shadow-xl bg-white/10 backdrop-blur-md"
            />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-600 to-yellow-500">
            SATGAS PPK
          </h1>
          <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200">
            Pencegahan & Penanganan Kekerasan di Lingkungan Kampus
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sistem pelaporan digital yang aman, rahasia, dan profesional untuk mewujudkan kampus yang bebas dari kekerasan seksual.
          </p>

          <div className="flex flex-col sm:flex-row justify-center mt-8 gap-4">
            <Button
              size="lg"
              variant="default"
              className="from-red-600 to-yellow-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl hover:opacity-90 transition"
            >
              <Link href="/laporkan-kasus">Laporkan Kasus</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-red-600 text-red-700 dark:border-red-500 dark:text-red-400 hover:bg-red-600 hover:text-white transition"
            >
              <Link href="/cek-status">Cek Status</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-6 pb-24 max-w-6xl">
        {/* ABOUT */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Tentang Satgas PPK
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-4">
                Misi Kami
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Satgas PPK (Pencegahan dan Penanganan Kekerasan) berkomitmen menciptakan lingkungan kampus yang aman, inklusif, dan bebas kekerasan.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Kami menangani laporan dengan empati, profesionalitas, dan menjunjung tinggi keadilan serta kerahasiaan korban.
              </p>
            </div>

            <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-lg shadow-lg border border-red-200/40 dark:border-red-700/40 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    Dasar Hukum
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Berdasarkan Permendikbudristek No. 55 Tahun 2024 tentang Pencegahan dan Penanganan Kekerasan Seksual di Perguruan Tinggi.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* SERVICES */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Layanan Kami
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Pelaporan Kasus",
                desc: "Laporkan kasus secara aman, anonim, dan rahasia.",
                color: "from-red-50 to-yellow-50 border-red-300",
                icon: <AlertTriangle className="w-7 h-7 text-red-600" />,
              },
              {
                title: "Verifikasi & Investigasi",
                desc: "Tim Satgas menindaklanjuti laporan secara profesional.",
                color: "from-yellow-50 to-red-50 border-yellow-300",
                icon: <CheckCircle className="w-7 h-7 text-yellow-600" />,
              },
              {
                title: "Edukasi & Informasi",
                desc: "Pelajari hak dan pencegahan kekerasan melalui konten edukatif.",
                color: "from-red-50 to-yellow-100 border-yellow-300",
                icon: <BookOpen className="w-7 h-7 text-red-500" />,
              },
            ].map((item, i) => (
              <Card
                key={i}
                className={`p-6 bg-gradient-to-br ${item.color} dark:from-gray-800 dark:to-gray-900 border hover:shadow-xl transition`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-red-700 to-yellow-500 rounded-2xl p-10 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-3">Butuh Bantuan atau Informasi?</h2>
          <p className="text-yellow-100 max-w-2xl mx-auto mb-6">
            Hubungi Satgas PPK untuk konsultasi, pendampingan, atau informasi lebih lanjut.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-red-700 font-semibold px-8 py-4 rounded-lg hover:bg-yellow-50 transition"
          >
            <Link href="/kontak">Hubungi Kami</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
