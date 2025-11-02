/**
 * Task Sorting Component
 * Handles task sorting options
 */

import React from 'react';

type SortOption = 'date' | 'status' | 'progress' | 'assigned';

interface TaskSortProps {
  onSortChange: (sortBy: SortOption) => void;
  currentSort: SortOption;
}

/**
 * Sort control for task list
 */
export const TaskSort: React.FC<TaskSortProps> = ({ onSortChange, currentSort }) => {
  return (
    <select
      value={currentSort}
      onChange={(e) => onSortChange(e.target.value as SortOption)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      aria-label="Sort tasks by"
    >
      <option value="date">Sort by Date</option>
      <option value="status">Sort by Status</option>
      <option value="progress">Sort by Progress</option>
      <option value="assigned">Sort by Assigned To</option>
    </select>
  );
};

export default TaskSort;
