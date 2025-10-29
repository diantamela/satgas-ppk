# 📁 Asset Management Guide - SATGAS PPKLH

Panduan lengkap untuk pengelolaan asset gambar dan file dalam aplikasi SATGAS PPKLH.

## 📂 Struktur Folder Asset

### `/public` - Static Assets (Rekomendasi Utama)
```
📁 public/
├── 📁 images/              ← Asset gambar static
│   ├── 📄 logo-uin.png     ← Logo universitas
│   ├── 📄 banner-home.jpg  ← Banner halaman utama
│   ├── 📄 hero-image.png   ← Gambar hero section
│   └── 📁 icons/          ← Folder untuk icon
│       ├── 📄 facebook.svg
│       ├── 📄 instagram.svg
│       ├── 📄 whatsapp.svg
│       └── 📄 email.svg
├── 📁 uploads/             ← File upload dari user
│   ├── 📄 evidence-2025-001.jpg
│   ├── 📄 document-2025-001.pdf
│   └── 📄 investigation-2025-001.png
├── 📄 favicon.ico          ← Favicon website
└── 📄 codeguide-logo.png   ← Logo aplikasi
```

### `/app/assets` - Dynamic Assets (Opsional)
```
📁 app/
├── 📁 assets/
│   ├── 📁 images/
│   │   ├── 📄 background-pattern.png
│   │   └── 📄 placeholder.png
│   └── 📁 icons/
│       ├── 📄 loading-spinner.svg
│       └── 📄 error-icon.svg
```

## 🚀 Cara Penggunaan

### Static Images dari `/public`
```tsx
// ✅ Import langsung dengan path
<Image src="/images/logo-uin.png" alt="Logo UIN PADANG" />

// ✅ Dengan optimization Next.js
<Image
  src="/images/banner-home.jpg"
  alt="Banner Home"
  width={1200}
  height={600}
  priority // untuk gambar di atas fold
/>

// ✅ Responsive images
<Image
  src="/images/hero-image.png"
  alt="Hero Image"
  fill // mengisi container parent
  objectFit="cover"
/>
```

### Dynamic Images dari `/app/assets`
```tsx
// ✅ Import sebagai module
import logoImage from '@/app/assets/images/logo.png'
import heroBg from '@/app/assets/images/background-pattern.png'

export default function Component() {
  return (
    <div>
      <Image src={logoImage} alt="Logo" />
      <div style={{ backgroundImage: `url(${heroBg})` }}>
        Content
      </div>
    </div>
  )
}
```

### Uploaded Files
```tsx
// ✅ Menampilkan file yang diupload user
<Image
  src={`/uploads/${evidenceFileName}`}
  alt="Evidence"
  width={400}
  height={300}
/>

// ✅ Link ke dokumen PDF
<a href={`/uploads/${documentFileName}`} target="_blank">
  Download PDF
</a>
```

## 🛠️ Konfigurasi Next.js

File `next.config.ts` sudah dikonfigurasi untuk mendukung images:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'], // untuk development
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // semua domain HTTPS untuk production
      },
    ],
  },
};
```

## 📋 Naming Convention

### Images
- `logo-uin-padang.png`
- `banner-homepage.jpg`
- `hero-section-mobile.png`
- `icon-facebook.svg`

### Uploaded Files
- `evidence-2025-001.jpg` (laporan bukti)
- `document-2025-001.pdf` (dokumen investigasi)
- `photo-respondent-001.png` (foto responden)

## 🔧 Best Practices

### 1. **Optimasi Gambar**
```bash
# Gunakan tools untuk compress gambar
# - TinyPNG.com
# - ImageOptim (Mac)
# - FileOptimizer (Windows)
```

### 2. **Format Gambar**
- **WebP** - untuk web modern (compression terbaik)
- **PNG** - untuk gambar dengan transparency
- **JPG** - untuk foto (compression lossy)

### 3. **Responsive Images**
```tsx
<Image
  src="/images/banner.jpg"
  alt="Banner"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 4. **Lazy Loading**
```tsx
<Image
  src="/images/heavy-image.jpg"
  alt="Heavy Image"
  loading="lazy" // default behavior
  placeholder="blur"
/>
```

## 📁 File Upload Handling

### API Route: `/app/api/upload/route.ts`
```typescript
// Handle file upload dengan multer atau form-data
// Simpan ke /public/uploads/
// Return path file untuk disimpan di database
```

### Database Storage
```sql
-- Simpan path file di database
UPDATE reports SET evidence_files = '/uploads/evidence-2025-001.jpg' WHERE id = 1;
```

## 🚀 Deployment Considerations

### Vercel Deployment
- ✅ `/public` otomatis tersedia
- ✅ Images otomatis di-optimize
- ✅ CDN global included

### File Upload di Production
```env
# Untuk file upload, pertimbangkan:
# - AWS S3 / Cloudflare R2
# - Supabase Storage
# - Vercel Blob Store
```

## 📊 Monitoring & Maintenance

### File Size Limits
- Images: max 2MB per file
- Documents: max 10MB per file
- Total upload per user: max 50MB/month

### Cleanup Strategy
```typescript
// Periodic cleanup untuk file lama
// Hapus file yang tidak terpakai > 30 hari
```

## 🎯 Quick Reference

| Asset Type | Folder | Usage | Example |
|------------|--------|-------|---------|
| Static Images | `/public/images/` | `<Image src="/images/logo.png" />` | Logo, banner, icons |
| User Uploads | `/public/uploads/` | `<Image src="/uploads/file.jpg" />` | Evidence, documents |
| Dynamic Assets | `/app/assets/` | `import img from '@/app/assets/img.png'` | Backgrounds, patterns |
| Icons | `/public/images/icons/` | `<Image src="/images/icons/fb.svg" />` | Social media icons |

## ❓ Troubleshooting

### Image tidak muncul
```bash
# Check file exists
ls public/images/

# Check import path (case sensitive)
<Image src="/Images/logo.png" /> // ❌ salah
<Image src="/images/logo.png" /> // ✅ benar
```

### Upload gagal
- Check folder permissions
- Check file size limits
- Check file type validation

### Performance issues
- Compress images sebelum upload
- Gunakan WebP format
- Implement lazy loading
- Use Next.js Image component