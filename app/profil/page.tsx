import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, Award, Mail, ArrowLeft } from "lucide-react";

export default function ProfilPage() {
  const teamMembers = [
    {
      name: "Dr. Ahmad Fauzi, M.Pd.",
      role: "Ketua Satgas PPK",
      description:
        "Bertanggung jawab atas koordinasi dan pengambilan keputusan strategis Satgas PPK.",
      email: "ahmad.fauzi@uinib.ac.id",
    },
    {
      name: "Dr. Siti Nurhaliza, M.Pd.",
      role: "Sekretaris",
      description:
        "Menangani administrasi, dokumentasi, dan komunikasi internal Satgas.",
      email: "siti.nurhaliza@uinib.ac.id",
    },
    {
      name: "Prof. Dr. Muhammad Iqbal, S.H., M.H.",
      role: "Koordinator Pendampingan",
      description:
        "Mengkoordinasikan pendampingan psikologis dan hukum bagi korban.",
      email: "muhammad.iqbal@uinib.ac.id",
    },
    {
      name: "Dra. Fitriani, M.Psi.",
      role: "Psikolog",
      description:
        "Memberikan pendampingan psikologis dan trauma healing kepada korban.",
      email: "fitriani@uinib.ac.id",
    },
    {
      name: "Dr. Hendra Saputra, S.H., M.H.",
      role: "Advokat",
      description:
        "Memberikan pendampingan hukum dan bantuan proses litigasi.",
      email: "hendra.saputra@uinib.ac.id",
    },
    {
      name: "Ir. Maya Sari, M.T.",
      role: "Koordinator Edukasi",
      description:
        "Mengembangkan program edukasi pencegahan kekerasan di kampus.",
      email: "maya.sari@uinib.ac.id",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-10">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {/* NAV + BACK */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild className="px-0">
            <a href="/" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </a>
          </Button>

          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 px-4 py-1 text-xs font-semibold tracking-wide">
            <Shield className="w-4 h-4" />
            Lindungi Sivitas Akademika
          </span>
        </div>

        {/* HERO PROFIL SATGAS */}
        <section className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-gray-950/80 border border-red-100/70 dark:border-red-900/40 shadow-xl mb-10">
          <div className="pointer-events-none absolute -top-20 -left-24 h-56 w-56 rounded-full bg-red-300/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-yellow-300/40 blur-3xl" />

          <div className="relative px-6 py-10 md:px-10 md:py-12">
            <div className="grid gap-8 md:grid-cols-[3fr,2fr] items-center">
              {/* Teks utama */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red-700 dark:text-red-300 mb-2">
                  Tentang Satgas PPK
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  Profil Satgas PPK
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 dark:from-red-400 dark:via-red-300 dark:to-yellow-200">
                    {" "}
                    UIN Imam Bonjol
                  </span>
                </h1>
                <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-xl">
                  Satgas PPK terdiri dari tenaga profesional lintas disiplin yang
                  berkomitmen mewujudkan kampus yang aman, inklusif, dan bebas
                  dari segala bentuk kekerasan, dengan menjunjung tinggi
                  kerahasiaan, keadilan, dan keberpihakan pada korban.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-900/40 px-4 py-1.5 text-xs font-medium text-red-700 dark:text-red-200">
                    <Shield className="w-4 h-4" />
                    Perlindungan & Kerahasiaan
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-yellow-50 dark:bg-yellow-900/40 px-4 py-1.5 text-xs font-medium text-yellow-800 dark:text-yellow-100">
                    <Users className="w-4 h-4" />
                    Pendampingan Lintas Profesi
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                    <Award className="w-4 h-4" />
                    Berbasis Regulasi & Etik
                  </div>
                </div>
              </div>

              {/* Panel ringkas info */}

            </div>
          </div>
        </section>

        {/* TIM SATGAS */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              <Users className="w-7 h-7 text-red-600" />
              Tim Inti Satgas PPK
            </h2>
            <p className="hidden md:block text-xs text-gray-500 dark:text-gray-400">
              Kolaborasi lintas disiplin: psikologi, hukum, pendidikan, dan
              advokasi.
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 max-w-2xl">
            Setiap anggota memiliki peran spesifik namun saling terhubung, demi
            memastikan setiap laporan ditangani secara cepat, tepat, dan manusiawi.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border border-red-100/80 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 hover:border-red-400 dark:hover:border-red-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-500" />
                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/40 p-2">
                      <Shield className="w-5 h-5 text-red-600 dark:text-red-300" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </CardTitle>
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium mt-0.5">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    {member.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Mail className="w-3 h-3" />
                    <span>{member.email}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* KOMITMEN & ETIKA + CTA */}
        <section>
          <Card className="border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                    <Award className="w-6 h-6 text-green-700 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg md:text-xl">
                    Komitmen, Etika Kerja, dan Kualifikasi Tim
                  </CardTitle>
                </div>
                <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                  Berbasis Permendikbudristek No. 55 Tahun 2024
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">
                    Prinsip Kerja Satgas
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>
                      <strong>Profesionalitas:</strong> Tugas dijalankan dengan
                      standar kompetensi dan kode etik yang jelas.
                    </li>
                    <li>
                      <strong>Netralitas:</strong> Objektif, bebas konflik
                      kepentingan, dan menghindari keberpihakan yang merugikan
                      korban.
                    </li>
                    <li>
                      <strong>Empati:</strong> Mengedepankan pendekatan manusiawi,
                      tidak menyalahkan korban, dan ramah terhadap penyintas.
                    </li>
                    <li>
                      <strong>Kerahasiaan:</strong> Identitas pelapor dan korban
                      dijaga ketat sesuai regulasi yang berlaku.
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">
                    Kualifikasi & Kapasitas Tim
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>Pendidikan minimal S1 di bidang hukum, psikologi, pendidikan, atau terkait.</li>
                    <li>Pengalaman kerja minimal 3 tahun di bidang profesionalnya masing-masing.</li>
                    <li>
                      Mengikuti pelatihan resmi penanganan kekerasan seksual dan
                      manajemen kasus.
                    </li>
                    <li>Bersertifikat sebagai konselor, mediator, atau advokat.</li>
                    <li>
                      Memahami kerangka hukum nasional dan aturan internal
                      perguruan tinggi terkait kekerasan seksual.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">
                  Bila Anda menyaksikan atau mengalami kekerasan, Satgas hadir
                  untuk mendengarkan tanpa menghakimi dan membantu menyiapkan
                  langkah terbaik sesuai kebutuhan Anda.
                </p>
                <Button
                  asChild
                  className="rounded-full bg-red-700 hover:bg-red-800 text-sm px-6 py-2"
                >
                  <a href="/kontak" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Konsultasi atau Lapor Sekarang
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
