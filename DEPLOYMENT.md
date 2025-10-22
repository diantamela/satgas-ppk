# 🚀 Deployment Guide: Supabase + Vercel

Panduan lengkap untuk deploy aplikasi SATGAS PPKLH menggunakan Supabase sebagai database dan Vercel sebagai platform hosting.

## 📋 Prerequisites

- Akun [Supabase](https://supabase.com)
- Akun [Vercel](https://vercel.com)
- Project GitHub yang sudah di-push

## 🗄️ Setup Supabase Database

### 1. Buat Project Supabase
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik "New Project"
3. Isi informasi project:
   - Name: `satgas-ppk`
   - Database Password: pilih password yang kuat
   - Region: Singapore atau Tokyo (terdekat dengan Indonesia)

### 2. Dapatkan Connection Details
1. Masuk ke project → Settings → Database
2. Copy connection string PostgreSQL:
   ```
   postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
   ```

### 3. Setup Environment Variables di Supabase
1. Masuk ke project → Settings → API
2. Copy:
   - Project URL: `https://[PROJECT_ID].supabase.co`
   - Anon public key
   - Service_role secret key

## 🔧 Konfigurasi Project

### 1. Environment Variables
Buat file `.env` di root project dengan isi:

```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_ROLE_KEY]

# Authentication
BETTER_AUTH_SECRET=[RANDOM_SECRET_32_CHARS]
BETTER_AUTH_URL=https://[YOUR_VERCEL_DOMAIN].vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://[YOUR_VERCEL_DOMAIN].vercel.app

# Supabase Configuration (for additional features)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

### 2. Deploy Database Schema
```bash
# Generate Prisma client
npm run db:generate

# Push schema ke Supabase
npm run db:supabase-push
```

### 3. Setup Vercel
1. Import project dari GitHub ke Vercel
2. Set Environment Variables (sama dengan .env):
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `NEXT_PUBLIC_BETTER_AUTH_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Deploy ke Vercel
```bash
# Deploy ke production
npm run deploy:vercel

# Atau deploy preview
npm run deploy:preview
```

## 🔐 Setup Authentication (Better Auth)

### 1. Konfigurasi Better Auth URLs
Pastikan `BETTER_AUTH_URL` dan `NEXT_PUBLIC_BETTER_AUTH_URL` mengarah ke domain Vercel Anda.

### 2. Setup Email Templates (Opsional)
Jika menggunakan email verification, setup SMTP di Better Auth configuration.

## 🗃️ Database Management

### View Database
```bash
# Buka Prisma Studio
npm run db:supabase-studio
```

### Update Schema
```bash
# Setelah edit prisma/schema.prisma
npm run db:generate
npm run db:supabase-push
```

## 🌐 Custom Domain (Opsional)

### 1. Setup di Vercel
1. Masuk ke project Vercel → Settings → Domains
2. Add custom domain
3. Update DNS records sesuai instruksi Vercel

### 2. Update Environment Variables
Update `BETTER_AUTH_URL` dan `NEXT_PUBLIC_BETTER_AUTH_URL` dengan custom domain.

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Test koneksi database
npx prisma db push --preview-feature
```

### Vercel Build Issues
1. Pastikan semua environment variables sudah di-set
2. Check Vercel build logs
3. Pastikan `vercel.json` configuration benar

### Authentication Issues
1. Verify `BETTER_AUTH_URL` domain
2. Check Better Auth secret key
3. Ensure CORS settings benar

## 📊 Monitoring & Analytics

### Supabase Dashboard
- Monitor database performance
- View real-time metrics
- Check API usage

### Vercel Analytics
- Monitor application performance
- View error rates
- Track user metrics

## 🔄 Update & Maintenance

### Update Dependencies
```bash
npm update
npm run build
npm run deploy:vercel
```

### Database Migrations
```bash
# Untuk perubahan schema besar
npx prisma migrate dev --name migration_name
npm run db:supabase-push
```

## 📞 Support

Jika ada masalah:
1. Check [Supabase Docs](https://supabase.com/docs)
2. Check [Vercel Docs](https://vercel.com/docs)
3. Check [Better Auth Docs](https://better-auth.com)
4. Lihat logs di Supabase/Vercel dashboard

## 🎯 Checklist Deployment

- [ ] Supabase project created
- [ ] Database connection tested
- [ ] Schema deployed
- [ ] Environment variables configured
- [ ] Vercel project imported
- [ ] Environment variables set di Vercel
- [ ] Application deployed
- [ ] Authentication tested
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active