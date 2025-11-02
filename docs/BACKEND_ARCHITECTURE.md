# Backend Architecture

## Overview

The backend follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    (React Frontend)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ROUTES / CONTROLLERS                     │
│  (HTTP Request/Response Handling - Thin Layer)             │
│                                                             │
│  • auth.js       - Authentication endpoints                │
│  • tasks.js      - Task management endpoints               │
│  • teams.js      - Team management endpoints               │
│  • users.js      - User profile endpoints                  │
│  • schedule.js   - Schedule generation endpoints           │
│                                                             │
│  Responsibilities:                                          │
│  - Parse request                                            │
│  - Call service layer                                       │
│  - Format response                                          │
│  - Handle HTTP status codes                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Function Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     MIDDLEWARE LAYER                        │
│  (Cross-cutting Concerns)                                   │
│                                                             │
│  • auth.js           - JWT authentication                  │
│  • errorHandler.js   - Global error handling               │
│                                                             │
│  Responsibilities:                                          │
│  - Authenticate requests                                    │
│  - Authorize actions                                        │
│  - Catch and format errors                                  │
│  - Log requests                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Function Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                           │
│  (Business Logic - To Be Created)                          │
│                                                             │
│  • AuthService       - Registration, login logic           │
│  • TaskService       - Task business rules                 │
│  • TeamService       - Team management logic               │
│  • ScheduleService   - Schedule generation                 │
│                                                             │
│  Responsibilities:                                          │
│  - Business rules validation                                │
│  - Complex operations                                       │
│  - Transaction management                                   │
│  - Orchestrate model calls                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Function Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     MODEL LAYER                             │
│  (Data Access - Repository Pattern)                        │
│                                                             │
│  • UserModel.js      - User database operations            │
│  • TaskModel.js      - Task database operations            │
│  • TeamModel.js      - Team database operations            │
│  • ScheduleModel.js  - Schedule database operations        │
│                                                             │
│  Responsibilities:                                          │
│  - SQL queries                                              │
│  - Data formatting                                          │
│  - Access control checks                                    │
│  - Response formatting                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
│  (SQLite + better-sqlite3)                                 │
│                                                             │
│  • database.js       - Connection & initialization         │
│                                                             │
│  Tables:                                                    │
│  - users                                                    │
│  - tasks                                                    │
│  - teams                                                    │
│  - team_members                                             │
│  - schedule_entries                                         │
│  - personal_events                                          │
│  - task_intervals                                           │
│  - schedule_conflicts                                       │
│  - user_preferences                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SUPPORT MODULES                          │
│  (Utilities & Helpers)                                     │
│                                                             │
│  Constants:                                                 │
│  • constants/index.js    - Enums, defaults, messages       │
│                                                             │
│  Utilities:                                                 │
│  • utils/errors.js            - Custom error classes       │
│  • utils/validation.js        - Input validation           │
│  • utils/dateUtils.js         - Date/time helpers          │
│  • utils/responseFormatter.js - Response formatting        │
│                                                             │
│  Configuration:                                             │
│  • config/appConfig.js   - App configuration               │
│  • config/jwt.js         - JWT configuration               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Create Task

### 1. Request Arrives
```
POST /api/tasks
Authorization: Bearer <token>
{
  "title": "Complete project",
  "dueDate": "2025-11-10",
  "estimatedDuration": 120,
  "priority": "high"
}
```

### 2. Routes Layer (tasks.js)
```javascript
router.post('/tasks', 
  authenticateToken,  // ← Middleware validates JWT
  asyncHandler(async (req, res) => {
    // Validate input
    validateRequiredFields(req.body, ['title', 'dueDate', 'estimatedDuration']);
    
    // Prepare data
    const taskData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Call model (or service when created)
    const task = await TaskModel.create(taskData);
    
    // Format and send response
    const formatted = TaskModel.formatForResponse(task);
    sendCreated(res, formatted);
  })
);
```

### 3. Middleware Layer
- **authenticateToken**: Verifies JWT, loads user, attaches to `req.user`
- **asyncHandler**: Catches any errors and passes to error handler

