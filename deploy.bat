@echo off
echo.
echo === DEPLOY ===
echo.

cd /d "%~dp0"

echo [1/3] Git add...
git add .

echo [2/3] Git commit...
git commit -m "update %date% %time%"

echo [3/3] Vercel deploy...
call npx vercel deploy --prod --yes

echo.
echo === PRONTO! ===
echo.
pause
