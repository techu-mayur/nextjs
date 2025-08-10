# Wedding Album App - Vercel Deployment Guide

## Overview

This Next.js wedding album application needs to be deployed to Vercel while handling large media files (videos up to 12GB) externally due to Vercel's 50MB file size limit.

## Architecture

- **Frontend & API**: Deployed on Vercel
- **Media Files**: Hosted externally at `https://projects.techumayur.in/mayur-jinal-wedding-album`
- **Database**: SQLite file hosted separately (can be on your server or a database service)

## Pre-Deployment Setup

### 1. Prepare the Project

Run the deployment preparation script:

```bash
node deploy-prepare.js
```

This will:
- Create placeholder directories
- Update `.gitignore` to exclude large files
- Create necessary documentation

### 2. Environment Variables

Set these environment variables in your Vercel dashboard:

```env
# Media Configuration
NEXT_PUBLIC_MEDIA_BASE_URL=https://projects.techumayur.in/mayur-jinal-wedding-album

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here

# reCAPTCHA (if using)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### 3. Database Setup

Since SQLite files can't be deployed to Vercel, you have several options:

#### Option A: Use Your Existing Server
- Keep the database on your current server
- Update the database connection to use a remote database URL
- Or use a database service like PlanetScale, Supabase, or Railway

#### Option B: Convert to PostgreSQL/MySQL
- Migrate from SQLite to a cloud database
- Update the database connection code

#### Option C: Use Vercel KV or Vercel Postgres
- Use Vercel's managed database services
- Requires code changes to use their SDKs

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 3. Set Environment Variables

In your Vercel project dashboard:
1. Go to Settings → Environment Variables
2. Add the environment variables listed above
3. Redeploy the project

### 4. Configure Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Post-Deployment

### 1. Test the Application

- Verify the app loads correctly
- Test user registration and login
- Check media loading from external URL
- Test admin functionality

### 2. Database Connection

If you're using a remote database, update the connection in `src/lib/database.ts`:

```typescript
// For remote SQLite or other database
const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'wedding_album.db');
```

### 3. Media File Access

Ensure your media files are accessible at:
`https://projects.techumayur.in/mayur-jinal-wedding-album`

The app will automatically use this URL for serving media files.

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes
   - Verify environment variables are set

2. **Media Not Loading**
   - Verify `NEXT_PUBLIC_MEDIA_BASE_URL` is correct
   - Check that media files are accessible at the external URL
   - Test direct access to media files

3. **Database Errors**
   - Ensure database is accessible from Vercel
   - Check database connection string
   - Verify database permissions

4. **Function Timeouts**
   - API routes are configured with 30-second timeout
   - For longer operations, consider using background jobs

### Performance Optimization

1. **Image Optimization**
   - Use Next.js Image component for automatic optimization
   - Consider using a CDN for media files

2. **Caching**
   - Implement proper caching headers
   - Use Vercel's edge caching

3. **Database Optimization**
   - Add proper indexes
   - Implement connection pooling if needed

## Monitoring

1. **Vercel Analytics**
   - Enable Vercel Analytics for performance monitoring
   - Monitor function execution times

2. **Error Tracking**
   - Set up error tracking (Sentry, LogRocket, etc.)
   - Monitor API route errors

3. **Database Monitoring**
   - Monitor database performance
   - Set up alerts for connection issues

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to git
   - Use Vercel's environment variable encryption

2. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS for all connections

3. **Database Security**
   - Use strong passwords
   - Implement proper access controls
   - Regular backups

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review browser console for errors
3. Test locally with `npm run dev`
4. Check database connectivity
5. Verify media file accessibility

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Functions](https://vercel.com/docs/concepts/functions)
