# API Documentation

## 📚 Interactive API Documentation

The Insightful API Clone provides interactive API documentation powered by Swagger/OpenAPI.

### Access the Documentation

Once the server is running, visit:
```
http://localhost:3000/api-docs
```

## 🚀 Quick Start

### 1. Start the Server
```bash
npm run dev
```

### 2. Open API Documentation
Open your browser and navigate to: `http://localhost:3000/api-docs`

### 3. Authenticate
Most endpoints require authentication. To test authenticated endpoints:

1. **Login** to get an access token:
   - Use the `POST /api/auth/login` endpoint
   - Enter credentials (email and password)
   - Copy the `accessToken` from the response

2. **Authorize** in Swagger:
   - Click the 🔓 **Authorize** button at the top right
   - Enter: `Bearer <your_access_token>`
   - Click **Authorize**

3. **Test Endpoints**:
   - Now you can test any authenticated endpoint using the "Try it out" button

## 📋 API Categories

### 🔐 Authentication
- **POST** `/api/auth/login` - Login with email/password
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/logout` - Logout and invalidate tokens
- **POST** `/api/auth/api-token` - Create API token
- **GET** `/api/auth/api-token` - List API tokens
- **DELETE** `/api/auth/api-token/:id` - Revoke API token
- **POST** `/api/auth/setup-account` - Complete invitation

### 👥 Employee Management
- **POST** `/api/employee/invite` - Invite new employee (Admin)
- **GET** `/api/employee` - List all employees
- **GET** `/api/employee/:id` - Get employee by ID
- **PUT** `/api/employee/:id` - Update employee (Admin)
- **POST** `/api/employee/:id/deactivate` - Deactivate employee (Admin)
- **POST** `/api/employee/:id/reactivate` - Reactivate employee (Admin)

### 📊 Project Management
- **POST** `/api/project` - Create project (Admin)
- **GET** `/api/project` - List all projects
- **GET** `/api/project/:id` - Get project by ID
- **PUT** `/api/project/:id` - Update project (Admin)
- **DELETE** `/api/project/:id` - Delete/Archive project (Admin)
- **PUT** `/api/project/:id/archive` - Archive project (Admin)
- **PUT** `/api/project/:id/unarchive` - Unarchive project (Admin)
- **POST** `/api/project/:id/employees` - Add employees to project (Admin)
- **DELETE** `/api/project/:id/employees/:employeeId` - Remove employee (Admin)
- **POST** `/api/project/:id/teams` - Add teams to project (Admin)
- **DELETE** `/api/project/:id/teams/:teamId` - Remove team (Admin)

### ✅ Task Management
- **POST** `/api/task` - Create task (Admin)
- **POST** `/api/task/default/:projectId` - Create default task for project (Admin)
- **GET** `/api/task` - List all tasks
- **GET** `/api/task/:id` - Get task by ID
- **PUT** `/api/task/:id` - Update task (Admin)
- **DELETE** `/api/task/:id` - Delete task (Admin)
- **POST** `/api/task/:id/employees` - Add employees to task (Admin)
- **DELETE** `/api/task/:id/employees/:employeeId` - Remove employee (Admin)
- **POST** `/api/task/:id/teams` - Add teams to task (Admin)
- **DELETE** `/api/task/:id/teams/:teamId` - Remove team (Admin)

### ⏱️ Time Tracking (Shifts) - MOST IMPORTANT FOR PAYROLL
- **POST** `/api/analytics/shift` - Create shift (clock in)
- **GET** `/api/analytics/shift` - Find/list shifts with filters
- **GET** `/api/analytics/shift/:id` - Get shift by ID
- **PUT** `/api/analytics/shift/:id` - Update shift (Admin)
- **DELETE** `/api/analytics/shift/:id` - Delete shift (Admin)
- **POST** `/api/analytics/shift/end` - End active shift (clock out)
- **PUT** `/api/analytics/shift/:id/paid` - Mark shift as paid (Admin)

### 📸 Screenshots
- **POST** `/api/analytics/screenshot` - Create screenshot
- **GET** `/api/analytics/screenshot` - List screenshots
- **GET** `/api/analytics/screenshot-paginate` - Paginated screenshot list
- **GET** `/api/analytics/screenshot/:id` - Get screenshot by ID
- **DELETE** `/api/analytics/screenshot/:id` - Delete screenshot (Admin)
- **GET** `/api/analytics/screenshot/permission-issues` - Get permission issues (Admin)
- **GET** `/api/analytics/screenshot/stats` - Get screenshot statistics (Admin)

## 🔑 Authentication Flow

### Initial Setup
1. **Admin Login**: Use existing admin credentials to login
2. **Get Access Token**: Receive `accessToken` and `refreshToken`
3. **Use Access Token**: Include in all subsequent requests as Bearer token

### Invite Employee
1. **Admin invites employee**: `POST /api/employee/invite`
2. **Employee receives invitation email** with token
3. **Employee completes setup**: `POST /api/auth/setup-account`
4. **Employee can now login**: `POST /api/auth/login`

### Token Refresh
When access token expires:
1. Use `POST /api/auth/refresh` with refresh token
2. Get new access token
3. Continue using API

## 📊 Important Query Parameters

### Time-based Filtering
Most analytics endpoints support:
- `start` - Unix timestamp in milliseconds (required)
- `end` - Unix timestamp in milliseconds (required)
- `timezone` - Timezone offset string (optional)

Example:
```
?start=1731654000000&end=1731672000000
```

### Comma-Separated IDs
Filter by multiple IDs:
```
?employeeId=id1,id2,id3
?projectId=proj1,proj2
?taskId=task1,task2
```

### Pagination
- `limit` - Number of results (default varies by endpoint)
- `next` - Cursor token for next page (for paginated endpoints)

## 🎯 Common Use Cases

### 1. Track Employee Work Time
```bash
# Employee clocks in
POST /api/analytics/shift
{
  "type": "auto",
  "start": 1731654000000,
  "employeeId": "employee_id"
}

