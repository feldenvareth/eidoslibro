@echo off
setlocal
cd /d "%~dp0"

echo.
echo ==========================================
echo        EIDOS - ACTUALIZAR MUSICA
echo ==========================================
echo.

set "MUSIC=%~dp0.."
set "SONGS=%MUSIC%\songs"
set "OUTPUT=%MUSIC%\js\music-manifest.js"

if not exist "%SONGS%\" (
  echo ERROR: No encuentro la carpeta:
  echo %SONGS%
  echo.
  pause
  exit /b 1
)

if not exist "%MUSIC%\js\" mkdir "%MUSIC%\js"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$songs=[System.IO.Path]::GetFullPath('%SONGS%');" ^
  "$output=[System.IO.Path]::GetFullPath('%OUTPUT%');" ^
  "$exts=@('.mp3','.wav','.m4a','.aac','.ogg','.oga','.opus','.flac','.webm');" ^
  "$files=Get-ChildItem -LiteralPath $songs -File -Recurse | Where-Object { $exts -contains $_.Extension.ToLowerInvariant() } | Sort-Object FullName;" ^
  "$items=@();" ^
  "foreach($f in $files){" ^
  "  $rel=$f.FullName.Substring($songs.Length).TrimStart('\').Replace('\','/');" ^
  "  $parts=$rel.Split('/');" ^
  "  $language=if($parts.Count -gt 1){$parts[0].ToLowerInvariant()}else{'root'};" ^
  "  $title=[System.IO.Path]::GetFileNameWithoutExtension($f.Name) -replace '[_-]+',' ' -replace '\s+',' ';" ^
  "  $title=$title.Trim();" ^
  "  $items += [pscustomobject]@{file=$rel;language=$language;title=$title};" ^
  "};" ^
  "$json=$items | ConvertTo-Json -Compress -Depth 4;" ^
  "$content='/* AUTO-GENERADO. NO EDITAR A MANO.'+[Environment]::NewLine+'   Ejecuta music/actualizar-musica/ACTUALIZAR_MUSICA.bat */'+[Environment]::NewLine+'window.EIDOS_MUSIC_MANIFEST = '+$json+';'+[Environment]::NewLine;" ^
  "[System.IO.File]::WriteAllText($output,$content,[System.Text.UTF8Encoding]::new($false));" ^
  "Write-Host '';" ^
  "Write-Host 'EIDOS · MUSICA ACTUALIZADA';" ^
  "Write-Host '------------------------';" ^
  "Write-Host ('Canciones encontradas: ' + $items.Count);" ^
  "$items | Group-Object language | Sort-Object Name | ForEach-Object { Write-Host ('  ' + $_.Name + ': ' + $_.Count) };" ^
  "Write-Host '';" ^
  "Write-Host 'Lista reconstruida DESDE CERO.';"

if errorlevel 1 (
  echo.
  echo ERROR al actualizar la musica.
  pause
  exit /b 1
)

echo.
echo LISTO.
echo Sube a GitHub las canciones modificadas y music\js\music-manifest.js
echo.
pause
