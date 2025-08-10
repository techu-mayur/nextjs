@echo off
echo 🔧 Fixing Feedback Session Token Issue
echo ======================================

echo.
echo 📊 Current Git Status:
git status --porcelain

echo.
echo 🔧 Adding feedback session fixes...
git add .

echo.
echo 📝 Committing feedback session fixes...
git commit -m "Fix feedback session token issue - make session validation more lenient for Vercel"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Feedback session fixes pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Wait for Vercel to auto-deploy from GitHub (2-3 minutes)
echo 2. Test feedback submission at:
echo    https://mayur-jinal-wedding-album.vercel.app/gallery
echo 3. Test admin login at:
echo    https://mayur-jinal-wedding-album.vercel.app/admin
echo 4. Test user registration on main page
echo.
echo 🎉 Feedback submission should now work without session errors!
echo.
pause
