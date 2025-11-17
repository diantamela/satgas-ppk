import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, Award, Mail, ArrowLeft } from "lucide-react";

export default function ProfilPage() {
  const teamMembers = [
    {
      name: "Dr. Ahmad Fauzi, M.Pd.",
      role: "Ketua Satgas PPK",
      description: "Bertanggung jawab atas koordinasi dan pengambilan keputusan strategis Satgas PPK.",
      email: "ahmad.fauzi@uinib.ac.id"
    },
    {
      name: "Dr. Siti Nurhaliza, M.Pd.",
      role: "Sekretaris",
      description: "Menangani administrasi, dokumentasi, dan komunikasi internal Satgas.",
      email: "siti.nurhaliza@uinib.ac.id"
    },
    {
      name: "Prof. Dr. Muhammad Iqbal, S.H., M.H.",
      role: "Koordinator Pendampingan",
      description: "Mengkoordinasikan pendampingan psikologis dan hukum bagi korban.",
      email: "muhammad.iqbal@uinib.ac.id"
    },
    {
      name: "Dra. Fitriani, M.Psi.",
      role: "Psikolog",
      description: "Memberikan pendampingan psikologis dan trauma healing kepada korban.",
      email: "fitriani@uinib.ac.id"
    },
    {
      name: "Dr. Hendra Saputra, S.H., M.H.",
      role: "Advokat",
      description: "Memberikan pendampingan hukum dan bantuan proses litigasi.",
      email: "hendra.saputra@uinib.ac.id"
    },
    {
      name: "Ir. Maya Sari, M.T.",
      role: "Koordinator Edukasi",
      description: "Mengembangkan program edukasi pencegahan kekerasan di kampus.",
      email: "maya.sari@uinib.ac.id"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <a href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </a>
          </Button>
        </div>
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Profil Satgas PPK UIN Imam Bonjol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-blue dark:prose-invert max-w-none text-center">
              <p className="text-lg">
                Satgas PPK UIN Imam Bonjol terdiri dari para profesional yang berkomitmen tinggi
                dalam menciptakan lingkungan kampus yang aman dan bebas kekerasan.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{member.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {member.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span>{member.email}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Komitmen dan Etika Kerja</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Prinsip Kerja</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Profesionalitas:</strong> Menjalankan tugas dengan kompetensi dan integritas tinggi</li>
                    <li><strong>Netralitas:</strong> Menjaga objektivitas dalam setiap penanganan kasus</li>
                    <li><strong>Empati:</strong> Memberikan perhatian dan dukungan kepada korban</li>
                    <li><strong>Konfidensialitas:</strong> Menjaga kerahasiaan informasi pelapor</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-3">Kualifikasi Tim</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Pendidikan minimal S1 di bidang terkait</li>
                    <li>Pengalaman minimal 3 tahun di bidangnya</li>
                    <li>Mengikuti pelatihan penanganan kekerasan seksual</li>
                    <li>Bersertifikat konselor atau mediator</li>
                    <li>Memahami regulasi terkait kekerasan seksual</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}