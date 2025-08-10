@echo off
echo 🔧 Fixing Database Deployment Issues
echo =====================================

echo.
echo 📊 Current Git Status:
git status --porcelain

echo.
echo 🔧 Adding database fixes...
git add .

echo.
echo 📝 Committing database fixes...
git commit -m "Fix database connection for Vercel deployment - use in-memory database"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Database fixes pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Wait for Vercel to auto-deploy from GitHub
echo 2. Test the database connection at:
echo    https://mayur-jinal-wedding-album.vercel.app/api/test-db
echo 3. Test OTP functionality at:
echo    https://mayur-jinal-wedding-album.vercel.app/api/auth/otp
echo.
echo 🎉 Your app should now work properly on Vercel!
echo.
pause
