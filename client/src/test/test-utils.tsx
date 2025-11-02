import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

/**
 * Mock local storage
 */
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

/**
 * Mock fetch for API calls
 */
export const mockFetch = (data: any, ok = true) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: async () => data,
      text: async () => JSON.stringify(data),
    } as Response)
  );
};

/**
 * Create mock user data
 */
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  subscriptionTier: 'free',
  ...overrides,
});

/**
 * Create mock task data
 */
export const createMockTask = (overrides = {}) => ({
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo' as const,
  priority: 'medium' as const,
  dueDate: new Date('2025-12-31'),
  start: new Date(),
  estimatedDuration: 60,
  createdBy: '1',
  createdAt: new Date(),
  tags: ['test'],
  ...overrides,
});

/**
 * Create mock team data
 */
export const createMockTeam = (overrides = {}) => ({
  id: 1,
  name: 'Test Team',
  description: 'Test Team Description',
  ownerId: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  members: [],
  ...overrides,
});

/**
 * Wait for async updates
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));
