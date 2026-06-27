@echo off
title Honey Girl - Iniciando...
color 0A
echo.
echo  ============================================
echo    HONEY GIRL - Catalogo de Ropa
echo  ============================================
echo.
echo  Iniciando base de datos y servidor...
echo.

start "Honey Girl Backend" /min cmd /c "cd /d "%~dp0backend" && node server.js"
timeout /t 3 /nobreak >nul

echo  Iniciando la aplicacion visual...
start "Honey Girl Frontend" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"
timeout /t 5 /nobreak >nul

echo  Abriendo el catalogo en el navegador...
start http://localhost:3000

echo.
echo  ============================================
echo   La aplicacion esta corriendo!
echo   Abre: http://localhost:3000
echo  ============================================
echo.
echo  Para cerrar la aplicacion, cierra esta
echo  ventana y las dos ventanas negras pequenas.
echo.
pause
