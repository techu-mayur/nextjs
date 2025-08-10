@echo off
echo 🔧 Fixing Media Loading Issue
echo =============================

echo.
echo 📊 Current Git Status:
git status --porcelain

echo.
echo 🔧 Adding media loading fixes...
git add .

echo.
echo 📝 Committing media loading fixes...
git commit -m "Fix media loading issue - ensure fallback data is always used when database is empty"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Media loading fixes pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Wait for Vercel to auto-deploy from GitHub (2-3 minutes)
echo 2. Test the media API at:
echo    https://mayur-jinal-wedding-album.vercel.app/api/test-media
echo 3. Test the gallery at:
echo    https://mayur-jinal-wedding-album.vercel.app/gallery
echo.
echo 🎉 Your gallery should now show the wedding videos!
echo.
pause
