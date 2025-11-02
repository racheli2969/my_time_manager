# Client Architecture Refactoring Documentation

## Overview

This document outlines the new modular architecture for the client application. The refactoring transforms the codebase from a flat, file-type-based structure to a **feature-based, modular architecture** with clear separation of concerns.

## Key Principles

1. **Feature-Based Organization**: Components, hooks, and utilities are grouped by feature, not by type
2. **Single Responsibility**: Each component/hook/utility has one clear purpose
3. **Reusability**: Shared utilities and hooks are centralized for DRY code
4. **Scalability**: Easy to add new features without cluttering existing code
5. **Maintainability**: Clear imports and dependencies make code easier to understand

## New Directory Structure

```
client/src/
├── core/                          # Application-wide setup
│   ├── contexts/                  # Global state management
│   │   ├── UserContext.tsx
│   │   ├── TaskContext.tsx
│   │   ├── TeamContext.tsx
│   │   └── index.ts
│   ├── layout/                    # Main layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   └── router/                    # Routing configuration
│       └── routes.tsx
│
├── features/                      # Feature modules
│   ├── tasks/                     # Task management feature
│   │   ├── components/            # Task-specific components
│   │   │   ├── TaskCardItem.tsx          # Single task card
│   │   │   ├── TaskDetailModal.tsx       # Task detail view
│   │   │   ├── TaskList.tsx              # Task grid/list
│   │   │   ├── TaskFilters.tsx           # Filter controls
│   │   │   ├── TaskSort.tsx              # Sort controls
│   │   │   ├── EmptyTaskState.tsx        # No tasks state
│   │   │   └── index.ts
│   │   ├── pages/                 # Task feature pages
│   │   │   ├── TaskManagerPage.tsx       # Main task page
│   │   │   └── index.ts
│   │   ├── hooks/                 # Task-specific hooks
│   │   │   ├── useTaskForm.ts     # Form state management
│   │   │   ├── useTaskFilters.ts  # Filter logic
│   │   │   └── index.ts
│   │   ├── utils/                 # Task utilities
│   │   │   ├── taskFormatters.ts  # Formatting functions
│   │   │   └── taskValidation.ts  # Validation logic
│   │   ├── types/                 # Task-specific types
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── teams/                     # Team management feature
│   │   ├── components/
│   │   │   ├── TeamCard.tsx
│   │   │   ├── TeamList.tsx
│   │   │   ├── MemberPicker.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   └── TeamManagerPage.tsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── calendar/                  # Calendar feature
│   │   ├── components/
│   │   │   ├── CalendarView.tsx
│   │   │   ├── CalendarCell.tsx
│   │   │   ├── EventModal.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── payments/                  # Payments feature
│   │   ├── components/
│   │   │   ├── PlanSelector.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── schedule/                  # Schedule feature
│   │   ├── components/
│   │   │   ├── ScheduleView.tsx
│   │   │   ├── SchedulePreferences.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   └── auth/                      # Authentication feature
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   ├── GoogleSignInButton.tsx
│       │   └── index.ts
│       ├── pages/
│       │   └── LoginPage.tsx
│       └── index.ts
│
├── shared/                        # Shared across features
│   ├── components/                # Reusable UI components
│   │   ├── Dialog.tsx
│   │   ├── Modal.tsx
│   │   ├── Button.tsx
│   │   └── index.ts
│   ├── hooks/                     # Reusable hooks
│   │   ├── useDialog.ts
│   │   ├── useLoginRequired.ts
│   │   ├── useFormState.ts
│   │   └── index.ts
│   ├── utils/                     # Reusable utilities
│   │   ├── filterUtils.ts
│   │   ├── dateFormatters.ts
│   │   ├── validationUtils.ts
│   │   └── index.ts
│   ├── types/                     # Shared types
│   │   └── index.ts
│   └── styles/                    # Shared styles/constants
│       └── constants.ts
│
├── config/                        # Configuration
│   └── env.ts
│
├── services/                      # API services
│   ├── api.ts
│   ├── paymentService.ts
│   ├── scheduleService.ts
│   └── index.ts
│
├── types/                         # Global types
│   └── index.ts
│
└── App.tsx                        # Main app component
```

