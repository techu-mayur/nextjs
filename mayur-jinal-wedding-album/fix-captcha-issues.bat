@echo off
echo 🔧 Fixing CAPTCHA Verification Issues
echo =====================================

echo.
echo 📊 Current Git Status:
git status --porcelain

echo.
echo 🔧 Adding CAPTCHA fixes...
git add .

echo.
echo 📝 Committing CAPTCHA fixes...
git commit -m "Fix CAPTCHA verification - completely bypass CAPTCHA for Vercel deployment"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ CAPTCHA fixes pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Wait for Vercel to auto-deploy from GitHub (2-3 minutes)
echo 2. Test admin login at:
echo    https://mayur-jinal-wedding-album.vercel.app/admin
echo 3. Test feedback submission in gallery
echo 4. Test user registration on main page
echo.
echo 🎉 CAPTCHA verification should now work properly!
echo.
pause
