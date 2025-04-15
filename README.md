# Elder Manager Application

This is a desktop application for managing elder care services, built with Electron, React, and Node.js.

## Project Structure

The project is organized into three main parts:

### 1. Frontend (`/frontend`)
- React-based user interface
- Contains all UI components and frontend logic
- Built with modern web technologies

### 2. Backend (`/backend`)
- Node.js server
- Handles data processing and business logic
- Manages database operations

### 3. Electron (`/electron`)
- Desktop application wrapper
- Handles application lifecycle
- Manages native desktop features

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Development mode:
```bash
npm run dev
```

3. Build the application:
```bash
npm run build
```

4. Create distribution package:
```bash
npm run dist
```

## Development

- Frontend runs on `http://localhost:3000`
- Backend API runs on `http://localhost:5000`
- Electron app will launch automatically in development mode

## Building for Production

The application can be built for Windows as a portable executable:
```bash
npm run build:portable
```

The output will be in the `dist` directory. 

-- start-backend.bat
@echo off
echo Starting Backend Server...
cd /d %~dp0
start /min cmd /c "node server.js"