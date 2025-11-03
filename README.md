# 🛡️ Sistem Informasi SATGAS PPKLH  
### (Satuan Tugas Pencegahan dan Penanganan Kekerasan Seksual)  
**UIN Imam Bonjol Padang**

<div align="center">

[![Version](https://img.shields.io/github/package-json/v/diantamela/satgas-ppk?style=for-the-badge&logo=github)](https://github.com/diantamela/satgas-ppk)
[![License](https://img.shields.io/github/license/diantamela/satgas-ppk?style=for-the-badge&logo=opensourceinitiative&labelColor=2D333B)](LICENSE)
[![Stars](https://img.shields.io/github/stars/diantamela/satgas-ppk?style=for-the-badge&logo=github)](https://github.com/diantamela/satgas-ppk)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/diantamela/satgas-ppk)

</div>

---

## 🎯 Tentang Proyek

**Sistem Informasi SATGAS PPKLH (Satuan Tugas Pencegahan dan Penanganan Kekerasan Seksual)**  
adalah platform digital internal kampus yang dikembangkan oleh **UIN Imam Bonjol Padang** untuk mendukung proses:

- Pelaporan kasus kekerasan seksual secara aman dan rahasia  
- Tindak lanjut oleh tim Satgas PPK  
- Peninjauan dan keputusan akhir oleh pimpinan universitas  
- Edukasi dan publikasi informasi pencegahan kekerasan seksual di lingkungan kampus  

Aplikasi ini bertujuan menciptakan **lingkungan kampus yang aman, inklusif, dan bebas dari kekerasan**.

---

## 🧩 Arsitektur dan Teknologi

| Komponen | Teknologi |
|-----------|------------|
| **Frontend** | Next.js 15 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + Shadcn/UI |
| **Backend** | Next.js API Routes |
| **ORM** | Prisma ORM |
| **Database** | PostgreSQL (via Supabase) |
| **Autentikasi** | Better Auth (Email & Password + JWT) |
| **Penyimpanan File** | Supabase Storage |
| **Deployment** | Vercel |
| **Version Control** | Git & GitHub |

---

## 👥 Role Pengguna

| Role | Deskripsi |
|------|------------|
| 🧍‍♀️ **Pelapor (User)** | Membuat laporan, mengunggah bukti, dan memantau status laporan |
| 🛡️ **Satgas** | Melakukan verifikasi, tindak lanjut, membuat rekomendasi, dan mengelola konten edukatif |
| 🎓 **Rektor** | Meninjau hasil laporan dan memberikan keputusan akhir terhadap kasus |

---

## ⚡ Fitur Utama

- 📢 **Pelaporan Aman & Rahasia**  
  Laporan dapat dibuat secara anonim dan dilindungi dengan enkripsi AES-256  
- 📂 **Manajemen Kasus oleh Satgas**  
  Verifikasi laporan, unggah berita acara, surat pemanggilan, dan rekomendasi  
- 🧾 **Keputusan Rektor Digital**  
  Rekomendasi ditandatangani secara elektronik dan disimpan otomatis  
- 📚 **Pusat Edukasi**  
  Artikel, panduan, dan edukasi tentang pencegahan kekerasan seksual  
- 🔔 **Notifikasi & Monitoring**  
  Setiap perubahan status dikirim secara otomatis kepada pelapor dan Satgas  
- 🧠 **Dashboard Interaktif**  
  Statistik laporan berdasarkan status dan kategori kasus  

---

## ⚙️ Panduan Instalasi

### 📋 Prasyarat

Pastikan sudah menginstal:

- [Node.js](https://nodejs.org/) v18 atau lebih baru  
- [npm](https://www.npmjs.com/) / [Yarn](https://yarnpkg.com/)  
- Akun [Supabase](https://supabase.com)  
- [Git](https://git-scm.com/)  

---

### 💻 Instalasi Proyek

1. **Clone Repositori**
   ```bash
   git clone https://github.com/diantamela/satgas-ppk.git
   cd satgas-ppk
