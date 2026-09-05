@echo off
echo ===================================================
echo   Pushing Noob Topup Admin Panel to GitHub...
echo ===================================================
cd /d "%~dp0"
git remote set-url origin https://github.com/mobinyt420-creator/NoobTopUp.git
git branch -M main
git push -u origin main
echo.
echo ===================================================
echo   Push Complete! Now visit Vercel.com to deploy!
echo ===================================================
pause