## Component Organization

### Feature Structure

Each feature follows this pattern:

```
feature/
├── components/          # UI components specific to this feature
├── pages/              # Page-level components
├── hooks/              # Feature-specific hooks
├── utils/              # Feature-specific utilities
├── types/              # Feature-specific type definitions
└── index.ts            # Public API (exports)
```

### Component Responsibilities

**Page Components** (`pages/`):
- Container components managing page-level state
- Orchestrate feature functionality
- Pass data and callbacks to smaller components
- Example: `TaskManagerPage.tsx`

**Feature Components** (`components/`):
- Presentational components for the feature
- Handle local UI state (menus, modals, etc.)
- Called from page components
- Example: `TaskCardItem.tsx`, `TaskFilters.tsx`

**Shared Components** (`shared/components/`):
- Reusable UI components used across features
- No feature-specific logic
- Example: `Dialog.tsx`, `Button.tsx`

## Hooks Organization

### Feature Hooks
Located in `features/[feature]/hooks/`:
```typescript
// Example: useTaskForm.ts
export const useTaskForm = (initialTask?: Task) => {
  // Form state and logic specific to tasks
};
```

### Shared Hooks
Located in `shared/hooks/`:
```typescript
// useDialog.ts - Used across many features
export const useDialog = () => {
  // Generic dialog state management
};

// useLoginRequired.ts - Auth enforcement
export const useLoginRequired = () => {
  // Login check logic
};
```

## Utilities Organization

### Feature Utilities
Task-specific utilities in `features/tasks/utils/`:
```typescript
// taskFormatters.ts
export const formatDuration = (minutes: number): string => { ... };
```

### Shared Utilities
Common utilities in `shared/utils/`:
```typescript
// filterUtils.ts - Generic filtering
export const filterTasks = (tasks, filter) => { ... };

// dateFormatters.ts - Date formatting
export const formatDateShort = (date) => { ... };
```

## Import Patterns

### Good Imports (Recommended)

```typescript
// ✅ Import from public APIs (index.ts files)
import { TaskFilters, TaskList } from '@/features/tasks/components';
import { useDialog, useLoginRequired } from '@/shared/hooks';
import { Dialog } from '@/shared/components';

// ✅ Import types from shared types
import { Task } from '@/types';
import { ViewType } from '@/shared/types';

// ✅ Import utilities from utilities
import { filterTasks } from '@/shared/utils/filterUtils';
```

### Bad Imports (Avoid)

```typescript
// ❌ Direct file imports (bypass public API)
import { TaskCardItem } from '@/features/tasks/components/TaskCardItem';

// ❌ Deep nested imports
import { someFunction } from '@/features/tasks/utils/taskFormatters/helpers/processor';

// ❌ Circular imports
// feature/tasks imports from feature/teams imports from feature/tasks
```

## State Management

### Global State (Core Contexts)

Manage application-wide state:
```typescript
// core/contexts/UserContext.tsx
- currentUser: User
- login/logout functionality
- loadUsers/loadCurrentUser

// core/contexts/TaskContext.tsx
- tasks: Task[]
- schedule entries, conflicts, etc.

// core/contexts/TeamContext.tsx
- teams: Team[]
- team operations
```

### Local Component State

Manage UI-specific state:
```typescript
// TaskFilters.tsx
const [statusFilter, setStatusFilter] = useState<TaskStatus>('all');
const [assignedFilter, setAssignedFilter] = useState<string>('all');

// TaskCardItem.tsx
const [showMenu, setShowMenu] = useState(false);
const [showDetail, setShowDetail] = useState(false);
```

### Feature Hook State

