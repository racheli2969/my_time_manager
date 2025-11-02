# Testing Guide - Co-located Tests

## Overview

This project uses **Vitest** for testing with a **co-located testing pattern**. Test files are placed next to the code they test, making them easy to find and maintain.

## File Naming Convention

Test files should be named with `.test.tsx` or `.test.ts` extension:

```
ComponentName.tsx      → ComponentName.test.tsx
hookName.ts           → hookName.test.ts
serviceName.ts        → serviceName.test.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI (visual test runner)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Project Structure

Tests are co-located with their source files:

```
/src
  /components
    TaskCard.tsx
    TaskCard.test.tsx          ← Component test
  /features
    /tasks
      /hooks
        useTaskFilters.ts
        useTaskFilters.test.ts ← Hook test
      /services
        taskService.ts
        taskService.test.ts    ← Service test
  /test
    setup.ts                   ← Test configuration
    test-utils.tsx             ← Shared test utilities
```

## Test Utilities

Located in `/src/test/test-utils.tsx`:

### Custom Render Function

Wraps components with necessary providers:

```typescript
import { renderWithRouter } from '@/test/test-utils';

renderWithRouter(<MyComponent />);
```

### Mock Data Creators

```typescript
import { createMockTask, createMockUser, createMockTeam } from '@/test/test-utils';

const task = createMockTask({ 
  title: 'Custom Title',
  priority: 'high' 
});

const user = createMockUser({ 
  email: 'test@example.com' 
});

const team = createMockTeam({ 
  name: 'Dev Team' 
});
```

### Mock Utilities

```typescript
import { mockFetch, mockLocalStorage } from '@/test/test-utils';

// Mock API responses
mockFetch({ data: 'response' }, true);

// Mock localStorage
mockLocalStorage.setItem('key', 'value');
mockLocalStorage.getItem('key');
mockLocalStorage.clear();
```

## Writing Tests

### Component Tests

Example: `TaskCard.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import { renderWithRouter, createMockTask } from '@/test/test-utils';

describe('TaskCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders task information correctly', () => {
    const task = createMockTask({ title: 'Test Task' });
    
    renderWithRouter(
      <TaskCard 
        task={task} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const task = createMockTask();
    
    renderWithRouter(
      <TaskCard 
        task={task} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(task);
  });
});
```

### Hook Tests

Example: `useTaskFilters.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskFilters } from './useTaskFilters';
import { createMockTask } from '@/test/test-utils';

describe('useTaskFilters', () => {
  it('filters tasks by status', () => {
    const tasks = [
      createMockTask({ status: 'todo' }),
      createMockTask({ status: 'completed' }),
    ];

    const { result } = renderHook(() => useTaskFilters(tasks));

    act(() => {
      result.current.setStatusFilter('todo');
    });

    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].status).toBe('todo');
  });
});
```

### Service Tests

Example: `taskService.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from './taskService';
import { mockFetch } from '@/test/test-utils';

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches tasks from API', async () => {
    const mockTasks = [{ id: '1', title: 'Task 1' }];
    mockFetch({ data: mockTasks });

    const result = await taskService.getTasks();

    expect(result.data).toEqual(mockTasks);
  });

  it('handles API errors', async () => {
    mockFetch({ error: 'Failed to fetch' }, false);

    await expect(taskService.getTasks()).rejects.toThrow();
  });
});
```

### Context Tests

Example: `TaskContext.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TaskProvider, useTask } from './TaskContext';
import { createMockTask } from '@/test/test-utils';

describe('TaskContext', () => {
  it('adds a new task', () => {
    const { result } = renderHook(() => useTask(), {
      wrapper: TaskProvider,
    });

    const newTask = createMockTask({ title: 'New Task' });

    act(() => {
      result.current.addTask(newTask);
    });

    expect(result.current.tasks).toContainEqual(newTask);
  });

  it('updates task status', () => {
    const { result } = renderHook(() => useTask(), {
      wrapper: TaskProvider,
    });

    const task = createMockTask({ id: '1', status: 'todo' });

    act(() => {
      result.current.addTask(task);
      result.current.updateTaskStatus('1', 'completed');
    });

    expect(result.current.tasks[0].status).toBe('completed');
  });
});
```

## Testing Best Practices

### 1. **Arrange-Act-Assert Pattern**

```typescript
it('updates task title', () => {
  // Arrange: Set up test data
  const task = createMockTask({ title: 'Old Title' });
  
  // Act: Perform the action
  const updated = updateTaskTitle(task, 'New Title');
  
  // Assert: Check the result
  expect(updated.title).toBe('New Title');
});
```

### 2. **Mock External Dependencies**

```typescript
// Mock contexts
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ user: createMockUser() }),
}));

// Mock API calls
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));
```

### 3. **Test User Interactions**

```typescript
import { fireEvent, waitFor } from '@testing-library/react';

it('submits form on button click', async () => {
  renderWithRouter(<TaskForm onSubmit={mockSubmit} />);
  
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'New Task' }
  });
  
  fireEvent.click(screen.getByText('Submit'));
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### 4. **Test Accessibility**

```typescript
it('has accessible form labels', () => {
  renderWithRouter(<TaskForm />);
  
  expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
});
```

### 5. **Clear All Mocks Between Tests**

```typescript
import { beforeEach, vi } from 'vitest';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  // tests...
});
```

## Code Coverage

Run coverage reports to ensure adequate test coverage:

```bash
npm run test:coverage
```

Coverage reports are generated in `/coverage` directory.

**Coverage Goals:**
- **Components**: 80%+
- **Hooks**: 90%+
- **Services**: 90%+
- **Utils**: 95%+

## Common Testing Patterns

### Testing Async Operations

```typescript
it('loads tasks asynchronously', async () => {
  mockFetch({ data: [createMockTask()] });
  
  renderWithRouter(<TaskList />);
  
  await waitFor(() => {
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

### Testing Error States

```typescript
it('displays error message on API failure', async () => {
  mockFetch({ error: 'Failed' }, false);
  
  renderWithRouter(<TaskList />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Testing Loading States

```typescript
it('shows loading spinner while fetching', () => {
  renderWithRouter(<TaskList />);
  
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
});
```

### Testing Conditional Rendering

```typescript
it('shows split button only for long tasks', () => {
  const shortTask = createMockTask({ estimatedDuration: 30 });
  const longTask = createMockTask({ estimatedDuration: 120 });
  
  const { rerender } = renderWithRouter(<TaskCard task={shortTask} />);
  expect(screen.queryByText('Split')).not.toBeInTheDocument();
  
  rerender(<TaskCard task={longTask} />);
  expect(screen.getByText('Split')).toBeInTheDocument();
});
```

## Debugging Tests

### 1. **Use `screen.debug()`**

```typescript
import { screen } from '@testing-library/react';

it('renders correctly', () => {
  renderWithRouter(<MyComponent />);
  screen.debug(); // Prints the DOM
});
```

### 2. **Run Single Test**

```bash
# Run only tests matching pattern
npm test -- TaskCard

# Run specific test file
npm test -- src/components/TaskCard.test.tsx
```

### 3. **Use Vitest UI**

```bash
npm run test:ui
```

Opens a visual test runner in your browser.

## CI/CD Integration

Tests run automatically in CI/CD pipelines. Ensure:

1. All tests pass before merging PRs
2. Coverage thresholds are met
3. No failing tests in `main` branch

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Remember**: Write tests as you code, not after! Co-located tests make this easier.
