# Insightful Time Tracker

A comprehensive time tracking and employee monitoring system with automatic screenshot capture, project management, and detailed analytics.

---

## 📑 Documentation

- **[FEATURES.md](./FEATURES.md)** - Complete feature list
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Setup guide and technical details

---

## Live Deployment

- **Web Dashboard**: `https://insightful-server.vercel.app/`
- **Backend API**: `https://insightful-server-production.up.railway.app/api`
- **Desktop Apps**: DMG (macOS) and EXE (Windows) installers available from download page

---

## Demo Credentials

**Admin Access:**
- Email: `admin@company.com`
- Password: `SecurePassword123!`

---

## Demo Video

Watch a complete walkthrough of the Insightful Time Tracker application:

[![Insightful Time Tracker Demo](https://img.youtube.com/vi/AgHi1efWiiA/maxresdefault.jpg)](https://www.youtube.com/watch?v=AgHi1efWiiA)

**[▶️ Watch Full Demo on YouTube](https://www.youtube.com/watch?v=AgHi1efWiiA)**

---

## What is Insightful Time Tracker?

A modern, full-stack application designed to help organizations track employee time, monitor productivity, and manage projects efficiently. The system consists of three main components:

1. **Web Dashboard** - Admin interface for managing the organization
2. **Desktop App** - Employee app for time tracking with automatic screenshots
3. **Backend API** - RESTful API powering both applications

---

## Key Highlights

- **Automatic Time Tracking** - Desktop app with real-time timer
- **Screenshot Monitoring** - Captures screenshots every 5 minutes with active app detection
- **Analytics Dashboard** - Comprehensive reports and productivity metrics
- **Team Management** - Organize employees into teams and projects
- **Task Tracking** - Create and assign tasks with status management
- **Secure** - JWT authentication, encrypted passwords, role-based access
- **Cross-Platform** - Works on macOS, Windows, and web browsers

---

## Technology Stack

### Frontend (Web)
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios

### Desktop App
- Electron 27
- Next.js (Renderer)
- TypeScript
- electron-store
- active-win

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- AWS S3
- JWT Authentication
- Nodemailer

### Infrastructure
- MongoDB Atlas (Database)
- AWS S3 (Screenshot Storage)
- Railway (Backend Hosting)
- Vercel (Frontend Hosting)

---

## Project Structure

```
insightful-api-clone/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth & validation
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helpers
│   └── package.json
│
├── frontend/             # Next.js Web Dashboard
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── package.json
│
├── desktop-app/          # Electron Desktop App
│   ├── main/             # Electron main process
│   ├── renderer/         # Next.js renderer
│   └── package.json
│
├── FEATURES.md           # Complete feature list
├── DOCUMENTATION.md      # Setup & technical docs
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance
- AWS S3 bucket
- SMTP server

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run seed:admin
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=https://insightful-server-production.up.railway.app/api" > .env.local
npm run dev
```

### Desktop App Setup
```bash
cd desktop-app
npm install
# Configure renderer/.env.local
npm run dev
```

---

## Features at a Glance

### For Administrators
- Employee onboarding via email invitations
- Project and task management
- Real-time activity monitoring
- Screenshot gallery
- Productivity analytics
- Time and cost tracking
- Team management

### For Employees
- Simple desktop app for time tracking
- Automatic screenshot capture
- Project and task assignment
- Break management
- Personal time reports

---

## Core API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Employees
- `POST /api/employees` - Create employee (send invitation)
- `GET /api/employees` - List employees
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Time Tracking
- `POST /api/shifts` - Start tracking
- `PUT /api/shifts/:id` - Stop tracking
- `GET /api/shifts` - Get shift history
- `GET /api/shifts/active` - Get active shift

### Screenshots
- `POST /api/screenshots/upload` - Upload screenshot
- `GET /api/screenshots` - List screenshots
- `DELETE /api/screenshots/:id` - Delete screenshot

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/time-tracking` - Time reports
- `GET /api/analytics/app-usage` - App usage stats
- `GET /api/analytics/productivity` - Employee productivity

---

## Screenshots

### Web Dashboard
- **Dashboard Overview**: Real-time metrics and stats
- **Employee Management**: Invite and manage employees
- **Screenshot Gallery**: View all captured screenshots
- **Time Reports**: Detailed time tracking reports
- **Project Management**: Create and track projects

### Desktop App
- **Time Tracker**: Simple start/stop interface
- **Active Project**: Display current project/task
- **System Tray**: Minimize to tray
- **Auto Screenshots**: Background capture

---

## Security Features

- JWT-based authentication with refresh tokens
- Bcrypt password hashing
- Role-based access control (Admin/Employee)
- CORS protection
- API rate limiting
- Presigned S3 URLs with 1-hour expiry
- Input validation and sanitization

---

## Analytics & Reports

- **Dashboard Metrics**: Employees, shifts, screenshots, time
- **Time Reports**: By employee, project, date range
- **App Usage**: Most used applications with percentages
- **Productivity Scores**: Based on activity and time
- **Project Analytics**: Time and cost tracking per project

---

## Environment Variables

### Backend
```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
FRONTEND_URL=your-frontend-url
```

### Frontend
```env
NEXT_PUBLIC_API_URL=your-backend-api-url
```

---

For questions or issues, please refer to the documentation files:
- **FEATURES.md** - Complete feature list
- **DOCUMENTATION.md** - Technical documentation and setup guide

---