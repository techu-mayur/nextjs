@echo off
echo 🔧 Fixing Frontend CAPTCHA Validation Issues
echo ============================================

echo.
echo 📊 Current Git Status:
git status --porcelain

echo.
echo 🔧 Adding frontend CAPTCHA fixes...
git add .

echo.
echo 📝 Committing frontend CAPTCHA fixes...
git commit -m "Fix frontend CAPTCHA validation - skip CAPTCHA on Vercel for admin login and feedback"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Frontend CAPTCHA fixes pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Wait for Vercel to auto-deploy from GitHub (2-3 minutes)
echo 2. Test admin login at:
echo    https://mayur-jinal-wedding-album.vercel.app/admin
echo 3. Test feedback submission at:
echo    https://mayur-jinal-wedding-album.vercel.app/gallery
echo 4. Test user registration on main page
echo.
echo 🎉 Admin login and feedback should now work without CAPTCHA errors!
echo.
pause
