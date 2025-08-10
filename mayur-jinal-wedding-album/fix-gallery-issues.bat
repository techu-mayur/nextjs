@echo off
echo 🔧 Fixing Gallery and Session Issues
echo ====================================

echo.
echo 📊 Current Git Status:
git status --porcelain

echo.
echo 🔧 Adding gallery and session fixes...
git add .

echo.
echo 📝 Committing gallery fixes...
git commit -m "Fix gallery loading and session issues for Vercel deployment - add fallback media data and lenient session validation"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Gallery fixes pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Wait for Vercel to auto-deploy from GitHub (2-3 minutes)
echo 2. Test the gallery at:
echo    https://mayur-jinal-wedding-album.vercel.app/gallery
echo 3. Test feedback submission
echo 4. Test media viewing and downloading
echo.
echo 🎉 Your gallery should now load properly with media content!
echo.
pause
