@echo off
echo 🔧 Updating reCAPTCHA Configuration
echo ===================================

echo.
echo 📊 Current Git Status:
git status --porcelain

echo.
echo 🔧 Adding reCAPTCHA configuration updates...
git add .

echo.
echo 📝 Committing reCAPTCHA configuration updates...
git commit -m "Update reCAPTCHA configuration with actual keys - enable proper CAPTCHA verification"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ reCAPTCHA configuration updates pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Wait for Vercel to auto-deploy from GitHub (2-3 minutes)
echo 2. Test admin login at:
echo    https://mayur-jinal-wedding-album.vercel.app/admin
echo 3. Test feedback submission at:
echo    https://mayur-jinal-wedding-album.vercel.app/gallery
echo 4. Complete CAPTCHA verification for both forms
echo.
echo 🎉 reCAPTCHA should now work properly with your actual keys!
echo.
pause
