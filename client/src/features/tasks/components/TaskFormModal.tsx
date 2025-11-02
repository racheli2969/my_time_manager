/**
 * Task Form Modal Component
 * Form for creating and editing tasks
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task } from '../../../types';
import { useUser } from '../../../core/contexts/UserContext';
import { useTeam } from '../../../core/contexts/TeamContext';

interface TaskFormModalProps {
  task?: Task | null;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => void;
  onCancel: () => void;
}

/**
 * Modal form for creating or editing a task
 */
export const TaskFormModal: React.FC<TaskFormModalProps> = ({ task, onSave, onCancel }) => {
  const { users, currentUser } = useUser();
  const { teams } = useTeam();

  // Default dueDate to today
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: todayStr,
    estimatedDuration: 60,
    priority: 'medium' as Task['priority'],
    status: 'todo' as Task['status'],
    assignedTo: '',
    teamId: '',
    tags: [] as string[]
  });

  // Initialize form with task data or defaults
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: new Date(task.dueDate).toISOString().split('T')[0],
        estimatedDuration: task.estimatedDuration,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo || '',
        teamId: task.teamId || '',
        tags: task.tags || []
      });
    } else {
      // On create, default assignedTo to current user
      if (currentUser) {
        setFormData(prev => ({ ...prev, assignedTo: currentUser.id }));
      }
    }
  }, [task, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let assignedTo = formData.assignedTo;
    if (!assignedTo && currentUser) {
      assignedTo = currentUser.id;
    }

    // Validate assignedTo
    const validUserIds = users.map(u => u.id);
    if (!assignedTo || !validUserIds.includes(assignedTo)) {
      alert('Cannot save task: Assigned user does not exist.');
      return;
    }

    onSave({
      ...formData,
      dueDate: new Date(formData.dueDate),
      assignedTo,
      teamId: formData.teamId || undefined,
      start: new Date()
    });
  };

  // Get available users based on team selection
  const getAvailableUsers = () => {
    if (formData.teamId) {
      const selectedTeam = teams.find(t => t.id === formData.teamId);
      if (selectedTeam) {
        return users.filter(u => selectedTeam.members.includes(u.id));
      }
    }
    // If no team, only show current user
    return currentUser ? [currentUser] : [];
  };

  // Get teams user can assign tasks to
  const getAvailableTeams = () => {
    if (!currentUser) return [];
    return teams.filter(
      team => team.adminId === currentUser.id || team.members.includes(currentUser.id)
    );
  };

  const availableUsers = getAvailableUsers();
  const availableTeams = getAvailableTeams();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {task ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            type="button"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter estimated duration"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value, assignedTo: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Team (Personal Task)</option>
              {availableTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={availableUsers.length === 0}
            >
              {availableUsers.length === 0 ? (
                <option value="">No users available</option>
              ) : (
                availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}{user.id === currentUser?.id ? ' (Me)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
