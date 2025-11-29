"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  ArrowLeft,
  Shield,
  Send,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.message);
        // Reset form
        if (e.currentTarget) {
          e.currentTarget.reset();
        }
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.message || 'Terjadi kesalahan saat mengirim pesan');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Terjadi kesalahan saat mengirim pesan');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-10">
      <div className="max-w-5xl mx-auto px-4 lg:px-6">
        {/* Back button + badge */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild className="px-0">
            <a href="/" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </a>
          </Button>

          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 px-4 py-1 text-xs font-semibold tracking-wide">
            <Shield className="w-4 h-4" />
            Kerahasiaan Pelapor Terjamin
          </span>
        </div>

        {/* HERO CARD */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 text-white shadow-2xl mb-10">
          <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

          <CardHeader className="relative z-10 text-center space-y-3 py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-yellow-100/90">
              Layanan Pengaduan & Konsultasi
            </p>
            <CardTitle className="text-3xl md:text-4xl font-extrabold">
              Kontak Satgas PPK UIN Imam Bonjol
            </CardTitle>
            <p className="text-sm md:text-base max-w-2xl mx-auto text-yellow-50/90">
              Hubungi Satgas untuk pelaporan, konsultasi, atau permintaan
              informasi terkait pencegahan dan penanganan kekerasan di kampus.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" /> Ramah Korban
              </span>
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> Respons Cepat
              </span>
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" /> Saluran Multi Kanal
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* INFO KONTAK & JAM LAYANAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Kontak Resmi */}
          <Card className="bg-white/90 dark:bg-gray-950/90 border border-red-100/70 dark:border-gray-800 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded-xl">
                  <Mail className="w-6 h-6 text-red-600 dark:text-red-300" />
                </div>
                <CardTitle className="text-lg">Kontak Resmi Satgas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Email
                </h4>
                <p className="flex items-center gap-2 text-red-700 dark:text-red-300 break-all">
                  <Mail className="w-4 h-4" />
                  satgasppk@universitas.ac.id
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Telepon
                </h4>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Phone className="w-4 h-4" />
                  +62 123 4567 890
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  WhatsApp
                </h4>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <MessageCircle className="w-4 h-4" />
                  +62 812 3456 7890
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Alamat Sekretariat
                </h4>
                <p className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>
                    Gedung Rektorat Lt. 2
                    <br />
                    Universitas Negeri Contoh
                    <br />
                    Jl. Pendidikan No. 123
                    <br />
                    Kota Pendidikan, Provinsi Pendidikan
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Jam Layanan */}
          <Card className="bg-white/90 dark:bg-gray-950/90 border border-yellow-100/80 dark:border-yellow-900/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-xl">
                  <Clock className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
                </div>
                <CardTitle className="text-lg">Jam Layanan & Respon</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <h4 className="font-semibold">Layanan Pelaporan Online</h4>
                <p>
                  Tersedia <span className="font-semibold">24/7</span> melalui
                  sistem pelaporan digital. Setiap laporan akan diproses sesuai
                  SOP Satgas PPK.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Konsultasi Tatap Muka</h4>
                <p>
                  Senin – Jumat: 08.00 – 16.00 WIB
                  <br />
                  Sabtu: 09.00 – 12.00 WIB
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Perkiraan Waktu Respon</h4>
                <p>
                  Laporan darurat: <span className="font-semibold">≤ 1 jam</span>
                  <br />
                  Laporan non-darurat:{" "}
                  <span className="font-semibold">≤ 24 jam</span>
                  <br />
                  Verifikasi awal:{" "}
                  <span className="font-semibold">≤ 3 hari kerja</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FORM KONTAK / LAPOR */}
        <Card className="mb-10 bg-white/95 dark:bg-gray-950/95 border border-gray-200/80 dark:border-gray-800 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-lg">
                Formulir Kontak / Konsultasi
              </CardTitle>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Untuk laporan darurat, gunakan juga WhatsApp resmi Satgas.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {submitStatus === 'success' && (
              <div className="mb-4 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">{submitMessage}</p>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">{submitMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200"
                  >
                    Nama Lengkap (boleh samaran) *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Nama Anda / Inisial"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200"
                  >
                    Email (opsional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Alamat email untuk dihubungi"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200"
                >
                  Subjek
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Misal: Konsultasi, Laporan, Permintaan informasi"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200"
                >
                  Pesan
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Tuliskan kronologi singkat, pertanyaan, atau kebutuhan Anda..."
                ></textarea>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  Data yang Anda tulis akan dijaga kerahasiaannya dan hanya diakses
                  oleh tim Satgas.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-md bg-red-700 hover:bg-red-800 text-sm font-semibold"
              >
                Kirim Pesan ke Satgas
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* JENIS PERTANYAAN */}
        <Card className="bg-white/95 dark:bg-gray-950/95 border border-gray-200/80 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl">
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <CardTitle className="text-lg">
                Contoh Hal yang Bisa Anda Tanyakan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Informasi detail tentang prosedur pelaporan kasus.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>
                    Penjelasan mengenai hak dan perlindungan bagi korban atau
                    saksi.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>
                    Menanyakan perkembangan kasus yang sudah pernah Anda laporkan.
                  </span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>
                    Permintaan edukasi atau pelatihan pencegahan kekerasan untuk
                    fakultas/unit.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>
                    Laporan dugaan pelanggaran kode etik oleh petugas atau pihak
                    terkait.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>
                    Saran dan masukan untuk meningkatkan sistem pencegahan &
                    penanganan kekerasan.
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
