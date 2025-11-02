/**
 * Filter Utilities
 * Common filtering logic for tasks, teams, and other items
 */

import { Task } from '../../types';
import { TaskStatus } from '../types';

/**
 * Filter tasks by status and assignee
 */
export const filterTasks = (
  tasks: Task[],
  statusFilter: 'all' | TaskStatus,
  assignedFilter: 'all' | string
): Task[] => {
  return tasks.filter((task) => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const assignedMatch = assignedFilter === 'all' || task.assignedTo === assignedFilter;
    return statusMatch && assignedMatch;
  });
};

/**
 * Sort tasks by various criteria
 */
export const sortTasks = (
  tasks: Task[],
  sortBy: 'date' | 'status' | 'progress' | 'assigned'
): Task[] => {
  const sorted = [...tasks];

  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    case 'status':
      return sorted.sort((a, b) => a.status.localeCompare(b.status));

    case 'progress':
      const statusOrder = { completed: 0, 'in-progress': 1, todo: 2 };
      return sorted.sort(
        (a, b) =>
          (statusOrder[a.status as TaskStatus] ?? 3) -
          (statusOrder[b.status as TaskStatus] ?? 3)
      );

    case 'assigned':
      return sorted.sort((a, b) =>
        (a.assignedTo || '').localeCompare(b.assignedTo || '')
      );

    default:
      return sorted;
  }
};
