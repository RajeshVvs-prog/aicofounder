@echo off
echo Starting AI Co-founder App...
echo.
echo Starting backend server...
start "Backend" cmd /k "cd backend && node server.cjs"
timeout /t 2 /nobreak > nul
echo Starting frontend...
start "Frontend" cmd /k "npm run dev:frontend"
echo.
echo ========================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Open http://localhost:3000 in your browser
echo.
