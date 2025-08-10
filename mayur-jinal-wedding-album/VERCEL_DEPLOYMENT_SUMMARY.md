# 🚀 Vercel Deployment Summary

## Quick Start

1. **Run the preparation script:**
   ```bash
   node deploy-prepare.js
   ```

2. **Deploy using the batch file (Windows):**
   ```bash
   deploy.bat
   ```

3. **Or manually:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

## 🔧 Vercel Configuration

### Environment Variables to Set:
```env
NEXT_PUBLIC_MEDIA_BASE_URL=https://projects.techumayur.in/mayur-jinal-wedding-album
JWT_SECRET=your-super-secure-jwt-secret-key-here
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### Build Settings:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 📁 File Structure

```
├── src/                    # Next.js app code
├── public/                 # Static files (excluding large media)
├── vercel.json            # Vercel configuration
├── .gitignore             # Excludes large files
├── deploy-prepare.js      # Preparation script
├── deploy.bat             # Windows deployment script
└── DEPLOYMENT.md          # Detailed guide
```

## 🗄️ Database Options

Since SQLite can't be deployed to Vercel, choose one:

1. **Keep on your server** (easiest)
2. **Use Vercel Postgres** (recommended)
3. **Use PlanetScale/Supabase** (alternative)

## 📺 Media Files

- **Current Location**: `public/uploads/` (excluded from deployment)
- **External URL**: `https://projects.techumayur.in/mayur-jinal-wedding-album`
- **Configuration**: Already set in `vercel.json`

## 🚨 Important Notes

1. **Large files excluded**: Videos and database won't be deployed
2. **Media served externally**: From your existing server
3. **Database needs separate hosting**: Can't use local SQLite on Vercel
4. **Environment variables required**: Set in Vercel dashboard

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com)
- [Detailed Deployment Guide](./DEPLOYMENT.md)
- [Your Media Server](https://projects.techumayur.in/mayur-jinal-wedding-album)

## 📞 Support

If you need help:
1. Check the detailed guide in `DEPLOYMENT.md`
2. Review Vercel deployment logs
3. Test locally with `npm run dev`
