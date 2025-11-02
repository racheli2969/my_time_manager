/**
 * Task Filters Component
 * Handles task filtering by status and assignee
 */

import React from 'react';
import { TaskStatus } from '../../../shared/types';
import { User } from '../../../types';

interface TaskFiltersProps {
  onStatusFilterChange: (filter: 'all' | TaskStatus) => void;
  onAssignedFilterChange: (filter: 'all' | string) => void;
  currentUser: User | null;
  users: User[];
  statusFilter: 'all' | TaskStatus;
  assignedFilter: 'all' | string;
}

/**
 * Filter controls for task list
 */
export const TaskFilters: React.FC<TaskFiltersProps> = ({
  onStatusFilterChange,
  onAssignedFilterChange,
  currentUser,
  users,
  statusFilter,
  assignedFilter,
}) => {
  return (
    <div className="flex items-center gap-3">
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as 'all' | TaskStatus)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Filter by status"
      >
        <option value="all">All Tasks</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <select
        value={assignedFilter}
        onChange={(e) => onAssignedFilterChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Filter by assignee"
      >
        <option value="all">All Assignees</option>
        {currentUser && <option value={currentUser.id}>Assigned to Me</option>}
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TaskFilters;
