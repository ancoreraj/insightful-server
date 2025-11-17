# Insightful Time Tracker - Postman Collection Guide

## 🚀 Base URL
```
https://insightful-server-production.up.railway.app/api
```

## 🔑 Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <your-access-token>
```

---

## 📋 Complete API Endpoints

### 1. Authentication (`/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/login` | ❌ | Login with email/password |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout user |
| POST | `/auth/setup-account` | ❌ | Complete employee registration |
| POST | `/auth/api-token` | ✅ Admin | Create API token |
| GET | `/auth/api-tokens` | ✅ | List API tokens |
| DELETE | `/auth/api-token/:id` | ✅ | Revoke API token |

### 2. Employees (`/employee`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/employee` | ✅ Admin | Create employee (send invitation) |
| GET | `/employee` | ✅ | List all employees |
| GET | `/employee/:id` | ✅ | Get employee by ID |
| PUT | `/employee/:id` | ✅ Admin | Update employee |
| DELETE | `/employee/:id` | ✅ Admin | Deactivate employee |
| PUT | `/employee/:id/reactivate` | ✅ Admin | Reactivate employee |

### 3. Projects (`/project`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/project` | ✅ Admin | Create project |
| GET | `/project` | ✅ | List all projects |
| GET | `/project/:id` | ✅ | Get project by ID |
| PUT | `/project/:id` | ✅ Admin | Update project |
| DELETE | `/project/:id` | ✅ Admin | Delete project |
| PUT | `/project/:id/archive` | ✅ Admin | Archive project |
| PUT | `/project/:id/unarchive` | ✅ Admin | Unarchive project |
| POST | `/project/:id/employees` | ✅ Admin | Add employees to project |
| DELETE | `/project/:id/employees/:employeeId` | ✅ Admin | Remove employee from project |

### 4. Tasks (`/task`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/task` | ✅ Admin | Create task |
| POST | `/task/default/:projectId` | ✅ Admin | Create default task |
| GET | `/task` | ✅ | List all tasks |
| GET | `/task/:id` | ✅ | Get task by ID |
| PUT | `/task/:id` | ✅ Admin | Update task |
| DELETE | `/task/:id` | ✅ Admin | Delete task |
| PUT | `/task/:id/employee` | ✅ Admin | Assign employee to task |
| DELETE | `/task/:id/employee` | ✅ Admin | Unassign employee from task |

### 5. Shifts - Time Tracking (`/analytics`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/analytics/shift` | ✅ | Start tracking time |
| GET | `/analytics/shift` | ✅ | List all shifts |
| GET | `/analytics/shift/:id` | ✅ | Get shift by ID |
| PUT | `/analytics/shift/:id` | ✅ | Update shift (stop tracking) |
| POST | `/analytics/shift/end` | ✅ | End active shift |
| PUT | `/analytics/shift/:id/paid` | ✅ Admin | Mark shift as paid |
| DELETE | `/analytics/shift/:id` | ✅ Admin | Delete shift |

### 6. Screenshots (`/analytics`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/analytics/screenshot` | ✅ | Upload screenshot (multipart/form-data) |
| GET | `/analytics/screenshot` | ✅ | List screenshots |
| GET | `/analytics/screenshot-paginate` | ✅ | List screenshots with pagination |
| GET | `/analytics/screenshot/:id` | ✅ | Get screenshot by ID |
| GET | `/analytics/screenshot/stats` | ✅ Admin | Get screenshot statistics |
| GET | `/analytics/screenshot/permission-issues` | ✅ Admin | Get screenshots with permission issues |
| DELETE | `/analytics/screenshot/:id` | ✅ Admin | Delete screenshot |

### 7. Analytics (`/analytics`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/analytics/activity` | ✅ | List employee activities |
| GET | `/analytics/break` | ✅ | List break periods |
| GET | `/analytics/project-time` | ✅ | Get time spent per project |
| GET | `/analytics/manual-entry` | ✅ | List manual time entries |

### 8. App Usage (`/app-usage`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/app-usage` | ✅ | Get application usage statistics |

---

## 📝 Sample Requests

### Login
```bash
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "SecurePassword123!"
}
```

### Create Employee
```bash
POST {{baseUrl}}/employee
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "organizationId": "org_id",
  "teamId": "team_id",
  "role": "employee",
  "hourlyRate": 50
}
```

### Start Time Tracking
```bash
POST {{baseUrl}}/analytics/shift
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "employeeId": "employee_id",
  "projectId": "project_id",
  "taskId": "task_id",
  "type": "manual",
  "start": "2024-11-16T09:00:00Z"
}
```

### Upload Screenshot
```bash
POST {{baseUrl}}/analytics/screenshot
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data

screenshot: (binary file)
employeeId: employee_id
projectId: project_id
taskId: task_id
activeApp: Google Chrome
timestamp: 2024-11-16T10:30:00Z
```

### List Employees
```bash
GET {{baseUrl}}/employee?status=active
Authorization: Bearer {{accessToken}}
```

---

## 🎯 Quick Import to Postman

1. Open Postman
2. Click "Import" button
3. Create new collection "Insightful Time Tracker API"
4. Add variable `baseUrl` = `https://insightful-server-production.up.railway.app/api`
5. Add variable `accessToken` = (will be set after login)
6. Add the endpoints from the tables above
7. Set Authorization to "Bearer Token" with `{{accessToken}}`

---

## 🔄 Authentication Flow

1. **Login** → Get `accessToken` and `refreshToken`
2. **Save tokens** → Store in Postman variables
3. **Use accessToken** → Add to Authorization header for all requests
4. **Refresh when expired** → Use `/auth/refresh` endpoint

---

## 📊 Query Parameters

### Common Filters:
- `employeeId` - Filter by employee
- `projectId` - Filter by project
- `taskId` - Filter by task
- `startDate` - Start date filter (ISO 8601)
- `endDate` - End date filter (ISO 8601)
- `status` - Filter by status (active/inactive/completed)
- `limit` - Limit results (default: 10)
- `page` - Page number for pagination
- `sortBy` - Sort direction (asc/desc)

---

## ✅ Test Data

**Admin Credentials:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePassword123!"
}
```

---

## 🛠️ Endpoint Summary

| Category | Endpoints |
|----------|-----------|
| Authentication | 7 endpoints |
| Employees | 6 endpoints |
| Projects | 9 endpoints |
| Tasks | 8 endpoints |
| Shifts | 7 endpoints |
| Screenshots | 7 endpoints |
| Analytics | 4 endpoints |
| App Usage | 1 endpoint |
| **Total** | **49 endpoints** |

---

## 📦 Download Full Postman Collection

A complete Postman collection JSON file is available in the repository root:
- `Insightful_API_Collection.postman_collection.json`

Import this file directly into Postman for all configured endpoints with examples!
