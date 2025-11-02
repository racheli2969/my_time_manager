import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { taskService } from './taskService';
import { createMockTask } from '../test/test-utils';

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default successful response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTasks', () => {
    it('fetches tasks without pagination', async () => {
      const mockTasks = [createMockTask(), createMockTask({ id: '2' })];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTasks,
      } as Response);

      const result = await taskService.getTasks();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks'),
        expect.any(Object)
      );
      expect(result).toEqual(mockTasks);
    });

    it('fetches tasks with pagination parameters', async () => {
      const mockTasks = [createMockTask()];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTasks,
      } as Response);

      await taskService.getTasks(1, 10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks?page=1&pageSize=10'),
        expect.any(Object)
      );
    });

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      } as Response);

      await expect(taskService.getTasks()).rejects.toThrow();
    });
  });

  describe('createTask', () => {
    it('creates a new task', async () => {
      const newTask = createMockTask({ title: 'New Task' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => newTask,
      } as Response);

      const result = await taskService.createTask(newTask);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newTask),
        })
      );
      expect(result).toEqual(newTask);
    });

    it('handles validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Validation failed' }),
      } as Response);

      await expect(
        taskService.createTask({ title: '' })
      ).rejects.toThrow();
    });
  });

  describe('updateTask', () => {
    it('updates an existing task', async () => {
      const updatedTask = createMockTask({ id: '1', title: 'Updated Task' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedTask,
      } as Response);

      const result = await taskService.updateTask('1', updatedTask);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updatedTask),
        })
      );
      expect(result).toEqual(updatedTask);
    });

    it('handles not found errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Task not found' }),
      } as Response);

      await expect(
        taskService.updateTask('999', {})
      ).rejects.toThrow();
    });
  });

  describe('deleteTask', () => {
    it('deletes a task', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response);

      const result = await taskService.deleteTask('1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('handles deletion errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Forbidden' }),
      } as Response);

      await expect(taskService.deleteTask('1')).rejects.toThrow();
    });
  });

  describe('splitTask', () => {
    it('splits a task into intervals', async () => {
      const splitTask = createMockTask({
        id: '1',
        intervals: [
          { id: '1-1', taskId: '1', duration: 30, isCompleted: false },
          { id: '1-2', taskId: '1', duration: 30, isCompleted: false },
        ],
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => splitTask,
      } as Response);

      const result = await taskService.splitTask('1', 2);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1/split'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ intervals: 2 }),
        })
      );
      expect(result.intervals).toHaveLength(2);
    });

    it('validates interval count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid interval count' }),
      } as Response);

      await expect(taskService.splitTask('1', 0)).rejects.toThrow();
    });
  });

  describe('getTasksByUserOrAssigned', () => {
    it('fetches tasks by user ID', async () => {
      const mockTasks = [createMockTask({ createdBy: '1' })];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTasks,
      } as Response);

      const result = await taskService.getTasksByUserOrAssigned('1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks?userId=1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockTasks);
    });

    it('includes pagination parameters', async () => {
      await taskService.getTasksByUserOrAssigned('1', 2, 20);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks?userId=1&page=2&pageSize=20'),
        expect.any(Object)
      );
    });
  });
});