# Employee clocks out
POST /api/analytics/shift/end
{
  "employeeId": "employee_id",
  "endTime": 1731672000000
}

# Admin marks as paid
PUT /api/analytics/shift/:shiftId/paid
```

### 2. Monitor Screenshots
```bash
# Get all screenshots for date range
GET /api/analytics/screenshot?start=<start>&end=<end>

# Check permission issues
GET /api/analytics/screenshot/permission-issues?start=<start>&end=<end>

# Get statistics
GET /api/analytics/screenshot/stats?start=<start>&end=<end>
```

### 3. Manage Projects and Tasks
```bash
# Create project
POST /api/project
{
  "name": "Website Redesign",
  "billable": true
}

# Create default task for project
POST /api/task/default/:projectId

# Add employees to project
POST /api/project/:projectId/employees
{
  "employeeIds": ["emp1", "emp2"]
}
```

## 🔒 Authorization Levels

### Public Endpoints (No Auth Required)
- `POST /api/auth/login`
- `POST /api/auth/setup-account`
- `GET /health`

### Authenticated Endpoints
All other endpoints require valid Bearer token

### Admin-Only Endpoints
- Employee management (invite, deactivate, update)
- Project management (create, update, delete)
- Task management (create, update, delete)
- Shift management (update, delete, mark as paid)
- Screenshot deletion
- Permission issue viewing
- Statistics viewing

## 📝 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Resource not found"
  }
}
```

### Validation Error
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## 🔧 Testing with cURL

See individual endpoint documentation in Swagger UI for cURL examples, or refer to the comprehensive API examples provided in the development session.

## 📈 Rate Limiting

- **Window**: 60 seconds
- **Limit**: 200 requests per IP
- **Applies to**: All `/api/*` endpoints

When rate limit is exceeded:
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

## 🎨 Swagger UI Features

- **Try it out**: Test endpoints directly from the browser
- **Authorization**: Persist authentication across requests
- **Request Duration**: See how long each request takes
- **Filter**: Search for specific endpoints
- **Schema Viewing**: See detailed request/response schemas
- **Example Values**: Pre-filled example requests

## 🚨 Important Notes

### Timestamps
- All timestamps are in **Unix milliseconds** (not seconds)
- Example: `1731654000000` (not `1731654000`)
- Compatible with JavaScript `Date.now()` and Insightful API

### Permission Flag
Screenshots have a `permission` field (boolean) that indicates whether the local application had proper screen recording permissions at capture time.
- `true` - Proper permissions
- `false` - Missing permissions (e.g., macOS screen recording denied)

### Default Tasks
Each project should have a "default task" for simplified time logging. Create using:
```
POST /api/task/default/:projectId
```

### Multi-tenancy
All data is isolated by `organizationId`. Users can only access data within their organization.

## 📖 Additional Resources

- Full API contract: See `insightful-api-contract.json`
- cURL examples: Provided during implementation
- Postman collection: Can be generated from OpenAPI spec

## 🆘 Support

For issues or questions:
1. Check the Swagger UI documentation at `/api-docs`
2. Review error messages in responses
3. Check server logs for detailed error information
4. Verify authentication token is valid and not expired
