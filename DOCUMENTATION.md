# Insightful Time Tracker - Complete Documentation

##  Deployment URLs

- **Frontend (Web Dashboard)**: `https://your-frontend-app.vercel.app`
- **Backend API**: `https://insightful-server-production.up.railway.app/api`
- **Desktop App**: DMG (macOS) and EXE (Windows) installers available

---

## Applications

1. **Web Dashboard** - Next.js admin interface for managing employees, projects, and analytics
2. **Desktop App** - Electron app for time tracking and automatic screenshots
3. **Backend API** - Node.js/Express REST API with MongoDB and AWS S3

---

## Key Features

### User Management
- Admin dashboard with full organizational control
- Email invitation system for employee onboarding
- JWT-based secure authentication with refresh tokens
- Role-based access control (Admin/Employee)

### Time Tracking
- Manual and automatic time entry
- Real-time tracking with start/stop timer
- Project and task association
- Break period management
- Shift history and reports

### Screenshot Monitoring
- Automatic screenshots at configurable intervals (default: 5 minutes)
- Active window detection and application tracking
- Secure AWS S3 storage with presigned URLs
- Privacy-focused (only during active tracking)

### Analytics & Reports
- Dashboard overview (employees, shifts, screenshots, time)
- Screenshot gallery with filters
- App usage analytics
- Time tracking reports per employee/project
- Employee productivity metrics

### Project & Task Management
- Project creation with client information
- Task management with status tracking
- Employee assignment to projects/tasks
- Project time tracking and budget management

### Desktop App Features
- Native installers (DMG/EXE)
- System tray integration
- Accessibility permission handling
- Offline support with sync
- Auto-start option

---

## Technology Stack

**Frontend**: Next.js 14, TypeScript, Tailwind CSS, Axios  
**Desktop**: Electron 27, Next.js, electron-store, active-win  
**Backend**: Express, TypeScript, MongoDB, AWS S3, JWT  
**Deployment**: Vercel (Frontend), Railway (Backend), MongoDB Atlas

---

## Admin Credentials

**Email**: `admin@company.com`  
**Password**: `SecurePassword123!`

---

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure MongoDB, AWS, SMTP
npm run seed:admin
npm run dev
```

### Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=https://insightful-server-production.up.railway.app/api" > .env.local
npm run dev
```

### Desktop App
```bash
cd desktop-app
npm install
# Configure .env.local in renderer folder
npm run dev           # Development
npm run build:mac     # Build macOS DMG
npm run build:win     # Build Windows EXE
```

---

## API Base URL
```
https://insightful-server-production.up.railway.app/api
```

**Authentication**: All protected endpoints require JWT token
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication API

### Login
`POST /auth/login`
```json
{
  "email": "admin@company.com",
  "password": "SecurePassword123!"
}
```

### Refresh Token
`POST /auth/refresh`
```json
{
  "refreshToken": "your-refresh-token"
}
```

### Get Current User
`GET /auth/me`

### Logout
`POST /auth/logout`

---

## Employee API

