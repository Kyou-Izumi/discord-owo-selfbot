@echo off

echo Installing dependencies...
call npm i
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies.
    exit /b 1
)

echo Updating dependencies...
call npm update
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to update dependencies.
    exit /b 1
)

echo Starting index.js...
node index.js

pause
