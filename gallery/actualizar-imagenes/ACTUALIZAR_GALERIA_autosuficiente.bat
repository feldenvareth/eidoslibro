@echo off
setlocal
cd /d "%~dp0"

echo.
echo ==========================================
echo       EIDOS - ACTUALIZAR GALERIA
echo ==========================================
echo.

set "GALLERY=%~dp0.."
set "IMAGES=%GALLERY%\images\gallery"
set "OUTPUT=%GALLERY%\js\image-manifest.js"

if not exist "%IMAGES%\" (
  echo ERROR: No encuentro la carpeta:
  echo %IMAGES%
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$images=[System.IO.Path]::GetFullPath('%IMAGES%');" ^
  "$output=[System.IO.Path]::GetFullPath('%OUTPUT%');" ^
  "$exts=@('.avif','.bmp','.gif','.jpg','.jpeg','.png','.svg','.webp');" ^
  "$files=Get-ChildItem -LiteralPath $images -File -Recurse | Where-Object { $exts -contains $_.Extension.ToLowerInvariant() } | Sort-Object FullName;" ^
  "$items=@();" ^
  "foreach($f in $files){" ^
  "  $rel=$f.FullName.Substring($images.Length).TrimStart('\').Replace('\','/');" ^
  "  $parts=$rel.Split('/');" ^
  "  $encParts=@(); foreach($p in $parts){ $encParts += [Uri]::EscapeDataString($p) };" ^
  "  $url='images/gallery/' + ($encParts -join '/');" ^
  "  $name=[System.IO.Path]::GetFileNameWithoutExtension($rel) -replace '[-_]+',' ' -replace '\s+',' ';" ^
  "  $name=$name.Trim(); if([string]::IsNullOrWhiteSpace($name)){$name='Imagen de Eidos'};" ^
  "  $items += [pscustomobject]@{url=$url;name=$name;path=$rel};" ^
  "};" ^
  "$json=$items | ConvertTo-Json -Compress -Depth 4;" ^
  "$content='/* AUTO-GENERADO. NO EDITAR A MANO.'+[Environment]::NewLine+'   Ejecuta gallery/actualizar-imagenes/ACTUALIZAR_GALERIA.bat */'+[Environment]::NewLine+'window.EIDOS_IMAGE_MANIFEST = '+$json+';'+[Environment]::NewLine;" ^
  "[System.IO.File]::WriteAllText($output,$content,[System.Text.UTF8Encoding]::new($false));" ^
  "Write-Host '';" ^
  "Write-Host 'EIDOS · GALERIA ACTUALIZADA';" ^
  "Write-Host '---------------------------';" ^
  "Write-Host ('Imagenes encontradas: ' + $items.Count);" ^
  "Write-Host 'Lista reconstruida DESDE CERO.';" ^
  "Write-Host 'Nuevas: anadidas | Borradas: eliminadas | Renombradas: actualizadas';" ^
  "Write-Host '';"

if errorlevel 1 (
  echo.
  echo ERROR al actualizar la galeria.
  pause
  exit /b 1
)

echo.
echo LISTO.
echo.
echo Sube a GitHub:
echo   - las imagenes que hayas anadido, borrado o renombrado
echo   - gallery\js\image-manifest.js
echo.
echo NOTA: Este BAT ya no necesita generar_galeria.py para funcionar.
echo Puedes conservar el PY como copia legible, pero si se borra no pasa nada.
echo.
pause
