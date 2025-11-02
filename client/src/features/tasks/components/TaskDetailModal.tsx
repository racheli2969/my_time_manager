/**
 * Task Detail Modal Component
 * Shows full task details in a modal
 */

import React from 'react';
import { X } from 'lucide-react';
import { Task } from '../../../types';
import { User } from '../../../types';
import { formatDuration, formatDateLong } from '../utils/taskFormatters';

interface TaskDetailModalProps {
  task: Task;
  assignedUser: User | null;
  onClose: () => void;
  onEdit: () => void;
}

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const STATUS_COLORS = {
  todo: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

/**
 * Modal showing complete task information
 */
export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  assignedUser,
  onClose,
  onEdit,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4">{task.title}</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Description</label>
            <p className="text-gray-700 mt-1">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Priority</label>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[task.priority]}`}
              >
                {task.priority}
              </span>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[task.status]}`}
              >
                {task.status.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Due Date
            </label>
            <p className="text-gray-700 mt-1">
              {formatDateLong(new Date(task.dueDate))}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Estimated Duration
            </label>
            <p className="text-gray-700 mt-1">
              {formatDuration(task.estimatedDuration)}
            </p>
          </div>

          {task.assignedTo && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Assigned To
              </label>
              <p className="text-gray-700 mt-1">
                {assignedUser ? assignedUser.name : task.assignedTo}
              </p>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-600">Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.createdAt && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Created
              </label>
              <p className="text-gray-700 mt-1">
                {new Date(task.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
