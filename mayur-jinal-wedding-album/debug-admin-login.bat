@echo off
echo 🔧 Adding Debugging to Admin Login API
echo =====================================

echo.
echo 📊 Current Git Status:
git status --porcelain

echo.
echo 🔧 Adding debugging to admin login...
git add .

echo.
echo 📝 Committing debugging changes...
git commit -m "Add debugging to admin login API to identify 400 error cause"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Debugging changes pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Wait for Vercel to auto-deploy from GitHub (2-3 minutes)
echo 2. Test admin login at:
echo    https://mayur-jinal-wedding-album.vercel.app/admin
echo 3. Check Vercel logs for debugging information
echo 4. Report any error messages you see
echo.
echo 🎉 This will help us identify the exact cause of the 400 error!
echo.
pause
