# Insightful Time Tracker - Features Overview

## Deployment URLs

- **Web Dashboard**: `https://your-app.vercel.app`
- **Backend API**: `https://insightful-server-production.up.railway.app/api`
- **Desktop App**: DMG (macOS), EXE (Windows)

---

## Core Features

### 1. User Management
- ✅ Admin and Employee role-based access
- ✅ Email invitation system for onboarding
- ✅ Secure JWT authentication with refresh tokens
- ✅ Password reset functionality
- ✅ User profile management

### 2. Time Tracking
- ✅ Manual time entry with start/stop timer
- ✅ Real-time elapsed time display
- ✅ Associate time with projects and tasks
- ✅ Shift history and reports
- ✅ Break period management
- ✅ Automatic shift detection

### 3. Screenshot Monitoring
- ✅ Automatic screenshots every 5 minutes (configurable)
- ✅ Active window detection
- ✅ Application usage tracking
- ✅ Secure AWS S3 storage
- ✅ Mouse & keyboard activity detection
- ✅ Privacy-focused (only during tracking)

### 4. Project Management
- ✅ Create and manage projects
- ✅ Assign employees to projects
- ✅ Set budgets and deadlines
- ✅ Track project progress
- ✅ Client management

### 5. Task Management
- ✅ Create tasks within projects
- ✅ Assign tasks to employees
- ✅ Set priorities and due dates
- ✅ Track task status (pending/in progress/completed)
- ✅ Estimated vs actual hours

### 6. Analytics & Reports
- ✅ Dashboard with key metrics
- ✅ Screenshot gallery with filters
- ✅ App usage analytics
- ✅ Time tracking reports
- ✅ Employee productivity scores
- ✅ Project time breakdown
- ✅ Daily/weekly/monthly reports

### 7. Team Management
- ✅ Create and manage teams
- ✅ Assign employees to teams
- ✅ Team-based filtering and reports

### 8. Desktop Application
- ✅ Native installers (DMG for Mac, EXE for Windows)
- ✅ System tray integration
- ✅ Offline support with sync
- ✅ Auto-start on boot (optional)
- ✅ Real-time timer display
- ✅ Accessibility permission handling

### 9. Security
- ✅ JWT authentication
- ✅ Refresh token rotation
- ✅ Bcrypt password hashing
- ✅ Role-based authorization
- ✅ CORS protection
- ✅ API rate limiting
- ✅ Presigned S3 URLs (1-hour expiry)

---

## Analytics Features

### Dashboard Metrics
- Total employees count
- Active shifts today
- Total screenshots captured
- Total time tracked
- Active projects
- Completed tasks

### Reports
- Time tracking by employee/project/date
- App usage statistics with percentages
- Employee productivity scores
- Project cost tracking
- Daily/weekly activity trends

---

## Desktop App Capabilities

- Start/stop time tracking
- Automatic screenshot capture
- Active app detection
- Project and task selection
- Break management
- Offline queue with auto-sync
- Native notifications

---

## Web Dashboard Capabilities

- Employee management (invite, edit, delete)
- Project & task CRUD operations
- Screenshot gallery with filters
- Time tracking reports
- Analytics dashboard
- Team management
- Responsive design (mobile/tablet/desktop)

---

## Admin Features

- Full access to all employees, projects, tasks
- Analytics and reports for entire organization
- Employee productivity monitoring
- Project budget tracking
- Screenshot access control
- Organization settings

---

## Employee Features

- Personal time tracking
- View assigned projects and tasks
- Submit manual time entries
- View personal screenshots
- Track breaks
- Desktop app for automatic tracking

---

## Technical Highlights

- **Backend**: Node.js, Express, MongoDB, AWS S3
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Desktop**: Electron 27, Next.js renderer
- **Authentication**: JWT with refresh tokens
- **Storage**: MongoDB Atlas, AWS S3
- **Deployment**: Railway (Backend), Vercel (Frontend)
- **Real-time**: WebSocket support ready
- **API**: RESTful design with proper error handling
- **Code Quality**: TypeScript throughout, ESLint

---

## Installation Packages

### macOS
- **DMG Installer** (Apple Silicon & Intel)
- Code signing support ready
- Accessibility permission prompts

### Windows
- **NSIS Installer** (x64 & x86)
- **Portable EXE** (no installation)

---

## Quick Start

### Admin User
- Email: `admin@company.com`
- Password: `SecurePassword123!`

### API Base URL
```
https://insightful-server-production.up.railway.app/api
```

---

## Support & Documentation

- Full API documentation in `API_CONTRACTS.md`
- Setup guide in `DOCUMENTATION.md`
- README for each component (backend, frontend, desktop-app)
