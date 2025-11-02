# Project Architecture & Design

## Executive Summary

This document provides a comprehensive overview of the **Task Management Web Application** architecture and design patterns. It serves as a reference guide for developers, architects, and stakeholders to understand the system's structure, technologies, and design decisions.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Technology Stack](#technology-stack)
4. [Design Principles](#design-principles)
5. [System Architecture Diagram](#system-architecture-diagram)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Database Architecture](#database-architecture)
9. [API Design](#api-design)
10. [Authentication & Security](#authentication--security)
11. [Deployment Architecture](#deployment-architecture)
12. [Design Decisions & Rationale](#design-decisions--rationale)

---

## System Overview

### Project Goals

- **Efficiency**: Intelligent scheduling algorithm to optimize task management
- **Collaboration**: Enable teams to work together seamlessly
- **Flexibility**: Support multiple subscription tiers (Free, Paid, Pro)
- **User Experience**: Intuitive, responsive, and accessible interface
- **Scalability**: Support growing user base without architectural changes
- **Security**: Robust authentication and authorization mechanisms

### Key Features

| Feature | Description | Target Users |
|---------|-------------|--------------|
| **Task Management** | Create, read, update, delete tasks with priorities and due dates | All users |
| **Team Collaboration** | Create teams, assign tasks, manage members | Paid/Pro users |
| **Smart Scheduling** | AI-powered calendar scheduling algorithm | Paid/Pro users |
| **Work Hours Tracking** | Log and track time spent on tasks | All users |
| **Personal Calendar** | Manage events, holidays, and schedule | All users |
| **Payment & Subscription** | Stripe integration for tier-based subscriptions | All users |
| **Google Authentication** | OAuth 2.0 login integration | All users |
| **Productivity Reports** | Analytics and insights on task completion | Paid/Pro users |

---

## Architecture Patterns

### 1. **Monorepo Architecture**

The project uses a **monorepo structure** combining frontend and backend in a single repository:

```
project/
├── /client          → React SPA
├── /server          → Express REST API
├── /docs            → Documentation
└── shared configs
```

**Benefits:**
- ✅ Unified codebase management
- ✅ Shared TypeScript types
- ✅ Simplified dependency management
- ✅ Single testing pipeline
- ✅ Easier CI/CD deployment

---

### 2. **MVC Architecture** (Backend)

```
Client Request
    ↓
Routes (Controller Layer)
    ↓
Services (Business Logic)
    ↓
Prisma ORM (Model Layer)
    ↓
SQLite Database
    ↓
Response to Client
```

**Components:**
- **Models**: Prisma schema defining data structure
- **Views**: JSON API responses
- **Controllers**: Route handlers processing requests

---

### 3. **Component-Based Architecture** (Frontend)

**Layered Components:**

```
Presentation Layer
├── Pages (Full page components)
├── Container Components (Logic + UI)
└── Presentational Components (UI only)

State Layer
├── Context API (Global state)
├── Zustand (Lightweight state)
└── Local State (useState)

Service Layer
├── API calls
└── Business logic
```

**Example Hierarchy:**
```
App.tsx (Root)
├── Header
├── Sidebar
└── Routes
    ├── Dashboard
    │   ├── TaskManager (Container)
    │   │   ├── TaskForm (Presentational)
    │   │   └── TaskCard[] (Presentational)
    │   ├── MyCalendar (Container)
    │   │   └── CalendarCell[] (Presentational)
    │   └── ScheduleView
    ├── TeamManager
    ├── UserProfile
    └── PaymentManager
```

---

### 4. **Service-Oriented Architecture**

Business logic separated into dedicated service modules:

```javascript
// Backend Services
scheduleService.js       // Smart scheduling algorithm
authService.js           // Authentication/Authorization logic
paymentService.js        // Payment processing
taskService.js           // Task operations
teamService.js           // Team management

// Frontend Services
api.ts                   // API calls
paymentService.ts        // Stripe integration
```

**Benefits:**
- Reusable logic across routes
- Easier unit testing
- Clear separation of concerns
- Simplified maintenance and debugging

---

### 5. **JWT-Based Authentication**

```
Login/Register → Generate JWT + Refresh Token
    ↓
Store in client (localStorage/sessionStorage)
    ↓
Include in API requests (Authorization header)
    ↓
Middleware verifies token signature
    ↓
Grant/Deny access based on token validity
    ↓
Token expiry → Use refresh token for new JWT
```

---

### 6. **RESTful API Design**

Standard HTTP methods for resource operations:

```
GET     /api/resource           → Retrieve all
GET     /api/resource/:id       → Retrieve one
POST    /api/resource           → Create
PUT     /api/resource/:id       → Update full
PATCH   /api/resource/:id       → Partial update
DELETE  /api/resource/:id       → Delete
```

---

## Technology Stack

### **Frontend Stack**

| Layer | Technology | Purpose | Status |
|-------|-----------|---------|--------|
| **UI Library** | React 18 | Component-based UI | ✅ Active |
| **Language** | TypeScript | Type safety | ✅ Strict Mode |
| **Styling** | TailwindCSS | Utility-first CSS | ✅ Optimized |
| **Build Tool** | Vite | Fast development builds | ✅ Active |
| **Routing** | React Router 6 | Client-side routing | ✅ Active |
| **State Management** | Context API + Zustand | Global state | ✅ Optimized |
| **HTTP Client** | Fetch API | API communication | ✅ Active |
| **Icons** | Lucide React | Icon library | ✅ Tree-shaken |
| **Form Handling** | React Hook Form (optional) | Form state management | 🔄 Optional |
| **Testing** | Jest + React Testing Library | Unit & component tests | ✅ Active |

### **Backend Stack**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript server |
| **Framework** | Express 4 | Web framework |
| **Language** | JavaScript/TypeScript | Server code |
| **Database** | SQLite3 | Relational database |
| **ORM** | Prisma 5 | Database abstraction |
| **Authentication** | JWT + Google OAuth | User auth |
| **Password Hashing** | bcrypt | Secure passwords |
| **Validation** | Joi/Yup | Input validation |
| **Payment** | Stripe API | Payment processing |
| **Testing** | Jest + Supertest | API testing |
| **Logging** | Winston (optional) | Application logging |

### **Development Tools**

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Git** | Version control |
| **GitHub** | Repository hosting |
| **Postman/Insomnia** | API testing |
| **VS Code** | Code editor |

---

## Design Principles

### 1. **Single Responsibility Principle (SRP)**

Each component, function, or module has one reason to change:

```typescript
// ❌ Bad: Multiple responsibilities
function TaskManager() {
  // Fetch data
  // Render UI
  // Handle API calls
  // Manage state
}

// ✅ Good: Single responsibility
function TaskManager() {
  // Render UI using hooks
  const { tasks, createTask } = useTaskContext();
  return <TaskList tasks={tasks} />;
}

function useTaskContext() {
  // Handle state management
}
```

### 2. **DRY (Don't Repeat Yourself)**

Reusable components and utility functions:

```typescript
// ✅ Reusable Dialog Component
<Dialog isOpen={isOpen} onClose={onClose}>
  <DialogContent>{children}</DialogContent>
</Dialog>

// ✅ Reusable API Call Pattern
const useFetch = (url) => {
  // Handle loading, error, data
};
```

### 3. **KISS (Keep It Simple, Stupid)**

Avoid over-engineering; start simple and refactor as needed:

```typescript
// ✅ Simple, readable code
const isValidEmail = (email) => email.includes('@');

// ❌ Over-engineered
const isValidEmail = (email) => 
  new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email);
```

### 4. **Composition Over Inheritance**

Use composition for code reuse:

```typescript
// ✅ Composition with Hooks
function useAuth() {
  // Auth logic
}

function useTask() {
  // Task logic
}

function TaskManager() {
  const auth = useAuth();
  const task = useTask();
  // Combine both
}
```

### 5. **Fail Fast, Fail Safe**

Validate inputs early and handle errors gracefully:

```typescript
// Backend validation
if (!email || !password) {
  return res.status(400).json({ error: 'Missing fields' });
}

// Frontend error handling
try {
  const response = await api.createTask(data);
} catch (error) {
  showErrorNotification(error.message);
}
```

### 6. **Security First**

- Validate all inputs on both frontend and backend
- Hash passwords with bcrypt (10 salt rounds)
- Use HTTPS for all communications in production
- Implement JWT with expiry times (1 hour access, 7 days refresh)
- Sanitize user input to prevent XSS attacks
- Implement rate limiting on auth endpoints
- **Recent improvements**: Token refresh mechanism optimized, unused token references cleaned

---

## System Architecture Diagram

### **High-Level System Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Web Browser (React SPA)                                │   │
│  │  - React Components                                     │   │
│  │  - Context API for state                               │   │
│  │  - TailwindCSS styling                                 │   │
│  │  - React Router for navigation                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────┬───────────────────────────────────────────────┘
                   │ HTTP/REST API (JSON)
                   │ Authorization: Bearer {JWT}
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / SERVER                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express Server (Node.js)                               │   │
│  │  - Request routing                                      │   │
│  │  - CORS middleware                                      │   │
│  │  - Authentication middleware (JWT verification)        │   │
│  │  - Error handling middleware                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Route Handlers (Controllers)                           │   │
│  │  - /api/auth      (authentication)                      │   │
│  │  - /api/tasks     (task management)                     │   │
│  │  - /api/teams     (team management)                     │   │
│  │  - /api/schedule  (scheduling)                          │   │
│  │  - /api/payments  (stripe integration)                  │   │
│  │  - /api/users     (user profiles)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Service Layer (Business Logic)                         │   │
│  │  - scheduleService (AI scheduling algorithm)            │   │
│  │  - authService (JWT generation, verification)          │   │
│  │  - paymentService (Stripe API calls)                    │   │
│  │  - taskService (Task operations)                        │   │
│  │  - teamService (Team operations)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────┬───────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ↓                     ↓
   ┌─────────────┐      ┌─────────────┐
   │   DATABASE  │      │ EXTERNAL    │
   │  (SQLite3)  │      │   SERVICES  │
   │             │      │             │
   │ - Users     │      │ - Stripe    │
   │ - Tasks     │      │ - Google    │
   │ - Teams     │      │   OAuth     │
   │ - Calendar  │      │ - Email     │
   │ - Events    │      │   Service   │
   │ - Holidays  │      └─────────────┘
   │ - Payments  │
   └─────────────┘
```

### **Request/Response Flow**

```
User Action (Frontend)
    ↓
React Component triggers API call
    ↓
HTTP Request sent with JWT token
    ↓
Express Server receives request
    ↓
CORS middleware validates origin
    ↓
Auth middleware verifies JWT token
    ↓
Route handler processes request
    ↓
Service layer executes business logic
    ↓
Prisma ORM generates SQL query
    ↓
SQLite executes query and returns data
    ↓
Service formats response
    ↓
Route handler sends JSON response
    ↓
Frontend receives response
    ↓
React state updates (Context/Zustand)
    ↓
Components re-render with new data
    ↓
User sees updated UI
```

---

## Frontend Architecture

### **Directory Structure**

```
/client/src/
├── /components          # Reusable UI components
│   ├── AuthDialog.tsx
│   ├── Dialog.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── TaskCard.tsx    # ✅ Optimized
│   ├── TaskForm.tsx
│   ├── TaskManager.tsx # ✅ Fixed unused imports
│   ├── TeamForm.tsx
│   ├── TeamManager.tsx
│   └── UserProfile.tsx
├── /core                # Core application logic
│   ├── /contexts       # React Context for state
│   │   ├── index.ts
│   │   ├── UserContext.tsx  # ✅ Optimized state
│   │   ├── TaskContext.tsx  # ✅ Optimized state
│   │   └── TeamContext.tsx
│   ├── /layout         # Layout components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── /router         # Routing configuration
├── /features            # Feature-based modules
│   ├── /auth           # Authentication features
│   ├── /calendar       # Calendar features
│   ├── /payments       # Payment features
│   ├── /schedule       # Scheduling features
│   ├── /tasks          # Task management
│   │   ├── /components
│   │   │   ├── TaskCardItem.tsx      # ✅ Fixed imports
│   │   │   ├── TaskDetailModal.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskFormModal.tsx
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskSort.tsx
│   │   ├── /pages
│   │   │   └── TaskManagerPage.tsx   # ✅ Fixed paths
│   │   └── /utils
│   │       └── taskFormatters.ts
│   └── /teams          # Team management
├── /hooks               # Custom React hooks
│   ├── useAuth.ts
│   ├── useAuthRedirect.tsx
│   └── useFetch.ts
├── /services            # API calls
│   ├── api.ts          # ✅ Fixed unused parameters
│   ├── authService.ts
│   ├── baseApi.ts
│   ├── paymentService.ts
│   ├── scheduleService.ts
│   ├── taskService.ts
│   └── teamService.ts
├── /shared              # Shared utilities
│   ├── /components     # Shared components
│   ├── /hooks          # Shared hooks
│   │   ├── index.ts
│   │   ├── useDialog.ts
│   │   ├── useFormState.ts
│   │   └── useLoginRequired.ts
│   ├── /types          # TypeScript types
│   └── /utils          # Utility functions
│       └── filterUtils.ts
├── /types               # TypeScript interfaces
│   ├── index.ts
│   └── env.d.ts
├── /utils               # Utility functions
│   └── constants.ts
├── /test                # Test utilities
│   ├── setup.ts
│   └── test-utils.tsx
├── App.tsx              # Root component
├── main.tsx             # React entry point
└── index.css            # Global styles
```

### **State Management Strategy**

**Three-Tier State Approach:**

```typescript
// 1. Global State (Context API) - ✅ Optimized
export const UserContext = createContext();
// - currentUser
// - isAuthenticated
// - users (all users)
// - teamMembers (read-only, optimized)
// - login()
// - logout()
// - updateUser()

export const TaskContext = createContext();
// - tasks[]
// - taskPage, hasMoreTasks (pagination)
// - scheduleEntries[], conflicts[], personalEvents[]
// - teamTasks, events (read-only, optimized)
// - loadTasks()
// - addTask(), updateTask(), deleteTask()
// - splitTask()
// - generateSchedule()
// - loadSchedule()

export const TeamContext = createContext();
// - teams[]
// - currentTeam
// - createTeam()
// - updateTeam()
// - deleteTeam()
// - joinTeam()
// - leaveTeam()
// - assignTask()

// 2. Local Component State (useState)
// - Form inputs
// - Modal open/close states
// - Loading and error states
// - UI interaction states

// 3. Derived State (useMemo)
// - Computed values based on state
const filteredTasks = useMemo(() => 
  tasks.filter(t => t.status === filter),
  [tasks, filter]
);

// ✅ Best Practices Applied:
// - Removed unused state setters (setTeamMembers, setTeamTasks, setEvents)
// - Proper dependency arrays in useEffect and useCallback
// - Memoized expensive computations
// - Clean separation of concerns
```

### **Component Patterns**

**Container Component (Smart):**
```typescript
function TaskManager() {
  const { tasks, createTask } = useContext(TaskContext);
  const [filter, setFilter] = useState('all');
  
  return (
    <div>
      <TaskFilters onFilterChange={setFilter} />
      <TaskList 
        tasks={tasks.filter(t => matchFilter(t, filter))} 
        onCreateTask={createTask}
      />
    </div>
  );
}
```

**Presentational Component (Dumb):**
```typescript
function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <button onClick={() => onEdit(task.id)}>Edit</button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  );
}
```

---

## Backend Architecture

### **Directory Structure**

```
/server/
├── /src/
│   ├── /routes          # Express route handlers
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── teams.js
│   │   ├── users.js
│   │   ├── schedule.js
│   │   └── payments.js
│   ├── /services        # Business logic
│   │   ├── scheduleService.js
│   │   ├── authService.js
│   │   ├── paymentService.js
│   │   └── ... more services
│   ├── /middleware      # Express middleware
│   │   └── auth.js      # JWT verification
│   ├── /config          # Configuration
│   │   ├── jwt.js
│   │   └── google_client.js
│   ├── /models          # Data models (Prisma)
│   ├── /prisma          # ORM schema
│   │   └── schema.prisma
│   └── index.ts         # Server entry point
├── /tests               # Test files
├── .env                 # Environment variables
└── package.json
```

### **Request Processing Pipeline**

```
Incoming HTTP Request
    ↓
1. CORS Middleware
   - Check allowed origins
   - Set CORS headers
    ↓
2. Body Parser Middleware
   - Parse JSON/form data
   - Validate content-type
    ↓
3. Route Matching
   - Match URL to route
   - Extract parameters
    ↓
4. Authentication Middleware
   - Extract JWT from Authorization header
   - Verify token signature
   - Check token expiry
   - Attach user to request object
    ↓
5. Authorization Middleware
   - Verify user has required role
   - Check resource ownership
    ↓
6. Route Handler (Controller)
   - Validate input data
   - Call service layer
    ↓
7. Service Layer
   - Execute business logic
   - Perform data transformations
   - Call database queries
    ↓
8. Data Access (Prisma ORM)
   - Generate SQL queries
   - Execute against SQLite
   - Handle transactions
    ↓
9. Response Building
   - Format response data
   - Set HTTP status code
   - Add response headers
    ↓
10. Send Response
    - JSON serialization
    - Send to client
    ↓
Error Handler (if any error)
    - Log error
    - Send error response
    - Cleanup resources
```

### **Service Layer Pattern**

```javascript
// services/taskService.js
class TaskService {
  // Create a new task
  static async createTask(userId, taskData) {
    // Validate input
    // Transform data
    // Call Prisma
    // Return created task
  }
  
  // Get user's tasks
  static async getUserTasks(userId, filters) {
    // Build query
    // Execute query
    // Format response
    // Return tasks
  }
  
  // Update task
  static async updateTask(taskId, updates) {
    // Validate ownership
    // Validate updates
    // Execute update
    // Return updated task
  }
}

module.exports = TaskService;
```

---

## Database Architecture

### **Database Choice: SQLite3**

**Why SQLite?**
- ✅ No server setup required
- ✅ File-based storage
- ✅ Perfect for small to medium projects
- ✅ Easy backups (single file)
- ✅ Built-in with Node.js
- ✅ Sufficient performance for MVP

**Location:** `/server/data/taskmanagement.db`

### **Prisma ORM**

Using Prisma for:
- Type-safe database queries
- Automatic migrations
- Query optimization
- Transaction support

**Schema File:** `/server/src/prisma/schema.prisma`

### **Core Data Models**

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  google_id TEXT,
  profile_picture TEXT,
  role TEXT DEFAULT 'USER',
  working_hours_start TEXT,
  working_hours_end TEXT,
  working_days TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATETIME,
  estimated_duration INTEGER,
  priority TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'TODO',
  assigned_to TEXT,
  team_id TEXT,
  tags TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Teams table
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  admin_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Team Members junction table
CREATE TABLE team_members (
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Schedule Entries (Smart Scheduling Results)
CREATE TABLE schedule_entries (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  interval_id TEXT,
  user_id TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  title TEXT,
  priority TEXT,
  is_manual BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Preferences (Scheduling Settings)
CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  auto_split_long_tasks BOOLEAN DEFAULT FALSE,
  max_task_duration INTEGER DEFAULT 4,
  break_duration INTEGER DEFAULT 15,
  work_buffer_minutes INTEGER DEFAULT 0,
  preferred_work_start TEXT,
  preferred_work_end TEXT,
  allow_weekend_scheduling BOOLEAN DEFAULT FALSE,
  efficiency_curve TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Personal Events (Calendar Events)
CREATE TABLE personal_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  event_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Task Intervals (Work Hours Tracking)
CREATE TABLE task_intervals (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  duration INTEGER NOT NULL,
  scheduled_start DATETIME,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Schedule Conflicts
CREATE TABLE schedule_conflicts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  schedule_entry_id TEXT,
  conflict_type TEXT NOT NULL,
  conflict_details TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolution_action TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (schedule_entry_id) REFERENCES schedule_entries(id)
);
```

### **Database Relationships**

![Database Schema Diagram](https://github.com/racheli2969/my_time_manager/blob/main/docs/images/DB_ARCHITECTURE.png)

**Entity Relationship Overview:**

```
User (1) ────(many)──── Task
 ↓
User (1) ────(many)──── Team
 ↓
User (1) ────(1)──── Calendar
 ↓
User (1) ────(1)──── UserPreferences
         ↓
      Calendar (1) ────(many)──── Event
      Calendar (1) ────(many)──── Holiday

Team (1) ────(many)──── TeamMembers ────(1) User
Task (1) ────(many)──── TaskIntervals
Task (1) ────(many)──── ScheduleEntries
ScheduleEntry (1) ────(many)──── ScheduleConflicts
```

**Key Tables:**
- **users**: Core user information and authentication
- **tasks**: Task details with priorities and due dates
- **teams**: Team information and ownership
- **team_members**: Many-to-many relationship between users and teams
- **schedule_entries**: Smart scheduling results for tasks
- **user_preferences**: User work hours and scheduling preferences
- **personal_events**: User calendar events (meetings, appointments)
- **task_intervals**: Logged work hours for tasks
- **schedule_conflicts**: Tracking scheduling conflicts and resolutions

---

## API Design

### **API Design Principles**

1. **Resource-Based URLs** - Focus on nouns (resources), not verbs
2. **Standard HTTP Methods** - GET, POST, PUT, DELETE
3. **Status Codes** - Proper HTTP status for each response
4. **Error Handling** - Consistent error response format
5. **Pagination** - Support large datasets
6. **Filtering** - Allow query parameters for filtering
7. **Documentation** - Clear endpoint documentation

### **API Endpoints**

#### **Authentication**
```
POST   /api/auth/register        Register new user
POST   /api/auth/login           Login with email/password
POST   /api/auth/google          Login with Google OAuth
POST   /api/auth/refresh         Refresh JWT token
POST   /api/auth/logout          Logout user
GET    /api/auth/me              Get current user
```

#### **Tasks**
```
GET    /api/tasks                Get all user tasks
GET    /api/tasks/:id            Get specific task
POST   /api/tasks                Create new task
PUT    /api/tasks/:id            Update task
DELETE /api/tasks/:id            Delete task
```

#### **Teams**
```
GET    /api/teams                Get user's teams
POST   /api/teams                Create new team
GET    /api/teams/:id            Get team details
PUT    /api/teams/:id            Update team
DELETE /api/teams/:id            Delete team
POST   /api/teams/:id/members    Add team member
```

#### **Schedule**
```
GET    /api/schedule/calendar    Get calendar view
POST   /api/schedule/generate    Generate smart schedule
PUT    /api/schedule/:id         Update scheduled task
```

#### **Payments**
```
POST   /api/payments/checkout    Create Stripe session
GET    /api/subscription         Get subscription status
POST   /api/subscription/cancel  Cancel subscription
```

### **Response Format**

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Task 1",
    "status": "TODO"
  },
  "message": "Task created successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid task data",
    "details": {
      "title": "Title is required"
    }
  }
}
```

---

## Authentication & Security

### **JWT Authentication Flow**

```
1. User Registration
   - POST /auth/register
   - Email, password
   - Hash password (bcrypt)
   - Create user in DB
   - Generate JWT token
   - Return token

2. User Login
   - POST /auth/login
   - Email, password
   - Verify password hash
   - Generate JWT token
   - Return token

3. Token Storage (Frontend)
   - localStorage.setItem('token', jwt)
   - localStorage.setItem('refreshToken', refreshJWT)

4. API Requests
   - Add Authorization header
   - Authorization: Bearer {JWT}
   - Include in every authenticated request

5. Token Verification (Backend)
   - Extract JWT from header
   - Verify signature
   - Check expiry (1 hour)
   - Attach user to request

6. Token Refresh
   - If JWT expired
   - POST /auth/refresh with refresh token
   - Get new JWT
   - Update localStorage
   - Retry original request

7. Logout
   - DELETE /auth/logout
   - Clear tokens from localStorage
   - Invalidate refresh token in DB
```

### **Google OAuth Flow**

```
1. Frontend
   - User clicks "Sign in with Google"
   - Redirect to Google consent

2. Google
   - User grants permissions
   - Returns authorization code

3. Backend
   - POST /auth/google with code
   - Verify code with Google
   - Get user info
   - Check if user exists
   - If new: create user account
   - Generate JWT tokens

4. Frontend
   - Receive tokens
   - Store tokens
   - Redirect to dashboard
```

### **Security Measures**

✅ **Password Security**
- Hash with bcrypt (salt rounds: 10)
- Minimum 8 characters
- Strong password requirements

✅ **Token Security**
- JWT with 32+ character secret
- Short expiry (1 hour)
- Refresh token for renewal
- Refresh tokens stored in DB (can be revoked)

✅ **Input Validation**
- Validate on both frontend and backend
- Sanitize user input
- Use type checking (TypeScript)

✅ **HTTPS**
- All communications encrypted
- Required in production

✅ **Authorization**
- Role-based access control (RBAC)
- Resource ownership verification
- Subscription tier enforcement

---

## Deployment Architecture

### **Development Environment**

```
Local Machine
├── Frontend
│   ├── npm run dev:client
│   └── Vite Dev Server (http://localhost:5173)
├── Backend
│   ├── npm run dev:server
│   └── Express Server (http://localhost:3001)
└── Database
    └── SQLite (local file: ./data/taskmanagement.db)
```

### **Production Environment - Option A: Vercel + Render**

```
Vercel (Frontend)
├── Deployment: npm run build:client
├── Node built-in server
├── CDN for static assets
└── Auto-redeploy on push

Render (Backend)
├── Deployment: npm run build:server
├── Node.js runtime
├── Environment variables
├── SQLite persistence
└── Auto-scaling (optional)
```

### **Production Environment - Option B: Netlify + Railway**

```
Netlify (Frontend)
├── Build: npm run build:client
├── Static site hosting
├── CDN distribution
└── Auto-builds on push

Railway (Backend)
├── Build: npm run build:server
├── Docker containerization
├── PostgreSQL option
└── Environment management
```

### **CI/CD Pipeline**

```
Developer pushes code to GitHub
    ↓
GitHub Actions triggered
    ↓
1. Tests
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Cypress/Playwright)
    ↓
2. Build
   - Frontend: npm run build:client
   - Backend: npm run build:server
    ↓
3. Quality Checks
   - ESLint
   - TypeScript compilation
   - Code coverage
    ↓
4. Deploy (if all pass)
   - Frontend → Vercel/Netlify
   - Backend → Render/Railway
    ↓
5. Post-Deployment
   - Smoke tests
   - Health checks
   - Alert on failure
```

---

## Design Decisions & Rationale

### **Why React + TypeScript?**

✅ **React**
- Large ecosystem and community support
- Component reusability and composition
- Virtual DOM for optimal performance
- Great developer experience with hooks
- Rich tooling and libraries
- Strong job market demand

✅ **TypeScript**
- Type safety reduces runtime bugs by 15-20%
- Better IDE support and autocomplete
- Self-documenting code with interfaces
- Easier refactoring at scale
- Catches errors at compile time
- **Recent improvements**: Strict mode enabled, all unused variables removed

### **Why Express.js?**

✅ **Express**
- Lightweight and flexible
- Minimalist framework (easy to understand)
- Large middleware ecosystem
- Good performance
- Widely adopted
- Easy to test

### **Why SQLite?**

✅ **SQLite**
- No server overhead
- File-based (easy to deploy)
- Perfect for MVP and small/medium projects
- ACID compliance
- Sufficient for our scale
- Can migrate to PostgreSQL later if needed

### **Why Prisma ORM?**

✅ **Prisma**
- Type-safe queries
- Automatic migrations
- Intuitive schema definition
- Query optimization
- Developer experience
- Easy to debug

### **Why Zustand for State Management?**

✅ **Zustand**
- Lightweight (2KB)
- Simple API
- No provider needed
- Good performance
- Less boilerplate than Redux
- Good for small/medium projects

### **Why TailwindCSS?**

✅ **TailwindCSS**
- Utility-first approach
- Consistent design system
- Smaller bundle size (with purging)
- No CSS conflicts
- Fast development
- Good for responsive design

### **Why JWT Authentication?**

✅ **JWT**
- Stateless (no session storage needed)
- Scalable across servers
- Self-contained information
- Widely supported
- Good for REST APIs
- Refresh token mechanism for security

---

## Summary

This architecture provides a **production-ready foundation** for the Task Management Web Application with:

✅ **Scalability** - Modular design, service layer separation  
✅ **Maintainability** - Clear structure, design patterns, clean code  
✅ **Type Safety** - TypeScript throughout with strict mode  
✅ **Security** - JWT auth, role-based access, input validation  
✅ **Performance** - Optimized queries, removed unused code, tree-shaken bundles  
✅ **Testing** - Comprehensive test coverage  
✅ **Deployment** - CI/CD ready, multi-platform support  
✅ **Code Quality** - Zero unused variables, proper type annotations, ESLint compliant

### Recent Quality Improvements (November 2025)

The codebase has been significantly improved with:
- **100% TypeScript compliance**: All compilation errors resolved
- **Zero unused code**: Removed all unused variables, imports, and state setters
- **Optimized bundle size**: Removed unnecessary icon imports
- **Enhanced type safety**: Proper type annotations throughout
- **Clean architecture**: Optimized Context providers and service layer
- **Better maintainability**: Clear separation of concerns

The architecture follows **industry best practices** and is designed to evolve from MVP to enterprise-scale application with minimal refactoring.

---

## Resources & References

### **Frontend Documentation**
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

### **Backend Documentation**
- [Express.js Guide](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [JWT.io](https://jwt.io)

### **Tools & Services**
- [Stripe Documentation](https://stripe.com/docs)
- [Google OAuth Setup](https://console.cloud.google.com)
- [Vercel Deployment](https://vercel.com/docs)
- [Render Deployment](https://render.com/docs)

---

**Document Version:** 2.0  
**Last Updated**: November 2, 2025  
**Author:** Development Team  
**Status:** Active

---

## Recent Updates (November 2025)

### Code Quality Improvements
- ✅ **TypeScript Error Resolution**: Fixed all compilation errors across the codebase
- ✅ **Unused Code Removal**: Eliminated unused variables, imports, and state setters
- ✅ **Import Path Fixes**: Corrected module resolution issues in TaskManagerPage
- ✅ **Type Safety Enhancement**: Added proper type annotations throughout
- ✅ **Bundle Size Optimization**: Removed unused icon imports (Filter, MoreHorizontal, ChevronDown)
- ✅ **State Management Optimization**: Cleaned up Context providers (TaskContext, UserContext)

### Files Updated
1. **api.ts**: Removed unused `userId` parameter from `generateSchedule()` method
2. **UserContext.tsx**: Removed unused `setTeamMembers` setter
3. **TaskContext.tsx**: Removed unused `setTeamTasks` and `setEvents` setters  
4. **TaskCardItem.tsx**: Removed unused `ChevronDown` import
5. **TaskManager.tsx**: Removed unused `Filter` and `MoreHorizontal` imports
6. **TaskManagerPage.tsx**: Fixed import paths for better module resolution