### Create Employee (Invite)
`POST /employees`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "organizationId": "org_id",
  "teamId": "team_id",
  "role": "employee",
  "hourlyRate": 50
}
```

### List Employees
`GET /employees?organizationId=org_id&status=active`

### Get Employee
`GET /employees/:id`

### Update Employee
`PUT /employees/:id`

### Delete Employee
`DELETE /employees/:id`

### Setup Account
`POST /employees/setup-account`
```json
{
  "token": "invite_token",
  "password": "SecurePassword123!"
}
```

---

## Project API

### Create Project
`POST /projects`
```json
{
  "name": "Website Redesign",
  "description": "Complete redesign",
  "clientName": "Acme Corp",
  "organizationId": "org_id",
  "employees": ["emp_id_1"],
  "budget": 50000,
  "status": "active"
}
```

### List Projects
`GET /projects?organizationId=org_id&status=active`

### Get Project
`GET /projects/:id`

### Update Project
`PUT /projects/:id`

### Delete Project
`DELETE /projects/:id`

---

## Task API

### Create Task
`POST /tasks`
```json
{
  "name": "Design Homepage",
  "projectId": "project_id",
  "employeeId": "employee_id",
  "status": "pending",
  "priority": "high"
}
```

### List Tasks
`GET /tasks?projectId=proj_id&status=pending`

### Update Task
`PUT /tasks/:id`

### Delete Task
`DELETE /tasks/:id`

---

## Shift (Time Entry) API

### Start Tracking
`POST /shifts`
```json
{
  "employeeId": "emp_id",
  "projectId": "proj_id",
  "taskId": "task_id",
  "type": "manual",
  "start": "2024-11-16T09:00:00Z"
}
```

### Stop Tracking
`PUT /shifts/:id`
```json
{
  "end": "2024-11-16T17:00:00Z"
}
```

### List Shifts
`GET /shifts?employeeId=emp_id&startDate=2024-11-01&endDate=2024-11-30`

### Get Active Shift
`GET /shifts/active?employeeId=emp_id`

---

## Screenshot API

### Upload Screenshot
`POST /screenshots/upload`  

Form fields:
- `file`: Screenshot image file
- `employeeId`: Employee ID
- `projectId`: Project ID
- `taskId`: Task ID (optional)
- `activeApp`: Active application name
- `timestamp`: Timestamp

### List Screenshots
`GET /screenshots?employeeId=emp_id&projectId=proj_id&startDate=2024-11-01&limit=50`

### Get Screenshot
`GET /screenshots/:id`

### Delete Screenshot
`DELETE /screenshots/:id`

---

## Analytics API

### Dashboard Stats
`GET /analytics/dashboard?organizationId=org_id`

Returns: totalEmployees, activeShiftsToday, totalScreenshotsToday, totalTimeToday

### Time Tracking Report
`GET /analytics/time-tracking?employeeId=emp_id&startDate=2024-11-01&endDate=2024-11-30`

Returns: totalTime, totalShifts, breakdown by project and date

### App Usage Report
`GET /analytics/app-usage?employeeId=emp_id&startDate=2024-11-01&limit=10`

Returns: App usage statistics with duration and percentage

### Employee Productivity
`GET /analytics/productivity?employeeId=emp_id&startDate=2024-11-01&endDate=2024-11-30`

Returns: totalTime, screenshots, productivity score, top apps

### Project Time Report
`GET /analytics/project-time?projectId=proj_id&startDate=2024-11-01&endDate=2024-11-30`

Returns: Project time breakdown by employee and task

---

## Organization API

### Create Organization
`POST /organizations`

### List Organizations
`GET /organizations`

### Update Organization
`PUT /organizations/:id`

---

## Team API

### Create Team
`POST /teams`

### List Teams
`GET /teams?organizationId=org_id`

### Update Team
`PUT /teams/:id`

---

## Database Models

### User/Employee
- name, email, password, phone
- organizationId, teamId
- role (admin/employee)
- hourlyRate, status
- inviteToken, inviteTokenExpiry

### Project
- name, description, clientName
- organizationId, employees[]
- budget, deadline, status

### Task
- name, description
- projectId, employeeId
- status, priority
- estimatedHours, actualHours

### Shift
- employeeId, projectId, taskId
- start, end, totalTime
- type (manual/automatic)

### Screenshot
- filePath (S3 URL)
- employeeId, projectId, taskId
- timestamp, activeApp
- mouseActivity, keyboardActivity

### Break
- shiftId, employeeId
- start, end, duration

### AppUsage
- employeeId, projectId, shiftId
- appName, appPath
- duration, timestamp

---

##  Security Features

- JWT authentication with access & refresh tokens
- Bcrypt password hashing
- Role-based authorization middleware
- CORS protection
- Rate limiting
- Presigned S3 URLs for screenshots (1 hour expiry)

---

##  Installation Files

### macOS
- `Insightful Time Tracker-1.0.0-arm64.dmg` (Apple Silicon)
- `Insightful Time Tracker-1.0.0.dmg` (Intel)

### Windows
- `Insightful Time Tracker Setup 1.0.0.exe` (Installer)
- `Insightful Time Tracker 1.0.0.exe` (Portable)

---

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET_NAME=insightful-clone-screenshots
AWS_REGION=us-east-1
FRONTEND_URL=https://insightful-server.vercel.app/
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://insightful-server-production.up.railway.app/api
```

### Desktop App (renderer/.env.local)
```env
NEXT_PUBLIC_API_URL=https://insightful-server-production.up.railway.app/api
NEXT_PUBLIC_SCREENSHOT_INTERVAL_SECONDS=300
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-aws-key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-aws-secret
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=insightful-clone-screenshots
NEXT_PUBLIC_AWS_REGION=us-east-1
```

---
