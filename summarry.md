Berikut **ringkasan lengkap dan unik** dari sistem aplikasi **Satgas PPK (Pencegahan dan Penanganan Kekerasan)** berbasis **Fullstack (Next.js + Tailwind CSS + Prisma + MySQL)** sesuai dokumen *Requirement Analysis* kamu:

---

## 🧩 **Gambaran Umum Sistem**

Aplikasi ini adalah platform digital yang dirancang untuk membantu **Satgas PPK** dalam menangani kasus kekerasan di lingkungan kampus secara cepat, aman, dan terintegrasi.
Seluruh proses — mulai dari pelaporan, investigasi, hingga rekomendasi akhir — dilakukan secara **online dan terekam otomatis** di sistem.

Teknologi utama:

* **Frontend:** Next.js + Tailwind CSS
* **Backend:** Next.js API Routes + Prisma ORM
* **Database:** MySQL
* **Version Control:** Git & GitHub
* **Deployment:** Vercel (frontend + backend) dan Supabase (database & storage)
* **Integrasi:** WhatsApp API untuk notifikasi
* **Keamanan:** SSL/HTTPS, enkripsi data pelapor, dan tanda tangan digital

---

## 👥 **Aktor Sistem dan Hak Akses**

| Aktor              | Deskripsi                                                 | Hak Akses / Fungsi                                                                                     |
| ------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **User (Pelapor)** | Mahasiswa, dosen, atau staf yang ingin melapor kasus      | Mengisi laporan (anonim opsional), unggah bukti, meminta pendampingan, cek status, menerima notifikasi |
| **Admin / Satgas** | Tim Satgas yang memverifikasi dan menindaklanjuti laporan | Melihat & memproses laporan, ubah status, mencatat notulensi, membuat berita acara dan rekomendasi     |
| **Rektor**         | Pimpinan universitas penerima laporan akhir               | Melihat laporan akhir, menyetujui atau memberi catatan terhadap rekomendasi                            |

---

## 🔄 **Alur Sistem (Workflow)**

1. **Pelaporan Kasus**

   * Pengguna mengisi formulir online (bisa anonim)
   * Upload bukti (foto, video, dokumen)
   * Sistem memberi nomor laporan otomatis
   * Notifikasi dikirim via email & WhatsApp

2. **Verifikasi Awal oleh Satgas**

   * Satgas menerima notifikasi laporan baru
   * Laporan diverifikasi dalam 3 hari
   * Jika valid → status “Dalam Investigasi”
   * Jika tidak → status “Ditolak” (dengan alasan)

3. **Proses Investigasi**

   * Penjadwalan pemeriksaan pelapor, terlapor, dan saksi
   * Pembuatan notulensi digital & berita acara
   * Penandatanganan digital dokumen resmi
   * Salinan otomatis dikirim ke rektor & pelapor

4. **Kesimpulan & Rekomendasi**

   * Satgas membuat surat rekomendasi digital (≤10 hari)
   * Hasil: *Terbukti / Tidak Terbukti* disertai sanksi
   * Semua terekam di sistem

5. **Rektorasi & Penutupan**

   * Rektor memeriksa rekomendasi
   * Menyetujui / revisi / menolak
   * Sistem ubah status laporan ke “Selesai”
   * Semua dokumen diarsipkan otomatis

---

## 🧠 **Fitur Utama Aplikasi**

### 🔹 **Halaman Publik (Tanpa Login)**

* **Beranda:** Profil Satgas, visi misi, berita terbaru
* **Tentang Kami:** Struktur organisasi & dasar hukum
* **Edukasi & Artikel:** Artikel dan infografis tentang pencegahan kekerasan
* **Kontak Satgas:** Alamat, hotline, form pertanyaan
* **Laporkan Kasus:** Form pelaporan online anonim, upload bukti, notifikasi otomatis
* **Cek Status Laporan:** Input nomor laporan untuk memantau progres

### 🔹 **Halaman Internal (Dengan Login)**

* **Dashboard Admin Satgas:**
  Melihat & memfilter laporan, ubah status, kirim notifikasi, ekspor data (Excel/PDF)
* **Dashboard Tim Penanganan:**
  Upload dokumen pemeriksaan, notulensi, berita acara, dan jadwal pemeriksaan
* **Dashboard Ketua Satgas:**
  Validasi hasil investigasi, buat rekomendasi digital, kirim ke rektor
* **Dashboard Rektor:**
  Lihat laporan akhir, beri keputusan, ubah status akhir ke “Selesai”
* **Manajemen Dokumen & Notifikasi:**
  Semua dokumen (laporan, BA, rekomendasi) disimpan otomatis, lengkap dengan riwayat & log aktivitas

---

## 🛡️ **Kebutuhan Non-Fungsional**

| Aspek                    | Penjelasan                                                     |
| ------------------------ | -------------------------------------------------------------- |
| **Keamanan Data**        | Enkripsi data sensitif, HTTPS (SSL), role-based access control |
| **Kerahasiaan**          | Laporan anonim tidak menampilkan identitas pelapor             |
| **Kepatuhan Regulasi**   | Mengacu pada *Permendikbudristek No. 55 Tahun 2024*            |
| **Keandalan**            | Semua aktivitas pengguna terekam dalam log sistem              |
| **Aksesibilitas**        | Tampilan responsif untuk mobile & desktop                      |
| **Integrasi**            | WhatsApp Gateway untuk notifikasi otomatis                     |
| **Tanda Tangan Digital** | Mendukung e-Sign resmi (misalnya Kemenkominfo)                 |

---

## 🔗 **Alur Integrasi dan Deployment**

1. **Vercel** digunakan untuk hosting frontend & backend API Next.js.
2. **Supabase** menyimpan database MySQL dan file bukti laporan.
3. **Git & GitHub** digunakan untuk version control dan kolaborasi.
4. **WhatsApp API** terhubung untuk notifikasi otomatis (status laporan, verifikasi).
5. **SSL Certificate** diterapkan untuk keamanan data dan komunikasi terenkripsi.

---

Apakah kamu ingin aku bantu lanjutkan ke tahap **diagram alur sistem (flowchart)** atau **struktur folder proyek (frontend + backend)** sesuai arsitektur ini?