Encapsulate feature logic:
```typescript
// hooks/useTaskForm.ts
export const useTaskForm = (initialTask?: Task) => {
  const [formData, setFormData] = useFormState({ ... });
  const { state, updateField, reset } = formData;
  // Return state and handlers
};
```

## Communication Patterns

### Between Components (Parent ↔ Child)

```typescript
<TaskList
  tasks={tasks}
  onEdit={(task) => handleEdit(task)}
  onDelete={(taskId) => handleDelete(taskId)}
  onStatusChange={(taskId, status) => handleStatusChange(taskId, status)}
/>
```

### Across Features (via Contexts)

```typescript
// Feature A needs data from Feature B
// Use shared context or service layer
import { useUser } from '@/core/contexts/UserContext';
import { useTask } from '@/core/contexts/TaskContext';
```

### With External APIs (via Services)

```typescript
// Centralized API calls
import { apiService } from '@/services/api';

const response = await apiService.createTask(taskData);
```

## Migration Guide

### Step 1: Move Contexts
- [x] Copy `UserContext.tsx` to `core/contexts/`
- [x] Copy `TaskContext.tsx` to `core/contexts/`
- [x] Copy `TeamContext.tsx` to `core/contexts/`
- [ ] Create `core/contexts/index.ts` with exports

### Step 2: Create Feature Structure
- [x] Create task feature directories
- [ ] Create team feature directories
- [ ] Create calendar feature directories
- [ ] Create payment feature directories

### Step 3: Move Components
- [x] TaskCard → `features/tasks/components/TaskCardItem.tsx`
- [x] TaskForm → `features/tasks/pages/TaskForm.tsx`
- [x] TaskManager → `features/tasks/pages/TaskManagerPage.tsx`
- [ ] Team components → `features/teams/components/`
- [ ] Calendar components → `features/calendar/components/`

### Step 4: Extract Utilities
- [x] Date formatting → `shared/utils/dateFormatters.ts`
- [x] Filter logic → `shared/utils/filterUtils.ts`
- [ ] Validation logic → `shared/utils/validationUtils.ts`

### Step 5: Update App.tsx
- [ ] Update imports to use new paths
- [ ] Update provider structure
- [ ] Update route definitions

### Step 6: Create Feature Exports
- [ ] Create `features/tasks/index.ts`
- [ ] Create `features/teams/index.ts`
- [ ] etc.

## Benefits of This Architecture

1. **Scalability**: Easy to add new features without affecting existing code
2. **Maintainability**: Clear organization makes code easier to find and understand
3. **Reusability**: Shared components/hooks/utils prevent duplication
4. **Testing**: Smaller, focused components are easier to test
5. **Performance**: Code splitting opportunities by feature
6. **Collaboration**: Multiple developers can work on different features independently
7. **Code Navigation**: Clear import patterns make dependencies obvious

## Best Practices

1. **Keep Components Small**: Each component should have one clear responsibility
2. **Use Custom Hooks**: Extract complex logic into reusable hooks
3. **Type Everything**: Use TypeScript for type safety
4. **Document Public APIs**: Clearly export what's meant to be used
5. **Avoid Circular Dependencies**: Use dependency injection or contexts
6. **Centralize API Calls**: Use service layer for all API communication
7. **Test Utilities**: Write tests for shared utilities and hooks

## Common Patterns

### Loading Data on Mount

```typescript
useEffect(() => {
  loadUsers();
  loadTeams();
}, []);
```

### Handling Login Requirement

```typescript
const { withLoginCheck } = useLoginRequired();

const handleCreateTask = () => {
  withLoginCheck(() => {
    showTaskForm();
  });
};
```

### Form State Management

```typescript
const { state, updateField, reset } = useFormState({
  title: '',
  description: '',
});

// Use updateField to modify state
updateField('title', newValue);
```

## Next Steps

1. Move remaining components to feature directories
2. Update all imports throughout the codebase
3. Create comprehensive tests for each feature
4. Set up proper error boundaries
5. Implement code splitting by feature
6. Add feature flags for gradual rollouts
