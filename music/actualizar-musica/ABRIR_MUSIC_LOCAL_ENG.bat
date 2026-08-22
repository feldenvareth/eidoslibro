@echo off
setlocal
cd /d "%~dp0"
set "WEBROOT=%~dp0..\.."
set "PORT=8765"

where py >nul 2>nul
if not errorlevel 1 (
  start "" "http://localhost:%PORT%/music/indexeng.html"
  cd /d "%WEBROOT%"
  py -3 -m http.server %PORT%
  goto fin
)
where python >nul 2>nul
if not errorlevel 1 (
  start "" "http://localhost:%PORT%/music/indexeng.html"
  cd /d "%WEBROOT%"
  python -m http.server %PORT%
  goto fin
)
echo ERROR: Para la prueba local con Web Audio hace falta Python 3.
pause
:fin
