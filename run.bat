@echo off
ECHO "Starting the project..."

REM --- Client ---
ECHO "Setting up client..."
cd client
IF NOT EXIST "node_modules" (
    ECHO "node_modules not found for client, running npm install..."
    call npm install
)
ECHO "Starting client..."
start "Client" cmd /c "npm run dev"

REM --- Server ---
ECHO "Setting up server..."
cd ../server
IF NOT EXIST "node_modules" (
    ECHO "node_modules not found for server, running npm install..."
    call npm install
)
ECHO "Starting server..."
start "Server" cmd /c "npm start"

ECHO "Both client and server are starting in separate windows."
pause
