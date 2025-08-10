@echo off
echo 🔧 Improving Admin Login API Robustness
echo ======================================

echo.
echo 📊 Current Git Status:
git status --porcelain

echo.
echo 🔧 Adding improved admin login fixes...
git add .

echo.
echo 📝 Committing improved admin login fixes...
git commit -m "Improve admin login API robustness - better error handling and request parsing"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Improved admin login fixes pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Wait for Vercel to auto-deploy from GitHub (2-3 minutes)
echo 2. Test admin login at:
echo    https://mayur-jinal-wedding-album.vercel.app/admin
echo 3. Test the test endpoint at:
echo    https://mayur-jinal-wedding-album.vercel.app/api/test-admin
echo 4. Check Vercel logs for detailed debugging information
echo.
echo 🎉 This should resolve the 400 error with better error handling!
echo.
pause
