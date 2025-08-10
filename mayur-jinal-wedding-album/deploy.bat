@echo off
echo 🚀 Wedding Album App - Vercel Deployment Script
echo ================================================

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not initialized. Please run:
    echo    git init
    echo    git remote add origin ^<your-github-repo-url^>
    pause
    exit /b 1
)

REM Check current status
echo 📊 Current Git Status:
git status --porcelain

echo.
echo 🔧 Preparing for deployment...

REM Add all files (excluding those in .gitignore)
git add .

REM Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo ✅ No changes to commit
) else (
    echo 📝 Committing changes...
    git commit -m "Prepare for Vercel deployment - %date% %time%"
)

REM Push to remote
echo 🚀 Pushing to remote repository...
git push origin main

echo.
echo ✅ Deployment preparation complete!
echo.
echo 📋 Next Steps:
echo 1. Go to https://vercel.com
echo 2. Sign up/Login with GitHub
echo 3. Click 'New Project'
echo 4. Import your repository
echo 5. Configure environment variables:
echo    - NEXT_PUBLIC_MEDIA_BASE_URL=https://projects.techumayur.in/mayur-jinal-wedding-album
echo    - JWT_SECRET=your-secure-jwt-secret
echo 6. Deploy!
echo.
echo 🌐 Your app will be available at: https://your-project-name.vercel.app
pause