### 4. Model Layer (TaskModel.js)
```javascript
create(taskData) {
  const taskId = uuidv4();
  
  // Execute SQL with prepared statement
  db.prepare(`
    INSERT INTO tasks (id, title, due_date, ...) 
    VALUES (?, ?, ?, ...)
  `).run(taskId, taskData.title, taskData.dueDate, ...);
  
  // Return created task
  return this.findById(taskId);
}
```

### 5. Database Layer
- Executes SQL query
- Returns raw data

### 6. Response
```json
{
  "success": true,
  "message": "Created successfully",
  "data": {
    "id": "uuid",
    "title": "Complete project",
    "dueDate": "2025-11-10T00:00:00.000Z",
    "estimatedDuration": 120,
    "priority": "high",
    "status": "todo",
    "createdBy": "user-uuid",
    "createdAt": "2025-11-02T12:00:00.000Z",
    "tags": []
  }
}
```

## Error Flow Example

### 1. Error Occurs (e.g., Validation Error)
```javascript
validateRequiredFields(req.body, ['title']);
// Throws: ValidationError('Missing required fields')
```

### 2. AsyncHandler Catches Error
```javascript
asyncHandler catches the error and calls next(error)
```

### 3. Global Error Handler
```javascript
errorHandler(err, req, res, next) {
  // Identifies error type (ValidationError)
  // Formats consistent response
  res.status(400).json({
    "success": false,
    "error": "Missing required fields",
    "details": {
      "missingFields": ["title"],
      "message": "The following fields are required: title"
    }
  });
}
```

## Key Design Principles

### 1. Separation of Concerns
Each layer has a specific responsibility:
- **Routes**: HTTP handling only
- **Services**: Business logic
- **Models**: Data access
- **Utils**: Reusable helpers

### 2. Single Responsibility
Each module does one thing well:
- `UserModel`: Only user data operations
- `validation.js`: Only validation logic
- `errorHandler.js`: Only error handling

### 3. DRY (Don't Repeat Yourself)
- Constants defined once
- Utilities reused everywhere
- Models eliminate duplicate SQL
- Error handling centralized

### 4. Dependency Direction
```
Routes → Services → Models → Database
  ↓         ↓          ↓
Utils   ←   ←   ←   ←
```
- Lower layers don't depend on higher layers
- Utilities can be used by any layer

### 5. Error Handling Strategy
```
Try → Model → Service → Route → Middleware → Global Handler
                                                    ↓
                                            Formatted Response
```

## Module Responsibilities

### Routes/Controllers
- ✅ Parse HTTP requests
- ✅ Validate input (basic)
- ✅ Call services/models
- ✅ Format responses
- ❌ No business logic
- ❌ No database access

### Services (To Be Created)
- ✅ Business logic
- ✅ Validation (complex)
- ✅ Orchestrate models
- ✅ Transaction management
- ❌ No HTTP handling
- ❌ No direct SQL

### Models
- ✅ Database operations
- ✅ SQL queries
- ✅ Data formatting
- ✅ Access control
- ❌ No business logic
- ❌ No HTTP handling

### Middleware
- ✅ Authentication
- ✅ Authorization
- ✅ Error handling
- ✅ Logging
- ❌ No business logic

### Utilities
- ✅ Reusable functions
- ✅ Validation helpers
- ✅ Formatting helpers
- ✅ Date/time helpers
- ❌ No business logic
- ❌ No side effects

## Testing Strategy

### Unit Tests
```
Models ← Test SQL operations
Utils  ← Test helper functions
```

### Integration Tests
```
Routes → Services → Models → Database (in-memory)
```

### End-to-End Tests
```
HTTP Request → Full Stack → HTTP Response
```

## Benefits of This Architecture

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Clear structure, easy to find code
3. **Scalability**: Easy to add features without breaking existing code
4. **Reusability**: Models and utils reused across the app
5. **Consistency**: Standardized patterns throughout
6. **Security**: Validation and authorization at each layer
7. **Performance**: Prepared statements, efficient queries
8. **Documentation**: Self-documenting structure

## Future Enhancements

1. **Service Layer**: Add business logic services
2. **Caching**: Add Redis for frequently accessed data
3. **Queue System**: Add job queue for async tasks
4. **WebSockets**: Add real-time features
5. **API Versioning**: Support multiple API versions
6. **Rate Limiting**: Add rate limiting middleware
7. **Logging**: Add structured logging (Winston/Pino)
8. **Monitoring**: Add application monitoring (Sentry)
