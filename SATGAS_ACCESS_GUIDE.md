# 📋 Panduan Mengakses Role Satuan Tugas (SATGAS)

## 🔑 Cara Login sebagai SATGAS

### **Method 1: Login dengan Akun SATGAS Existing**
```
URL: /sign-in
Email: satgas@satgas-ppks.com
Password: [cek di dokumentasi project atau database]
```

### **Method 2: Akses via URL Langsung**
```
URL: /satgas/dashboard
→ Akan redirect ke sign-in jika belum login
→ Login sebagai SATGAS
→ Akan redirect ke dashboard satgas
```

## 🔔 Cara Melihat Notifikasi Kontak di Dashboard SATGAS

### **Lokasi Notifikasi:**
1. **Dashboard Utama** (`/satgas/dashboard`)
   - Cari section "Notifikasi Terbaru" atau "Recent Notifications"
   - Notifikasi kontak akan muncul dengan format: "📧 Pesan Kontak: [subjek]"

2. **Halaman Notifikasi** (`/satgas/dashboard/notifikasi`)
   - Buka menu "Notifikasi" di sidebar
   - Filter: Cari notifikasi bertipe "DOCUMENT_UPLOADED" (untuk sementara)
   - Atau cari dengan kata kunci "📧 Pesan Kontak"

### **Format Notifikasi Kontak:**
```
Title: 📧 Pesan Kontak: [Subjek yang diisi user]
Message: **Dari:** [Nama User] ([email opsional])

**Pesan:**
[Isi pesan lengkap dari user]

**Prioritas:** [HIGH/MEDIUM/LOW]
```

## 🧪 Cara Test Notifikasi Kontak

### **Step-by-Step Testing:**
1. **Login sebagai SATGAS** (gunakan akun di atas)
2. **Buka dashboard** (`/satgas/dashboard`) 
3. **Catat jumlah notifikasi** saat ini
4. **Buka tab baru** → akses `/kontak`
5. **Isi form kontak** dengan data test:
   - Nama: "Test User"
   - Email: "test@example.com"
   - Subjek: "Test Konsultasi"
   - Pesan: "Ini adalah pesan test untuk melihat notifikasi"
6. **Submit form**
7. **Kembali ke dashboard satgas**
8. **Refresh halaman** atau cek halaman notifikasi
9. **Cari notifikasi baru** dengan title "📧 Pesan Kontak: Test Konsultasi"

## 🚨 Jika Notifikasi Tidak Muncul

### **Possible Causes:**
1. **Browser cache** - coba hard refresh (Ctrl+F5)
2. **Database connection** - cek apakah ada error di terminal
3. **API call failed** - cek Network tab di Developer Tools
4. **No active satgas users** - pastikan ada user dengan role 'SATGAS'

### **Debug Steps:**
1. **Check Terminal Logs** - cari error messages
2. **Check Network Tab** - pastikan POST ke `/api/contact` berhasil (200 OK)
3. **Check Database** - pastikan ada user dengan role 'SATGAS' dan `isActive: true`
4. **Check API Response** - pastikan response JSON contain `success: true`

## 📊 User SATGAS yang Ada

Berdasarkan terminal output, ada user SATGAS:
```
ID: 1
Email: satgas@satgas-ppks.com  
Name: Admin SATGAS
Role: SATGAS
Status: Active
```

## ⚡ Quick Access Links

- **Dashboard SATGAS**: `/satgas/dashboard`
- **Halaman Notifikasi**: `/satgas/dashboard/notifikasi`
- **Form Kontak** (untuk test): `/kontak`
- **Login Page**: `/sign-in`