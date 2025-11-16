# Insightful API Clone - Backend

## Overview

This is the backend API service for the Time Tracking Trial (T3) project, implementing an Insightful-compatible API for time tracking, employee management, and project management.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Email**: Nodemailer

## Features

### Core APIs
- **Employee API**: Employee management (invite, update, deactivate)
- **Project API**: Project CRUD operations
- **Task API**: Task management within projects
- **Time Tracking API**: Shift tracking, clock in/out functionality
- **Screenshots API**: Screenshot management with permission tracking
- **Authentication API**: JWT-based authentication

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (v6+ recommended)
- npm or yarn package manager

## Installation

1. **Clone the repository** (if not already done)
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file and configure:
- MongoDB connection string
- JWT secrets
- Email configuration (for employee invitations)
- Other settings as needed

4. **Create necessary directories**
```bash
mkdir logs
mkdir uploads
```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with hot-reload using nodemon on port 3000 (default)

### Production Build
```bash
npm run build
npm start
```

## API Endpoints

Base URL: `http://localhost:3000/api`

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Employee Management
- `POST /api/employee` - Create/invite new employee
- `GET /api/employee` - List all employees
- `GET /api/employee/:id` - Get employee details
- `PUT /api/employee/:id` - Update employee
- `POST /api/employee/deactivate/:id` - Deactivate employee

### Project Management
- `POST /api/project` - Create new project
- `GET /api/project` - List all projects
- `GET /api/project/:id` - Get project details
- `PUT /api/project/:id` - Update project
- `DELETE /api/project/:id` - Delete project

### Task Management
- `POST /api/task` - Create new task
- `GET /api/task` - List all tasks
- `GET /api/task/:id` - Get task details
- `PUT /api/task/:id` - Update task
- `DELETE /api/task/:id` - Delete task

### Analytics & Time Tracking
- `GET /api/analytics/shift` - Get shift data
- `POST /api/analytics/shift` - Clock in/out
- `GET /api/analytics/activity` - Get activity data
- `GET /api/analytics/break` - Get break data
- `GET /api/analytics/screenshot` - Get screenshots
- `GET /api/analytics/screenshot/:id` - Get specific screenshot
- `GET /api/analytics/project-time` - Get project time data
- `POST /api/analytics/manual-entry` - Create manual time entry

### Health Check
- `GET /health` - API health status

## Project Structure

```
backend/
├── src/
│   ├── index.ts           # Application entry point
│   ├── app.ts             # Express app configuration
│   ├── config/            # Configuration files
│   │   └── database.ts    # MongoDB connection
│   ├── routes/            # API route definitions
│   │   ├── index.ts       # Main router
│   │   ├── auth.routes.ts
│   │   ├── employee.routes.ts
│   │   ├── project.routes.ts
│   │   ├── task.routes.ts
│   │   └── analytics.routes.ts
│   ├── controllers/       # Route controllers (to be implemented)
│   ├── models/           # Mongoose models (to be implemented)
│   ├── middleware/       # Custom middleware
│   │   ├── errorHandler.ts
│   │   └── notFoundHandler.ts
│   ├── services/         # Business logic (to be implemented)
│   ├── utils/           # Utility functions
│   │   └── logger.ts
│   └── types/           # TypeScript type definitions (to be implemented)
├── logs/                # Application logs
├── uploads/            # Uploaded files (screenshots)
├── package.json
├── tsconfig.json
├── nodemon.json
├── .env.example
└── README.md
```

## API Rate Limiting

The API implements rate limiting to protect against abuse:
- Default: 200 requests per minute per IP
- Configurable via environment variables

## Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Using express-validator (to be implemented)
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Using bcrypt (to be implemented)

## Development Notes

### Current Status
- ✅ Basic project structure set up
- ✅ Express server configuration
- ✅ MongoDB connection setup
- ✅ Logging system
- ✅ Error handling middleware
- ✅ Route structure defined
- ⏳ Employee API implementation (pending)
- ⏳ Project API implementation (pending)
- ⏳ Task API implementation (pending)
- ⏳ Time tracking implementation (pending)
- ⏳ Screenshot handling (pending)
- ⏳ Authentication system (pending)

### Next Steps
1. Implement Mongoose models for all entities
2. Implement authentication middleware
3. Complete controller logic for each endpoint
4. Add input validation
5. Implement email service for invitations
6. Add unit and integration tests
7. Set up CI/CD pipeline

## Testing

```bash
# Run tests (to be implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or update connection string in `.env`
- Check if the database user has proper permissions

### Port Already in Use
- Change the PORT in `.env` file
- Or kill the process using the port: `lsof -i :3000` and `kill -9 <PID>`

### Module Not Found Errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## License

ISC

## Support

For questions or issues, please create an issue in the repository.
