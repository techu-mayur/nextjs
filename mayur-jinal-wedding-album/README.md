# Mayur & Jinal Wedding Album

A comprehensive web application for sharing wedding photos and videos with secure OTP-based authentication, advanced media gallery, and comprehensive admin dashboard.

## 🌟 Features

### User Features
- **OTP-based Authentication**: Secure login with unlimited OTP resends
- **Media Gallery**: Beautiful lightbox gallery with Fancybox integration
- **Face Detection**: Automatic categorization of photos with people
- **Download & Share**: Easy media download and social sharing
- **Feedback System**: User rating and feedback with CAPTCHA protection
- **Responsive Design**: Works perfectly on all devices

### Admin Features
- **Secure Admin Panel**: CAPTCHA-protected admin login
- **Dashboard Analytics**: Comprehensive user and media statistics
- **User Activity Tracking**: Monitor downloads, views, and user behavior
- **Security Monitoring**: Login history with IP addresses and locations
- **Feedback Management**: View and analyze user feedback

### Security Features
- **JWT Authentication**: Secure session management
- **IP Tracking**: Monitor user activity and prevent misuse
- **CAPTCHA Protection**: Prevent automated attacks
- **Rate Limiting**: Protect against brute force attacks
- **SQL Injection Protection**: Parameterized queries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite (included)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mayur-jinal-wedding-album
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
   RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
   ```

4. **Run the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   - User Interface: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

## 📁 Project Structure

```
mayur-jinal-wedding-album/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── auth/               # Authentication APIs
│   │   │   ├── media/              # Media management APIs
│   │   │   ├── feedback/           # Feedback APIs
│   │   │   └── admin/              # Admin APIs
│   │   ├── gallery/                # User gallery page
│   │   ├── admin/                  # Admin pages
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Landing page
│   └── lib/
│       └── database.ts             # Database utilities
├── public/
│   └── uploads/                    # Media files
├── package.json
└── README.md
```

## 🔧 Configuration

### Database
The application uses SQLite for simplicity. The database file (`wedding_album.db`) will be created automatically on first run.

### Media Files
1. Create the uploads directory:
   ```bash
   mkdir -p public/uploads
   ```

2. Add your wedding photos and videos to `public/uploads/`

3. The application will automatically detect and categorize media files

### reCAPTCHA Setup
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Create a new site
3. Add your domain
4. Copy the site key and secret key to your `.env.local`

## 👥 Default Credentials

### Admin Access
- **Username**: admin
- **Password**: admin123
- **URL**: http://localhost:3000/admin

⚠️ **Important**: Change these credentials in production!

## 🎨 Customization

### Colors and Styling
Edit `src/app/globals.css` to customize:
- Wedding theme colors
- Typography
- Animations
- Responsive breakpoints

### Branding
Update the following files:
- `src/app/layout.tsx` - Site title and metadata
- `src/app/page.tsx` - Landing page content
- `src/app/gallery/page.tsx` - Gallery header

## 🔒 Security Considerations

### Production Deployment
1. **Change default credentials**
2. **Use strong JWT secret**
3. **Enable HTTPS**
4. **Set up proper reCAPTCHA keys**
5. **Configure rate limiting**
6. **Set up monitoring and logging**

### Environment Variables
```env
# Required
JWT_SECRET=your-super-secret-jwt-key

# Optional (for production)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
NODE_ENV=production
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/otp` - Generate/verify OTP

### Media
- `GET /api/media` - Get all media items
- `POST /api/media` - Log media interactions

### Feedback
- `POST /api/feedback` - Submit user feedback

### Admin
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard` - Dashboard statistics

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🐛 Troubleshooting

### Common Issues

1. **Database not initializing**
   - Check file permissions
   - Ensure SQLite is available

2. **Media not loading**
   - Verify files are in `public/uploads/`
   - Check file permissions

3. **CAPTCHA not working**
   - Verify reCAPTCHA keys
   - Check domain configuration

4. **OTP not sending**
   - Check console for OTP (development mode)
   - Configure SMS service for production

## 📝 License

This project is created for the wedding of Mayur & Jinal. Please respect the privacy and personal nature of the content.

## 🤝 Contributing

This is a personal wedding album application. For general improvements or bug fixes, please create an issue or pull request.

## 📞 Support

For technical support or questions about the application, please contact the development team.

---

**Made with ❤️ for Mayur & Jinal's special day**
