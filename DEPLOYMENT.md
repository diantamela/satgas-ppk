# Deployment Guide

This guide will help you deploy the SATGAS PPKS application to production.

## Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 18+ installed
- [ ] A Supabase account and project
- [ ] A Vercel account (for deployment)
- [ ] Domain name (optional but recommended)

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note down your project credentials:
   - Database URL
   - Direct Database URL
   - Project reference
   - Database password

### 2. Configure Database

1. In your Supabase dashboard, go to Settings > Database
2. Copy the connection string for "Connection String" (URI format)
3. Enable Session Pooler for better performance

### 3. Run Migrations

The application includes pre-built migrations. They will be automatically applied when you first deploy.

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your production values:

```env
# Database
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-YOUR_REGION.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-YOUR_REGION.pooler.supabase.com:5432/postgres?sslmode=require"

# Authentication
BETTER_AUTH_URL="https://your-domain.com"
NEXT_PUBLIC_BETTER_AUTH_URL="https://your-domain.com"
BETTER_AUTH_SECRET="your-generated-secret-key"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="your-domain.com"
```

### 3. Generate Secret Key

Generate a secure secret key:
```bash
openssl rand -base64 32
```

## Deployment to Vercel

### Method 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### Method 2: Using GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Method 3: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables
6. Deploy

## Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

1. Go to Project Settings > Environment Variables
2. Add each variable from your `.env.local` file
3. Set environment to "Production" and "Preview"

Required environment variables:
- `DATABASE_URL`
- `DIRECT_URL`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `NODE_ENV`

## Post-Deployment Steps

### 1. Test Database Connection

1. Visit your deployed application
2. Check browser console for any database connection errors
3. Test basic functionality like user registration/login

### 2. Run Initial Setup

1. Create the first admin user through the registration process
2. Verify all user roles (USER, SATGAS, REKTOR) work correctly
3. Test file uploads and document management
4. Verify email notifications (if configured)

### 3. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update environment variables to use your custom domain

## Performance Optimization

### 1. Database Performance

- Ensure your Supabase project has adequate resources
- Monitor query performance in Supabase dashboard
- Consider upgrading to a higher tier for production use

### 2. File Storage

For production, consider using AWS S3 for file storage:

1. Create an S3 bucket
2. Configure AWS credentials in environment variables
3. Update file upload logic to use S3

### 3. Monitoring

Add monitoring services:

1. **Sentry** for error tracking
2. **Vercel Analytics** for performance monitoring
3. **Supabase Dashboard** for database monitoring

## Security Checklist

- [ ] All environment variables are properly configured
- [ ] Database connection uses SSL (`sslmode=require`)
- [ ] CORS is properly configured for your domain
- [ ] Content Security Policy headers are enabled
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] Database passwords are strong and unique
- [ ] Secret keys are properly generated and stored

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Check Node.js version compatibility
2. Ensure all dependencies are properly installed
3. Verify TypeScript configuration
4. Check for any console errors during local build

### Database Connection Issues

1. Verify DATABASE_URL format
2. Check Supabase project status
3. Ensure database is accessible from Vercel
4. Check network connectivity

### Authentication Issues

1. Verify BETTER_AUTH_URL matches your domain
2. Check BETTER_AUTH_SECRET is properly set
3. Ensure cookies are properly configured for your domain

## Backup and Maintenance

### Database Backups

1. Enable automatic backups in Supabase
2. Set up manual backup schedule
3. Test restore procedures regularly

### Application Updates

1. Keep dependencies updated
2. Test updates in staging environment first
3. Monitor for breaking changes in updates

## Support

For deployment issues:

1. Check Vercel deployment logs
2. Review application logs in Vercel dashboard
3. Check Supabase dashboard for database issues
4. Refer to application documentation

## Quick Deployment Commands

```bash
# Install dependencies
npm install

# Test build locally
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy preview
vercel
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring services configured
- [ ] Backup procedures in place
- [ ] User accounts created and tested
- [ ] All features tested in production environment
- [ ] Performance monitoring active
- [ ] Error tracking configured

Your application is now ready for production deployment!