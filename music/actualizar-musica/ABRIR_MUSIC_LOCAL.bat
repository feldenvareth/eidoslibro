@echo off
setlocal
cd /d "%~dp0"

set "WEBROOT=%~dp0..\.."
set "PORT=8765"

echo.
echo ==========================================
echo        EIDOS - MUSIC LOCAL
echo ==========================================
echo.
echo Abriendo el reproductor mediante localhost.
echo Esto permite que Web Audio funcione con sonido y visualizador.
echo.
echo NO cierres esta ventana mientras pruebas el reproductor.
echo.

where py >nul 2>nul
if not errorlevel 1 (
  start "" "http://localhost:%PORT%/music/index.html"
  cd /d "%WEBROOT%"
  py -3 -m http.server %PORT%
  goto fin
)

where python >nul 2>nul
if not errorlevel 1 (
  start "" "http://localhost:%PORT%/music/index.html"
  cd /d "%WEBROOT%"
  python -m http.server %PORT%
  goto fin
)

echo ERROR: Para la prueba local con Web Audio hace falta Python 3.
echo En la web publicada no hace falta Python.
pause

:fin
