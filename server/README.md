# Task Management API - Backend

A **clean, modular, and production-ready** Node.js backend for the Task Management application with intelligent scheduling, team collaboration, and user authentication.

## 🚀 Features

- **User Authentication**
  - JWT-based authentication with refresh tokens
  - Google OAuth integration
  - Secure password hashing with bcrypt
  - Role-based access control (User, Team Member, Admin)

- **Task Management**
  - Create, read, update, delete tasks
  - Task prioritization (Low, Medium, High, Urgent)
  - Task status tracking (To Do, In Progress, Completed)
  - Task splitting into intervals
  - Team task assignment

- **Team Collaboration**
  - Create and manage teams
  - Add/remove team members
  - Team-based task assignment
  - Team admin permissions

- **Intelligent Scheduling**
  - AI-powered schedule generation
  - Considers user preferences, work hours, and priorities
  - Automatic conflict detection and resolution
  - Personal event integration
  - Customizable scheduling preferences

- **User Preferences**
  - Configurable working hours and days
  - Auto-split long tasks
  - Break duration settings
  - Efficiency curve optimization

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Additional Documentation](#additional-documentation)

## 🛠 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: SQLite3 with better-sqlite3
- **Authentication**: JWT (jsonwebtoken) + Google OAuth
- **Password Hashing**: bcryptjs
- **Environment**: dotenv
- **CORS**: cors middleware

## 🏗 Architecture

The backend follows a **clean, layered architecture** with clear separation of concerns:

```
┌─────────────────┐
│     Routes      │  ← HTTP handling (thin controllers)
└────────┬────────┘
         │
┌────────▼────────┐
│   Middleware    │  ← Auth, error handling, validation
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │  ← Business logic (to be added)
└────────┬────────┘
         │
┌────────▼────────┐
│     Models      │  ← Data access (repository pattern)
└────────┬────────┘
         │
┌────────▼────────┐
│    Database     │  ← SQLite
└─────────────────┘
```

**Key Principles:**
- ✅ Separation of concerns
- ✅ Single responsibility
- ✅ DRY (Don't Repeat Yourself)
- ✅ Consistent error handling
- ✅ Standardized responses

For detailed architecture information, see [BACKEND_ARCHITECTURE.md](./docs/../BACKEND_ARCHITECTURE.md)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server
   PORT=3001
   NODE_ENV=development
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # CORS
   CORS_ORIGIN=http://localhost:5173
   
   # Database
   DB_PATH=./data/taskmanagement.db
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

5. **Verify it's running**
   ```bash
   curl http://localhost:3001/api/health
   ```
   
   Response:
   ```json
   {
     "status": "OK",
     "timestamp": "2025-11-02T12:00:00.000Z"
   }
   ```

## ⚙️ Configuration

Configuration is managed through environment variables and centralized in `config/appConfig.js`.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3001 | Server port |
| `NODE_ENV` | No | development | Environment (development/production/test) |
| `JWT_SECRET` | **Yes** | - | Secret key for JWT tokens |
| `JWT_EXPIRES_IN` | No | 24h | Access token expiration |
| `JWT_REFRESH_EXPIRES_IN` | No | 7d | Refresh token expiration |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth client secret |
| `CORS_ORIGIN` | No | http://localhost:5173 | Allowed CORS origins (comma-separated) |
| `DB_PATH` | No | ./data/taskmanagement.db | SQLite database path |

### Default Admin User

On first run, a default admin user is created:
- **Email**: admin@taskmanagement.com
- **Password**: admin123
- **Role**: admin

⚠️ **Change this password in production!**

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Google OAuth
```http
POST /api/auth/google
Content-Type: application/json

{
  "credential": "google-jwt-token"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh-token>
```

### Task Endpoints

All task endpoints require authentication: `Authorization: Bearer <access-token>`

#### Get Tasks
```http
GET /api/tasks?page=1&pageSize=6&userId=<optional>
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the task management app",
  "dueDate": "2025-11-10T00:00:00.000Z",
  "estimatedDuration": 120,
  "priority": "high",
  "status": "todo",
  "tags": ["urgent", "backend"]
}
```

#### Update Task
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "status": "completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

#### Split Task
```http
POST /api/tasks/:id/split
Content-Type: application/json

{
  "intervals": 3
}
```

### Team Endpoints

#### Get Teams
```http
GET /api/teams
```

#### Create Team
```http
POST /api/teams
Content-Type: application/json

{
  "name": "Development Team",
  "description": "Backend developers",
  "members": ["user-id-1", "user-id-2"]
}
```

#### Update Team
```http
PUT /api/teams/:id
```

#### Delete Team
```http
DELETE /api/teams/:id
```

### Schedule Endpoints

#### Generate Schedule
```http
POST /api/schedule
Content-Type: application/json

{
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": "2025-11-30T23:59:59.999Z",
  "respectPersonalEvents": true,
  "prioritizeUrgentTasks": true,
  "optimizeForEfficiency": true
}
```

#### Get Schedule
```http
GET /api/schedule
```

#### Get Conflicts
```http
GET /api/schedule/conflicts
```

#### Add Personal Event
```http
POST /api/schedule/events
Content-Type: application/json

{
  "title": "Doctor Appointment",
  "start": "2025-11-05T14:00:00.000Z",
  "end": "2025-11-05T15:00:00.000Z",
  "eventType": "personal"
}
```

#### Get/Update Preferences
```http
GET /api/schedule/preferences
PUT /api/schedule/preferences
```

### User Endpoints

#### Get All Users
```http
GET /api/users
```

#### Get Profile
```http
GET /api/users/profile
```

#### Update Profile
```http
PUT /api/users/profile
Content-Type: application/json

{
  "name": "John Doe Updated",
  "workingHours": {
    "start": "09:00",
    "end": "17:00",
    "daysOfWeek": [1, 2, 3, 4, 5]
  }
}
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Optional success message"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { /* Optional error details */ }
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 6,
    "totalCount": 42,
    "totalPages": 7,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## 📁 Project Structure

```
server/
├── config/                  # Configuration files
│   ├── appConfig.js        # Centralized app configuration
│   ├── jwt.js              # JWT configuration
│   └── google_client.js    # Google OAuth config
├── constants/              # Constants and enums
│   └── index.js           # All constants, enums, messages
├── data/                   # Database files
│   └── taskmanagement.db  # SQLite database
├── middleware/             # Express middleware
│   ├── auth.js            # Authentication middleware
│   └── errorHandler.js    # Global error handling
├── models/                 # Data access layer (Repository pattern)
│   ├── UserModel.js       # User CRUD operations
│   └── TaskModel.js       # Task CRUD operations
├── routes/                 # API routes (Controllers)
│   ├── auth.js            # Authentication routes
│   ├── tasks.js           # Task routes
│   ├── teams.js           # Team routes
│   ├── users.js           # User routes
│   └── schedule.js        # Schedule routes
├── services/               # Business logic layer
│   └── scheduleService.js # Schedule generation logic
├── utils/                  # Utility functions
│   ├── errors.js          # Custom error classes
│   ├── validation.js      # Input validation utilities
│   ├── dateUtils.js       # Date/time helpers
│   └── responseFormatter.js # Response formatting
├── tests/                  # Test files
├── database.js             # Database initialization
├── server.js               # Application entry point
├── package.json            # Dependencies and scripts
├── .env.example            # Example environment variables
├── README.md               # This file
├── QUICK_REFERENCE.md      # Quick reference guide
├── README_REFACTORING.md   # Refactoring documentation
├── REFACTORING_SUMMARY.md  # Refactoring summary
└── BACKEND_ARCHITECTURE.md # Architecture documentation
```

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run specific test file
npm test -- auth.test.js

# Lint code
npm run lint

# Format code
npm run format
```

### Code Style Guidelines

1. **Use Constants**
   ```javascript
   import { TaskStatus, UserRole } from './constants/index.js';
   if (task.status === TaskStatus.COMPLETED) { }
   ```

2. **Use Error Classes**
   ```javascript
   import { ValidationError, NotFoundError } from './utils/errors.js';
   throw new ValidationError('Invalid input');
   ```

3. **Use Models**
   ```javascript
   import TaskModel from './models/TaskModel.js';
   const task = TaskModel.findById(taskId);
   ```

4. **Use Async Handler**
   ```javascript
   import { asyncHandler } from './middleware/errorHandler.js';
   router.get('/', asyncHandler(async (req, res) => { }));
   ```

5. **Use Response Formatters**
   ```javascript
   import { sendSuccess, sendCreated } from './utils/responseFormatter.js';
   sendSuccess(res, data);
   ```

For detailed guidelines, see [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm run test:coverage
```

### Test Structure

```javascript
import { describe, it, expect } from 'jest';
import UserModel from './models/UserModel.js';

describe('UserModel', () => {
  it('should create a user', () => {
    const user = UserModel.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword'
    });
    
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

## 🚢 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database path
4. Set up proper CORS origins
5. Enable HTTPS
6. Change default admin password

### Deployment Platforms

#### Render
```bash
# Install Render CLI
npm install -g render

# Deploy
render deploy
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway up
```

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Deploy
heroku create
git push heroku main
```

### Production Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure production CORS
- [ ] Set up database backups
- [ ] Enable logging
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure rate limiting
- [ ] Set up CI/CD pipeline
- [ ] Review security headers

## 📚 Additional Documentation

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference guide with code examples
- **[README_REFACTORING.md](./README_REFACTORING.md)** - Detailed refactoring documentation
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Executive summary of refactoring
- **[BACKEND_ARCHITECTURE.md](./docs/../BACKEND_ARCHITECTURE.md)** - Architecture diagram and data flow

## 🔒 Security

- **Authentication**: JWT with refresh tokens
- **Password Security**: bcrypt hashing with salt rounds
- **SQL Injection**: Prevented with prepared statements
- **Input Validation**: Comprehensive validation utilities
- **Error Handling**: No sensitive data leaked in errors
- **CORS**: Configurable allowed origins
- **Rate Limiting**: (Recommended to add)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the code style guidelines
4. Write tests for new features
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  google_id TEXT UNIQUE,
  profile_picture TEXT,
  role TEXT CHECK(role IN ('user', 'team-member', 'admin')),
  working_hours_start TEXT,
  working_hours_end TEXT,
  working_days TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATETIME NOT NULL,
  estimated_duration INTEGER NOT NULL,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT CHECK(status IN ('todo', 'in-progress', 'completed')),
  assigned_to TEXT,
  team_id TEXT,
  created_by TEXT NOT NULL,
  tags TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users (id),
  FOREIGN KEY (team_id) REFERENCES teams (id),
  FOREIGN KEY (created_by) REFERENCES users (id)
);
```

For complete schema, see `database.js`

## 🐛 Troubleshooting

### Server won't start
- Check if port 3001 is available
- Verify JWT_SECRET is set in .env
- Check database file permissions

### JWT errors
- Verify JWT_SECRET is the same across restarts
- Check token expiration times
- Ensure Authorization header format: `Bearer <token>`

### Database errors
- Check database file path
- Verify write permissions
- Run database initialization: `node database.js`

### CORS errors
- Verify CORS_ORIGIN in .env
- Check frontend URL matches CORS_ORIGIN
- Ensure credentials: true in CORS config

## 📧 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact: your-email@example.com

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Node.js, Express, and SQLite**

🚀 **Status**: Production Ready | ✅ **Clean Code** | 📚 **Well Documented** | 🧪 **Testable**
