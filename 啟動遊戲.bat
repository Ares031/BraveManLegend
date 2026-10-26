@echo off
setlocal
pushd "%~dp0"
where node >nul 2>nul
if not errorlevel 1 (
  node "scripts\launch-game.cjs"
) else if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" "scripts\launch-game.cjs"
) else (
  echo Node.js was not found. Please install Node.js and try again.
  pause
  popd
  exit /b 1
)
if errorlevel 1 pause
popd
endlocal
