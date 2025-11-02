# API Services - Modular Architecture

## Overview

The API layer has been refactored into a modular architecture for better maintainability, testability, and separation of concerns.

## Structure

```
src/services/
├── baseApi.ts          # Base HTTP client with auth & token refresh
├── authService.ts      # Authentication operations
├── taskService.ts      # Task management operations
├── teamService.ts      # Team collaboration operations
├── userService.ts      # User profile operations
├── scheduleService.ts  # Intelligent scheduling operations
├── index.ts            # Central export point
└── api.ts              # Backward-compatible facade
```

## Services

### BaseApiService (`baseApi.ts`)
Core HTTP client handling:
- Request/response lifecycle
- Automatic token refresh on 401
- Error handling
- Logout functionality

### AuthService (`authService.ts`)
- `login(email, password)`
- `register(name, email, password, role?)`
- `loginWithGoogle(credential)`
- `logoutUser()`

### TaskService (`taskService.ts`)
- `getTasks(page?, pageSize?)`
- `getTasksByUserOrAssigned(userId, page?, pageSize?)`
- `createTask(task)`
- `updateTask(id, task)`
- `deleteTask(id)`
- `splitTask(id, intervals)`

### TeamService (`teamService.ts`)
- `getTeams()`
- `createTeam(team)`
- `updateTeam(id, team)`
- `deleteTeam(id)`

### UserService (`userService.ts`)
- `getUsers()`
- `getProfile()`
- `updateProfile(profile)`

### ScheduleService (`scheduleService.ts`)
- `generateSchedule(userId, options)`
- `getSchedule()`
- `updateScheduleEntry(entryId, updates)`
- `getScheduleConflicts()`
- `resolveConflict(conflictId, resolutionAction)`
- `getSchedulePreferences()`
- `updateSchedulePreferences(preferences)`
- `addPersonalEvent(event)`
- `getPersonalEvents(startDate?, endDate?)`
- `deletePersonalEvent(eventId)`

## Usage

### New Code (Recommended)
Import specific services directly:

```typescript
import { authService } from '@/services/authService';
import { taskService } from '@/services/taskService';

// Use the service
const user = await authService.login(email, password);
const tasks = await taskService.getTasks();
```

### Legacy Code (Backward Compatible)
The original `apiService` still works:

```typescript
import { apiService } from '@/services/api';

// All existing code continues to work
const user = await apiService.login(email, password);
const tasks = await apiService.getTasks();
```

## Benefits

✅ **Separation of Concerns** - Each service handles one domain
✅ **Better Testing** - Mock individual services independently
✅ **Code Organization** - Easier to find and maintain code
✅ **Smaller Bundles** - Tree-shaking can remove unused services
✅ **Type Safety** - Better TypeScript inference
✅ **Extensibility** - Easy to add new services or methods
✅ **Backward Compatible** - No breaking changes to existing code

## Migration Guide

### Before
```typescript
import { apiService } from '@/services/api';

const login = () => apiService.login(email, pass);
const tasks = () => apiService.getTasks();
const teams = () => apiService.getTeams();
```

### After
```typescript
import { authService, taskService, teamService } from '@/services';

const login = () => authService.login(email, pass);
const tasks = () => taskService.getTasks();
const teams = () => teamService.getTeams();
```

## Testing

Each service can be mocked independently:

```typescript
// Mock a specific service
jest.mock('@/services/taskService', () => ({
  taskService: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
  }
}));
```

## Future Enhancements

- Add request interceptors
- Implement caching layer
- Add retry logic for failed requests
- Type-safe request/response interfaces
- Request cancellation support
- Upload progress tracking
